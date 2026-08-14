import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateDNSContent } from '@/lib/validation'
import { upsertPowerDNSRecord, deletePowerDNSRecord } from '@/lib/powerdns'
import { getFullDomain } from '@/lib/utils'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { subdomain_id, type, content, name: inputName, name_prefix } = body

  if (!subdomain_id || !type || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: subdomain } = await supabase
    .from('subdomains')
    .select('id, name')
    .eq('id', subdomain_id)
    .eq('user_id', user.id)
    .single()

  if (!subdomain) {
    return NextResponse.json({ error: 'Subdomain not found or unauthorized' }, { status: 404 })
  }

  let cleanContent = content.trim()
  if (type === 'CNAME') {
    cleanContent = cleanContent.replace(/\.+$/, "")
  }

  const { valid, error: valError } = validateDNSContent(type, cleanContent)
  if (!valid) {
    return NextResponse.json({ error: valError }, { status: 400 })
  }

  // Quota Safeguard: Allow up to 10 DNS records per subdomain in PowerDNS
  const { count: subdomainRecordCount } = await supabase
    .from('dns_records')
    .select('id', { count: 'exact', head: true })
    .eq('subdomain_id', subdomain.id)

  if (subdomainRecordCount !== null && subdomainRecordCount >= 10) {
    return NextResponse.json(
      { error: 'Maximum limit of 10 DNS records per subdomain reached. Please delete an existing record to create a new one.' },
      { status: 400 }
    )
  }

  const fullDomain = getFullDomain(subdomain.name)
  let recordName = fullDomain
  const rawPrefix = (inputName || name_prefix || '').trim()
  
  if (rawPrefix && rawPrefix !== '@' && rawPrefix.toLowerCase() !== subdomain.name.toLowerCase() && rawPrefix.toLowerCase() !== fullDomain.toLowerCase()) {
    const cleanPrefix = rawPrefix.toLowerCase()
    if (cleanPrefix.endsWith(`.${fullDomain.toLowerCase()}`) || cleanPrefix.endsWith('.arc.bd')) {
      recordName = cleanPrefix
    } else {
      recordName = `${cleanPrefix}.${fullDomain}`
    }
  }

  // For A/CNAME records: replace any existing conflicting records of same name
  if (type !== 'TXT') {
    const { data: existingRecords } = await supabase
      .from('dns_records')
      .select('id, name, type')
      .eq('subdomain_id', subdomain.id)
      .eq('name', recordName)
      .neq('type', 'TXT')

    if (existingRecords && existingRecords.length > 0) {
      for (const rec of existingRecords) {
        try {
          await deletePowerDNSRecord(rec.name, rec.type)
        } catch (e) {
          console.error('[PowerDNS Delete Error]', e)
        }
        await supabase.from('dns_records').delete().eq('id', rec.id)
      }
    }
  }
  
  try {
    // Provision record directly in authoritative PowerDNS Server
    await upsertPowerDNSRecord({
      name: recordName,
      type: type as any,
      content: cleanContent,
      ttl: 300
    })

    const { data: record, error: insertError } = await supabase
      .from('dns_records')
      .insert({
        subdomain_id: subdomain.id,
        type,
        name: recordName,
        content: cleanContent,
        status: 'active'
      })
      .select()
      .single()

    if (insertError) throw insertError

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create_dns',
      resource_type: 'dns_record',
      resource_id: record.id,
      metadata: { type, content: cleanContent }
    })

    return NextResponse.json(record)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create record' }, { status: 500 })
  }
}


