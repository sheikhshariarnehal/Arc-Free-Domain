import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getZoneRecords, upsertPowerDNSRecord, deletePowerDNSRecord } from '@/lib/powerdns'

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

  try {
    const rrsets = await getZoneRecords()
    return NextResponse.json(rrsets || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list PowerDNS records' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
  }

  const body = await request.json()
  const { type, name, content, ttl } = body

  if (!type || !name || !content) {
    return NextResponse.json({ error: 'Missing required fields (type, name, content)' }, { status: 400 })
  }

  try {
    await upsertPowerDNSRecord({
      name,
      type,
      content,
      ttl: ttl || 300
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create PowerDNS record' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const type = searchParams.get('type')

  if (!name || !type) {
    return NextResponse.json({ error: 'Missing name or type parameter' }, { status: 400 })
  }

  try {
    await deletePowerDNSRecord(name, type)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete PowerDNS record' }, { status: 500 })
  }
}
