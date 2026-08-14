import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { sendClaimApprovedEmail, sendClaimRejectedEmail } from '@/lib/email'

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
  const limit = parseInt(searchParams.get('limit') || '50')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''

  const supabaseAdmin = await createAdminClient()
  let query = supabaseAdmin
    .from('subdomains')
    .select(`
      *,
      profiles (id, email, name, avatar_url)
    `, { count: 'exact' })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
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
  const { id, status, reason } = body

  if (!id || !['active', 'suspended', 'pending', 'deleted'].includes(status)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const supabaseAdmin = await createAdminClient()

  // Fetch current subdomain and owner profile
  const { data: currentSubdomain } = await supabaseAdmin
    .from('subdomains')
    .select('*, profiles (id, email, name)')
    .eq('id', id)
    .single()

  if (!currentSubdomain) {
    return NextResponse.json({ error: 'Subdomain not found' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('subdomains')
    .update({ status })
    .eq('id', id)
    .select('*, profiles (id, email, name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ownerProfile = currentSubdomain.profiles as { id: string; email: string; name?: string } | null
  const userEmail = ownerProfile?.email
  const userName = ownerProfile?.name || userEmail?.split('@')[0]

  // If transitioning to 'active' (Approval), dispatch confirmation email and unlock notification
  if (status === 'active' && currentSubdomain.status !== 'active') {
    if (userEmail) {
      try {
        await sendClaimApprovedEmail({
          to: userEmail,
          userName,
          domainName: data.name,
          fullDomain: data.full_domain,
          domainId: data.id,
        })
      } catch (mailErr) {
        console.error('[Admin Approve Email Error]', mailErr)
      }
    }
  } else if (status === 'suspended' && currentSubdomain.status === 'pending') {
    // If rejected from pending state
    if (userEmail) {
      try {
        await sendClaimRejectedEmail({
          to: userEmail,
          userName,
          domainName: data.name,
          fullDomain: data.full_domain,
          reason: reason || 'Domain claim did not meet platform guidelines.',
        })
      } catch (mailErr) {
        console.error('[Admin Reject Email Error]', mailErr)
      }
    }
  }

  await supabaseAdmin.from('audit_logs').insert({
    user_id: adminId,
    action: `admin_${status}_subdomain`,
    resource_type: 'subdomain',
    resource_id: id,
    metadata: {
      previous_status: currentSubdomain.status,
      new_status: status,
      target_user_id: currentSubdomain.user_id,
      target_domain: currentSubdomain.full_domain,
      reason
    }
  })

  return NextResponse.json(data)
}

