import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  getZoneDetails,
  getZoneRecords,
  getServerInfo,
  getServerStats,
  upsertPowerDNSRecord,
  deletePowerDNSRecord,
} from '@/lib/powerdns'
import dns from 'dns'

const resolver = new dns.promises.Resolver()
// Point resolver directly to VPS Authoritative DNS IP
const VPS_DNS_IP = process.env.POWERDNS_HOST_IP || '98.84.25.233'
try {
  resolver.setServers([VPS_DNS_IP, '127.0.0.1'])
} catch (e) {
  // Ignore fallback
}

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
    const [zoneData, serverInfo, serverStats] = await Promise.all([
      getZoneDetails().catch(() => null),
      getServerInfo().catch(() => null),
      getServerStats().catch(() => ({})),
    ])

    const rrsets = zoneData?.rrsets || []

    return NextResponse.json({
      success: true,
      zone: {
        id: zoneData?.id || 'arc.bd.',
        name: zoneData?.name || 'arc.bd.',
        kind: zoneData?.kind || 'Native',
        serial: zoneData?.serial || 0,
        edited_serial: zoneData?.edited_serial || 0,
        account: zoneData?.account || '',
      },
      server: {
        version: serverInfo?.version || '4.9.17',
        daemon_type: serverInfo?.daemon_type || 'authoritative',
        url: serverInfo?.url || '/api/v1/servers/localhost',
      },
      stats: serverStats || {},
      rrsets: rrsets,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch PowerDNS telemetry' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await checkAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const { action } = body

  // Action: Live DNS Resolver Test
  if (action === 'test-resolve') {
    const { name, type = 'A' } = body
    if (!name) {
      return NextResponse.json({ error: 'Domain name is required for DNS test' }, { status: 400 })
    }

    const cleanDomain = name.trim().toLowerCase().replace(/\.+$/, '')
    const startTime = Date.now()

    try {
      let resolvedAnswers: string[] = []
      const recType = type.toUpperCase()

      if (recType === 'A') {
        resolvedAnswers = await resolver.resolve4(cleanDomain)
      } else if (recType === 'AAAA') {
        resolvedAnswers = await resolver.resolve6(cleanDomain)
      } else if (recType === 'CNAME') {
        resolvedAnswers = await resolver.resolveCname(cleanDomain)
      } else if (recType === 'TXT') {
        const txtRecords = await resolver.resolveTxt(cleanDomain)
        resolvedAnswers = txtRecords.map((chunk: string[]) => chunk.join(' '))
      } else if (recType === 'NS') {
        resolvedAnswers = await resolver.resolveNs(cleanDomain)
      } else if (recType === 'MX') {
        const mxRecords = await resolver.resolveMx(cleanDomain)
        resolvedAnswers = mxRecords.map((m: any) => `${m.priority} ${m.exchange}`)
      } else if (recType === 'SOA') {
        const soa = await resolver.resolveSoa(cleanDomain)
        resolvedAnswers = [`${soa.nsname} ${soa.hostmaster} ${soa.serial}`]
      } else {
        resolvedAnswers = await resolver.resolve4(cleanDomain)
      }

      const latencyMs = Date.now() - startTime

      return NextResponse.json({
        success: true,
        domain: cleanDomain,
        type: recType,
        server: VPS_DNS_IP,
        latencyMs,
        status: 'NOERROR',
        answers: resolvedAnswers,
      })
    } catch (err: any) {
      const latencyMs = Date.now() - startTime
      return NextResponse.json({
        success: false,
        domain: cleanDomain,
        type,
        server: VPS_DNS_IP,
        latencyMs,
        code: err.code || 'NXDOMAIN_OR_ERROR',
        error: err.message || 'DNS query failed or host not found',
      })
    }
  }

  // Action: Sync all Supabase DNS records to PowerDNS
  if (action === 'sync-supabase') {
    try {
      const supabaseAdmin = await createAdminClient()
      const { data: records, error: dbError } = await supabaseAdmin
        .from('dns_records')
        .select('*')

      if (dbError) {
        throw new Error(dbError.message)
      }

      let syncedCount = 0
      for (const rec of (records || [])) {
        if (!rec.name || !rec.type || !rec.content) continue
        await upsertPowerDNSRecord({
          name: rec.name,
          type: rec.type,
          content: rec.content,
          ttl: rec.ttl || 300,
        })
        syncedCount++
      }

      return NextResponse.json({
        success: true,
        syncedCount,
        totalFound: records?.length || 0,
      })
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Failed to sync Supabase records' }, { status: 500 })
    }
  }

  // Default Action: Create or Update a single DNS Record
  const { type, name, content, ttl } = body

  if (!type || !name || !content) {
    return NextResponse.json({ error: 'Missing required fields (type, name, content)' }, { status: 400 })
  }

  try {
    await upsertPowerDNSRecord({
      name,
      type,
      content,
      ttl: ttl || 300,
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

