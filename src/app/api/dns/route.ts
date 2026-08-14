import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateDNSContent } from '@/lib/validation'
import { createDNSRecord, deleteDNSRecord } from '@/lib/cloudflare'
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

  let cleanContent = content.trim()
  if (type === 'CNAME') {
    cleanContent = cleanContent.replace(/\.+$/, "")
  }

  const { valid, error: valError } = validateDNSContent(type, cleanContent)
  if (!valid) {
    return NextResponse.json({ error: valError }, { status: 400 })
  }

  // Quota Safeguard: Limit to max 3 DNS records per subdomain to preserve Cloudflare 200 zone limit
  const { count: subdomainRecordCount } = await supabase
    .from('dns_records')
    .select('id', { count: 'exact', head: true })
    .eq('subdomain_id', subdomain.id)

  if (subdomainRecordCount !== null && subdomainRecordCount >= 3) {
    return NextResponse.json(
      { error: 'Maximum limit of 3 DNS records per subdomain reached. Please delete an existing record to create a new one.' },
      { status: 400 }
    )
  }

  // For A/CNAME records: replace any existing routing records (they conflict)
  // For TXT records: coexist — TXT is used for verification and stacks alongside routing records
  if (type !== 'TXT') {
    const { data: existingRecords } = await supabase
      .from('dns_records')
      .select('id, cloudflare_record_id')
      .eq('subdomain_id', subdomain.id)
      .neq('type', 'TXT')

    if (existingRecords && existingRecords.length > 0) {
      for (const rec of existingRecords) {
        if (rec.cloudflare_record_id) {
          try {
            await deleteDNSRecord(rec.cloudflare_record_id)
          } catch (e) {
            console.error('[Cloudflare Delete Error]', e)
          }
        }
        await supabase.from('dns_records').delete().eq('id', rec.id)
      }
    }
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
  
  try {
    // Wildcard *.arc.bd already routes all traffic to this app, and the
    // middleware resolves A/CNAME "routing" targets straight from this table
    // (see resolve_subdomain_target RPC) to reverse-proxy the request. A real
    // Cloudflare record is therefore redundant for A/CNAME and would only
    // burn through the zone's 200-record hard limit as usage grows.
    //
    // TXT records are the exception: they're looked up directly over public
    // DNS by third parties (e.g. Google Search Console, domain verification
    // flows) rather than through our app, so they still need a real record.
    let cloudflareRecordId: string | null = null
    if (type === 'TXT') {
      const cfResult = await createDNSRecord({ type, name: recordName, content: cleanContent })

      if (!cfResult.success || !cfResult.recordId) {
        throw new Error(cfResult.error || 'Cloudflare failed to return record ID')
      }
      cloudflareRecordId = cfResult.recordId
    }

    const { data: record, error: insertError } = await supabase
      .from('dns_records')
      .insert({
        subdomain_id: subdomain.id,
        type,
        name: recordName,
        content: cleanContent,
        cloudflare_record_id: cloudflareRecordId,
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


