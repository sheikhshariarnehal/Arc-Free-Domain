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
  const search = searchParams.get('search') || ''

  const adminDb = await createAdminClient()
  let query = adminDb
    .from('profiles')
    .select(`
      *,
      subdomains (count)
    `)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
  }

  const { data: users, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(users)
}

export async function PATCH(request: Request) {
  const adminId = await checkAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, role } = body

  if (!id || !['user', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const adminDb = await createAdminClient()
  const { data, error } = await adminDb
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await adminDb.from('audit_logs').insert({
    user_id: adminId,
    action: `admin_update_user_role`,
    resource_type: 'profile',
    resource_id: id,
    metadata: { new_role: role }
  })

  return NextResponse.json(data)
}
