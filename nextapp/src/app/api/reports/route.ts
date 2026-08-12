import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { subdomain, reporter_email, category, details } = body

  if (!subdomain || !reporter_email || !category || !details) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('abuse_reports')
    .insert({
      subdomain,
      reporter_email,
      category,
      details,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }

  return NextResponse.json(data)
}
