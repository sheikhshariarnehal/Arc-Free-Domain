import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateSubdomainName } from '@/lib/validation'
import { getFullDomain } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')?.toLowerCase()

  if (!name) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 })
  }

  const { valid, error } = validateSubdomainName(name)
  if (!valid) {
    return NextResponse.json({ name, available: false, reason: error }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: reserved } = await supabase
    .from('reserved_subdomains')
    .select('id')
    .eq('name', name)
    .single()

  if (reserved) {
    return NextResponse.json({ name, available: false, reason: 'Reserved name' })
  }

  const { data: existing } = await supabase
    .from('subdomains')
    .select('id, status')
    .eq('name', name)
    .in('status', ['active', 'pending', 'suspended'])
    .single()

  if (existing) {
    return NextResponse.json({ name, available: false, reason: 'Already taken' })
  }

  return NextResponse.json({ name, domain: getFullDomain(name), available: true })
}
