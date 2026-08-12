import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listZoneDNSRecords, createDNSRecord, deleteDNSRecord } from '@/lib/cloudflare'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null
  return user
}

export async function GET() {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
  }

  const res = await listZoneDNSRecords()
  if (!res.success) {
    return NextResponse.json({ error: res.error || 'Failed to list Cloudflare records' }, { status: 500 })
  }

  return NextResponse.json(res.result || [])
}

export async function POST(request: Request) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
  }

  const body = await request.json()
  const { type, name, content } = body

  if (!type || !name || !content) {
    return NextResponse.json({ error: 'Missing required fields (type, name, content)' }, { status: 400 })
  }

  const res = await createDNSRecord({ type, name, content })
  if (!res.success) {
    return NextResponse.json({ error: res.error || 'Failed to create Cloudflare record' }, { status: 500 })
  }

  return NextResponse.json({ success: true, recordId: res.recordId })
}

export async function DELETE(request: Request) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing record id' }, { status: 400 })
  }

  const res = await deleteDNSRecord(id)
  if (!res.success) {
    return NextResponse.json({ error: res.error || 'Failed to delete Cloudflare record' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
