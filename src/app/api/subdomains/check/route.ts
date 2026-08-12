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

  // Use the SECURITY DEFINER RPC — it runs as superuser server-side,
  // bypassing RLS entirely regardless of the caller's auth state.
  // This ensures anonymous users get accurate availability results.
  const supabase = await createClient()
  const { data, error: rpcError } = await supabase
    .rpc('check_subdomain_availability', { subdomain_name: name })

  if (rpcError) {
    console.error('[check availability RPC error]', rpcError)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }

  const result = data as { available: boolean; reason?: string }

  if (!result.available) {
    return NextResponse.json({ name, available: false, reason: result.reason || 'Already taken' })
  }

  return NextResponse.json({ name, domain: getFullDomain(name), available: true })
}
