import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateSubdomainName } from '@/lib/validation'
import { getFullDomain } from '@/lib/utils'
import { sendClaimPendingEmail } from '@/lib/email'

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

  // Resolve user identity
  const userEmail = user.email || user.user_metadata?.email || ''
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || (userEmail ? userEmail.split('@')[0] : 'Developer')

  // Ensure profile row exists in public.profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, email, name')
    .eq('id', userId)
    .single()

  if (!existingProfile) {
    await supabase.from('profiles').upsert({
      id: userId,
      email: userEmail,
      name: userName,
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

  // Insert subdomain with 'pending' status — locked until admin confirms the request
  const { data: subdomain, error: insertError } = await supabase
    .from('subdomains')
    .insert({ user_id: userId, name, full_domain: fullDomain, status: 'pending' })
    .select()
    .single()

  if (insertError || !subdomain) {
    console.error('[Claim Subdomain Error]', insertError)
    if (insertError?.code === '23505' || insertError?.message?.includes('unique')) {
      return NextResponse.json({ error: `"${name}.arc.bd" is already taken.` }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to register subdomain. Please try again.' }, { status: 500 })
  }

  // Send transactional email confirming claim receipt & pending review
  const recipientEmail = userEmail || existingProfile?.email
  if (recipientEmail) {
    try {
      const emailResult = await sendClaimPendingEmail({
        to: recipientEmail,
        userName: existingProfile?.name || userName,
        domainName: name,
        fullDomain,
      })
      if (!emailResult.success) {
        console.warn('[Claim Pending Email Warning]', emailResult.error)
      }
    } catch (mailErr) {
      console.error('[Claim Pending Email Error]', mailErr)
    }
  } else {
    console.warn('[Claim Pending Email] No recipient email found for user', userId)
  }

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'claim_subdomain_pending',
    resource_type: 'subdomain',
    resource_id: subdomain.id,
    metadata: { name, fullDomain, status: 'pending' }
  })

  return NextResponse.json(subdomain)
}



