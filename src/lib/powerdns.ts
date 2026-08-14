/**
 * ARC.BD — PowerDNS Authoritative Server Client
 *
 * Interacts with PowerDNS v1 REST API for dynamic, zero-limit DNS record provisioning.
 */

const POWERDNS_PRIMARY_URL =
  process.env.POWERDNS_API_URL || "http://arc-powerdns:8081/api/v1/servers/localhost";
const POWERDNS_API_KEY =
  process.env.POWERDNS_API_KEY || "arc_powerdns_secure_api_key_2026";
const ROOT_ZONE = (process.env.NEXT_PUBLIC_DOMAIN || "arc.bd").toLowerCase();

export interface DNSRecordInput {
  name: string; // e.g. "nehal.arc.bd" or "_vercel.nehal.arc.bd"
  type: "A" | "AAAA" | "CNAME" | "TXT" | "MX";
  content: string; // e.g. "cname.vercel-dns.com" or "1.2.3.4"
  ttl?: number;
  priority?: number;
}

function normalizeCanonicalName(name: string): string {
  const trimmed = name.trim().toLowerCase();
  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
}

function normalizeContent(type: string, content: string): string {
  let val = content.trim();
  if (type === "CNAME" || type === "MX") {
    val = val.endsWith(".") ? val : `${val}.`;
  }
  if (type === "TXT") {
    // PowerDNS TXT records must be enclosed in quotes if not already
    if (!val.startsWith('"') && !val.endsWith('"')) {
      val = `"${val.replace(/"/g, '\\"')}"`;
    }
  }
  return val;
}

const CANDIDATE_URLS = [
  POWERDNS_PRIMARY_URL,
  "http://arc-powerdns:8081/api/v1/servers/localhost",
  "http://172.17.0.1:8081/api/v1/servers/localhost",
  "http://172.18.0.1:8081/api/v1/servers/localhost",
  "http://127.0.0.1:8081/api/v1/servers/localhost",
];

/**
 * Perform authenticated request to PowerDNS REST API with resilient failover
 */
async function pdnsFetch(endpoint: string, options: RequestInit = {}) {
  let lastError: Error | null = null;
  const uniqueUrls = Array.from(new Set(CANDIDATE_URLS));

  for (const baseUrl of uniqueUrls) {
    try {
      const url = `${baseUrl}${endpoint}`;
      const res = await fetch(url, {
        ...options,
        headers: {
          "X-API-Key": POWERDNS_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(options.headers || {}),
        },
        signal: AbortSignal.timeout(4000),
        cache: "no-store",
      });

      if (!res.ok && res.status !== 204) {
        const errorText = await res.text().catch(() => res.statusText);
        throw new Error(`PowerDNS API Error (${res.status}): ${errorText}`);
      }

      if (res.status === 204) {
        return null;
      }

      return await res.json().catch(() => null);
    } catch (e: any) {
      lastError = e;
      // Continue to next candidate URL
    }
  }

  throw lastError || new Error("Failed to connect to PowerDNS REST API");
}

/**
 * Ensure the authoritative zone (e.g. "arc.bd.") exists in PowerDNS
 */
export async function ensureZoneExists(zone: string = ROOT_ZONE) {
  const canonicalZone = normalizeCanonicalName(zone);
  try {
    const existing = await pdnsFetch(`/zones/${canonicalZone}`);
    if (existing) return existing;
  } catch (e) {
    // Zone doesn't exist yet, create it
  }

  return await pdnsFetch("/zones", {
    method: "POST",
    body: JSON.stringify({
      name: canonicalZone,
      kind: "Native",
      nameservers: [`ns1.${canonicalZone}`, `ns2.${canonicalZone}`],
    }),
  });
}

/**
 * Create or replace an RRset for a given name and type
 */
export async function upsertPowerDNSRecord(
  record: DNSRecordInput,
  zone: string = ROOT_ZONE
) {
  const canonicalZone = normalizeCanonicalName(zone);
  const canonicalName = normalizeCanonicalName(record.name);
  const formattedContent = normalizeContent(record.type, record.content);
  const ttl = record.ttl || 300;

  const payload = {
    rrsets: [
      {
        name: canonicalName,
        type: record.type.toUpperCase(),
        ttl: ttl,
        changetype: "REPLACE",
        records: [
          {
            content: formattedContent,
            disabled: false,
          },
        ],
      },
    ],
  };

  return await pdnsFetch(`/zones/${canonicalZone}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete an RRset completely for a given name and type
 */
export async function deletePowerDNSRecord(
  name: string,
  type: string,
  zone: string = ROOT_ZONE
) {
  const canonicalZone = normalizeCanonicalName(zone);
  const canonicalName = normalizeCanonicalName(name);

  const payload = {
    rrsets: [
      {
        name: canonicalName,
        type: type.toUpperCase(),
        changetype: "DELETE",
      },
    ],
  };

  return await pdnsFetch(`/zones/${canonicalZone}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch all active records for a specific zone
 */
export async function getZoneRecords(zone: string = ROOT_ZONE) {
  const canonicalZone = normalizeCanonicalName(zone);
  const data = await pdnsFetch(`/zones/${canonicalZone}`);
  return data?.rrsets || [];
}
