import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteDNSRecord } from '@/lib/cloudflare'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: subdomain, error } = await supabase
    .from('subdomains')
    .select(`
      *,
      dns_records (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !subdomain) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(subdomain)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: subdomain } = await supabase
    .from('subdomains')
    .select('id, name, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!subdomain) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: dnsRecords } = await supabase
    .from('dns_records')
    .select('name, type')
    .eq('subdomain_id', subdomain.id)

  if (dnsRecords) {
    const { deletePowerDNSRecord } = await import('@/lib/powerdns')
    for (const record of dnsRecords) {
      try {
        await deletePowerDNSRecord(record.name, record.type)
      } catch (e) {
        console.error('Failed to delete PowerDNS record', e)
      }
    }
  }

  await supabase
    .from('dns_records')
    .delete()
    .eq('subdomain_id', subdomain.id)

  await supabase
    .from('subdomains')
    .update({ status: 'deleted' })
    .eq('id', subdomain.id)

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'delete_subdomain',
    resource_type: 'subdomain',
    resource_id: subdomain.id,
    metadata: { name: subdomain.name }
  })

  return NextResponse.json({ success: true })
}


