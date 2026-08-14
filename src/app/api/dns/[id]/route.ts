import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateDNSContent } from '@/lib/validation'
import { upsertPowerDNSRecord, deletePowerDNSRecord } from '@/lib/powerdns'
import { createDNSRecord, deleteDNSRecord } from '@/lib/cloudflare'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { type, content } = body

  const { data: record } = await supabase
    .from('dns_records')
    .select('*, subdomains (user_id, name)')
    .eq('id', id)
    .single()

  if (!record || record.subdomains.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  const newType = type || record.type
  let newContent = content || record.content
  if (newType === 'CNAME') {
    newContent = newContent.trim().replace(/\.+$/, "")
  }

  const { valid, error: valError } = validateDNSContent(newType, newContent)
  if (!valid) return NextResponse.json({ error: valError }, { status: 400 })

  try {
    // If type changed, delete the old RRset from PowerDNS first
    if (newType !== record.type) {
      try {
        await deletePowerDNSRecord(record.name, record.type)
      } catch (e) {
        console.error('[PowerDNS Delete Old Error]', e)
      }
    }

    // Upsert the updated record to PowerDNS
    try {
      await upsertPowerDNSRecord({
        name: record.name,
        type: newType,
        content: newContent,
        ttl: record.ttl || 300,
      })
    } catch (e) {
      console.error('[PowerDNS Update Error]', e)
    }

    // Sync to Cloudflare
    let cfRecordId = record.cloudflare_record_id
    if (cfRecordId) {
      try {
        await deleteDNSRecord(cfRecordId)
      } catch (e) {
        console.error('[Cloudflare Delete Old Error]', e)
      }
    }
    try {
      const cfRes = await createDNSRecord({
        type: newType,
        name: record.name,
        content: newContent,
        ttl: 1,
        proxied: false
      })
      if (cfRes.success && cfRes.recordId) {
        cfRecordId = cfRes.recordId
      }
    } catch (e) {
      console.error('[Cloudflare Create Updated Error]', e)
    }

    const { data: updatedRecord, error: updateError } = await supabase
      .from('dns_records')
      .update({ type: newType, content: newContent, cloudflare_record_id: cfRecordId })
      .eq('id', record.id)
      .select()
      .single()

    if (updateError) throw updateError

    await supabase.from('audit_logs').insert({
      user_id: user.id,
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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: record } = await supabase
    .from('dns_records')
    .select('*, subdomains (user_id)')
    .eq('id', id)
    .single()

  if (!record || record.subdomains.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  try {
    // 1. Delete record from PowerDNS
    try {
      await deletePowerDNSRecord(record.name, record.type)
    } catch (e) {
      console.error('[PowerDNS Delete Error]', e)
    }

    // 2. Delete record from Cloudflare
    if (record.cloudflare_record_id) {
      try {
        await deleteDNSRecord(record.cloudflare_record_id)
      } catch (e) {
        console.error('[Cloudflare Delete Error]', e)
      }
    }

    await supabase.from('dns_records').delete().eq('id', record.id)

    await supabase.from('audit_logs').insert({
      user_id: user.id,
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


