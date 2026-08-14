import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jhhgwqgkixiuyoelycak.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const POWERDNS_API_URL = process.env.POWERDNS_API_URL || 'http://98.84.25.233:8081/api/v1/servers/localhost'
const POWERDNS_API_KEY = process.env.POWERDNS_API_KEY || 'arc_powerdns_secure_api_key_2026'
const ROOT_ZONE = 'arc.bd.'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function normalizeCanonicalName(name) {
  const trimmed = name.trim().toLowerCase()
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`
}

function normalizeContent(type, content) {
  let val = content.trim()
  if (type === 'CNAME' || type === 'MX') {
    val = val.endsWith('.') ? val : `${val}.`
  }
  if (type === 'TXT') {
    if (!val.startsWith('"') && !val.endsWith('"')) {
      val = `"${val.replace(/"/g, '\\"')}"`
    }
  }
  return val
}

async function syncAll() {
  console.log('Fetching active DNS records from Supabase...')
  const { data: records, error } = await supabase
    .from('dns_records')
    .select('*, subdomains (name, status)')

  if (error) {
    console.error('Supabase query error:', error)
    return
  }

  console.log(`Found ${records.length} records. Syncing to PowerDNS...`)

  const rrsets = []

  // Ensure baseline records (NS, SOA, apex A, www CNAME)
  rrsets.push({
    name: 'ns1.arc.bd.',
    type: 'A',
    ttl: 300,
    changetype: 'REPLACE',
    records: [{ content: '98.84.25.233', disabled: false }]
  })
  rrsets.push({
    name: 'ns2.arc.bd.',
    type: 'A',
    ttl: 300,
    changetype: 'REPLACE',
    records: [{ content: '98.84.25.233', disabled: false }]
  })
  rrsets.push({
    name: 'arc.bd.',
    type: 'NS',
    ttl: 300,
    changetype: 'REPLACE',
    records: [
      { content: 'ns1.arc.bd.', disabled: false },
      { content: 'ns2.arc.bd.', disabled: false }
    ]
  })
  rrsets.push({
    name: 'arc.bd.',
    type: 'SOA',
    ttl: 300,
    changetype: 'REPLACE',
    records: [{ content: 'ns1.arc.bd. hostmaster.arc.bd. 2026081401 10800 3600 604800 300', disabled: false }]
  })
  rrsets.push({
    name: 'arc.bd.',
    type: 'A',
    ttl: 300,
    changetype: 'REPLACE',
    records: [{ content: '98.84.25.233', disabled: false }]
  })
  rrsets.push({
    name: 'www.arc.bd.',
    type: 'CNAME',
    ttl: 300,
    changetype: 'REPLACE',
    records: [{ content: 'arc.bd.', disabled: false }]
  })

  // Add user records
  for (const rec of records) {
    if (!rec.name || !rec.type || !rec.content) continue
    rrsets.push({
      name: normalizeCanonicalName(rec.name),
      type: rec.type.toUpperCase(),
      ttl: rec.ttl || 300,
      changetype: 'REPLACE',
      records: [
        {
          content: normalizeContent(rec.type, rec.content),
          disabled: false
        }
      ]
    })
  }

  const res = await fetch(`${POWERDNS_API_URL}/zones/${ROOT_ZONE}`, {
    method: 'PATCH',
    headers: {
      'X-API-Key': POWERDNS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rrsets })
  })

  if (res.status === 204 || res.ok) {
    console.log(`✅ Successfully synced ${rrsets.length} RRsets to PowerDNS!`)
  } else {
    const txt = await res.text()
    console.error(`❌ PowerDNS error (${res.status}):`, txt)
  }
}

syncAll()
