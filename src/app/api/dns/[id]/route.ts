import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateDNSContent } from '@/lib/validation'
import { updateDNSRecord, deleteDNSRecord } from '@/lib/cloudflare'
import { getFullDomain } from '@/lib/utils'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { type, content } = body

  const { data: record } = await supabase
    .from('dns_records')
    .select('*, subdomains (user_id, name)')
    .eq('id', id)
    .single()

  if (!record || record.subdomains.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  const newType = type || record.type
  const newContent = content || record.content

  const { valid, error: valError } = validateDNSContent(newType, newContent)
  if (!valid) return NextResponse.json({ error: valError }, { status: 400 })

  const fullDomain = getFullDomain(record.subdomains.name)
  const cfRecordId = record.cloudflare_record_id || record.cf_record_id

  try {
    // Only TXT records live in Cloudflare (see POST handler for rationale).
    // A/CNAME routing records are resolved by the app itself, so they're
    // never pushed to Cloudflare going forward.
    let cloudflareRecordId: string | null = cfRecordId ?? null

    if (newType === 'TXT') {
      if (cfRecordId) {
        await updateDNSRecord({ recordId: cfRecordId, name: fullDomain, type: newType, content: newContent })
      }
    } else if (cfRecordId) {
      // Type changed away from TXT (or a legacy record still has a stale
      // Cloudflare record) — remove the now-redundant Cloudflare record and
      // reclaim the zone's record quota.
      try {
        await deleteDNSRecord(cfRecordId)
      } catch (e) {
        console.error('[Cloudflare Delete Error]', e)
      }
      cloudflareRecordId = null
    }

    const { data: updatedRecord, error: updateError } = await supabase
      .from('dns_records')
      .update({ type: newType, content: newContent, cloudflare_record_id: cloudflareRecordId })
      .eq('id', record.id)
      .select()
      .single()

    if (updateError) throw updateError

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'update_dns',
      resource_type: 'dns_record',
      resource_id: record.id,
      metadata: { type: newType, content: newContent }
    })

    return NextResponse.json(updatedRecord)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update record' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: record } = await supabase
    .from('dns_records')
    .select('*, subdomains (user_id)')
    .eq('id', id)
    .single()

  if (!record || record.subdomains.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  try {
    const cfRecordId = record.cloudflare_record_id || record.cf_record_id
    if (cfRecordId) {
      await deleteDNSRecord(cfRecordId)
    }
    await supabase.from('dns_records').delete().eq('id', record.id)

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'delete_dns',
      resource_type: 'dns_record',
      resource_id: record.id,
      metadata: { type: record.type, content: record.content }
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete record' }, { status: 500 })
  }
}

