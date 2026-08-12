import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

function getCFConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  if (!apiToken || !zoneId) return null
  return { apiToken, zoneId }
}

async function requireAdmin() {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

// GET — list root-zone DNS records from Cloudflare
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const config = getCFConfig()
  if (!config) return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 500 })

  const res = await fetch(
    `${CLOUDFLARE_API_BASE}/zones/${config.zoneId}/dns_records?per_page=100`,
    { headers: { Authorization: `Bearer ${config.apiToken}` } }
  )
  const data = await res.json()
  if (!data.success) return NextResponse.json({ error: data.errors?.[0]?.message }, { status: 500 })

  return NextResponse.json(data.result)
}

// POST — add a root-zone DNS record to Cloudflare (e.g. _vercel TXT)
export async function POST(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const config = getCFConfig()
  if (!config) return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 500 })

  const { type, name, content, ttl } = await request.json()
  if (!type || !name || !content) {
    return NextResponse.json({ error: 'type, name and content are required' }, { status: 400 })
  }

  const res = await fetch(
    `${CLOUDFLARE_API_BASE}/zones/${config.zoneId}/dns_records`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, content, ttl: ttl ?? 1, proxied: false }),
    }
  )
  const data = await res.json()
  if (!data.success) return NextResponse.json({ error: data.errors?.[0]?.message }, { status: 500 })

  return NextResponse.json(data.result)
}

// DELETE — remove a root-zone DNS record by CF record ID
export async function DELETE(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const config = getCFConfig()
  if (!config) return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 500 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Record ID required' }, { status: 400 })

  const res = await fetch(
    `${CLOUDFLARE_API_BASE}/zones/${config.zoneId}/dns_records/${id}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${config.apiToken}` } }
  )
  const data = await res.json()
  if (!data.success) return NextResponse.json({ error: data.errors?.[0]?.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
