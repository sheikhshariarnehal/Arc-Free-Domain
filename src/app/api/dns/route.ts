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

  if (!subdomain) {
    return NextResponse.json({ error: 'Subdomain not found or unauthorized' }, { status: 404 })
  }

  const { valid, error: valError } = validateDNSContent(type, content)
  if (!valid) {
    return NextResponse.json({ error: valError }, { status: 400 })
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
    const cfResult = await createDNSRecord({ type, name: recordName, content })
    
    if (!cfResult.success || !cfResult.recordId) {
      throw new Error(cfResult.error || 'Cloudflare failed to return record ID')
    }

    const { data: record, error: insertError } = await supabase
      .from('dns_records')
      .insert({
        subdomain_id: subdomain.id,
        type,
        name: recordName,
        content,
        cloudflare_record_id: cfResult.recordId,
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
      metadata: { type, content }
    })

    return NextResponse.json(record)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create record' }, { status: 500 })
  }
}


