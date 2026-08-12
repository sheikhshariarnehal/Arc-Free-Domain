import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateSubdomainName } from '@/lib/validation'
import { getFullDomain } from '@/lib/utils'
import { createDNSRecord } from '@/lib/cloudflare'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
  }

  const userId = user.id
  const body = await request.json()
  const name = body.name?.toLowerCase()?.trim()

  if (!name) {
    return NextResponse.json({ error: 'Subdomain name is required' }, { status: 400 })
  }

  const { valid, error: validationError } = validateSubdomainName(name)
  if (!valid) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  // Ensure profile row exists in public.profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!existingProfile) {
    await supabase.from('profiles').upsert({
      id: userId,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || '',
    })
  }

  // Check max limit
  const { data: settings } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'max_subdomains_per_user')
    .single()

  const maxSubdomains = settings ? parseInt(String(settings.value).replace(/"/g, '')) : 5

  const { count } = await supabase
    .from('subdomains')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'deleted')

  if (count !== null && count >= maxSubdomains) {
    return NextResponse.json({ error: `You have reached the maximum limit of ${maxSubdomains} subdomains.` }, { status: 403 })
  }

  // Check reserved names
  const { data: reserved } = await supabase
    .from('reserved_subdomains')
    .select('id')
    .eq('name', name)
    .single()

  if (reserved) {
    return NextResponse.json({ error: `"${name}" is a reserved system domain name.` }, { status: 400 })
  }

  // Check if taken
  const { data: existing } = await supabase
    .from('subdomains')
    .select('id')
    .eq('name', name)
    .in('status', ['active', 'pending', 'suspended'])
    .single()

  if (existing) {
    return NextResponse.json({ error: `"${name}.arc.bd" is already taken.` }, { status: 400 })
  }

  const fullDomain = getFullDomain(name)

  // Insert subdomain
  const { data: subdomain, error: insertError } = await supabase
    .from('subdomains')
    .insert({ user_id: userId, name, full_domain: fullDomain, status: 'pending' })
    .select()
    .single()

  if (insertError || !subdomain) {
    console.error('[Claim Subdomain Error]', insertError)
    return NextResponse.json({ error: insertError?.message || 'Failed to register subdomain in database' }, { status: 500 })
  }

  try {
    // Provision initial A record in Cloudflare
    const cfResult = await createDNSRecord({ type: 'A', name: fullDomain, content: '192.0.2.1' })

    const { data: activeSubdomain } = await supabase
      .from('subdomains')
      .update({ status: 'active' })
      .eq('id', subdomain.id)
      .select()
      .single()

    if (cfResult.success && cfResult.recordId) {
      await supabase.from('dns_records').insert({
        subdomain_id: subdomain.id,
        type: 'A',
        name: fullDomain,
        content: '192.0.2.1',
        cloudflare_record_id: cfResult.recordId,
        status: 'active'
      })
    }

    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'claim_subdomain',
      resource_type: 'subdomain',
      resource_id: subdomain.id,
      metadata: { name, fullDomain }
    })

    return NextResponse.json(activeSubdomain || subdomain)
  } catch (err: any) {
    console.error('[Cloudflare Provisioning Error]', err)
    await supabase.from('subdomains').update({ status: 'active' }).eq('id', subdomain.id)
    return NextResponse.json(subdomain)
  }
}


