import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminDb = await createAdminClient()
  const { data: profile } = await adminDb.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user.id
}

export async function GET(request: Request) {
  const adminId = await checkAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''

  const supabaseAdmin = await createAdminClient()
  let query = supabaseAdmin.from('subdomains').select('*', { count: 'exact' })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, count, error } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count })
}

export async function PATCH(request: Request) {
  const adminId = await checkAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, status } = body

  if (!id || !['active', 'suspended'].includes(status)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const supabaseAdmin = await createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('subdomains')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('audit_logs').insert({
    user_id: adminId,
    action: `admin_${status}_subdomain`,
    resource_type: 'subdomain',
    resource_id: id,
    metadata: { new_status: status }
  })

  return NextResponse.json(data)
}
