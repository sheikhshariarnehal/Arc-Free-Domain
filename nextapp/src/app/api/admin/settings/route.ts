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

export async function GET() {
  const adminId = await checkAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabaseAdmin = await createAdminClient()
  const { data, error } = await supabaseAdmin.from('system_settings').select('*').order('key')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const adminId = await checkAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { key, value } = body

  if (!key || value === undefined) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

  const supabaseAdmin = await createAdminClient()
  
  // Upsert the setting
  const { data, error } = await supabaseAdmin
    .from('system_settings')
    .upsert({ key, value })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('audit_logs').insert({
    user_id: adminId,
    action: 'admin_update_setting',
    resource_type: 'system_settings',
    resource_id: key,
    metadata: { key, value }
  })

  return NextResponse.json(data)
}
