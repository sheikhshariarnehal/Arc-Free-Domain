/**
 * ARC.BD — Cloudflare DNS API Service
 *
 * Server-side only. Never import this file in client components.
 * Uses scoped API token with DNS write permissions for the arc.bd zone.
 */

const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";

function getConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!apiToken || !zoneId) {
    console.warn(
      "[Cloudflare] Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID. Using mock mode."
    );
    return null;
  }

  return { apiToken, zoneId };
}

function getHeaders(apiToken: string) {
  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };
}

export interface CloudflareDNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  result: T;
}

// ============================================================
// Mock responses for development without Cloudflare credentials
// ============================================================
function mockRecordId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// ============================================================
// DNS Record Operations
// ============================================================

export async function createDNSRecord(params: {
  type: "A" | "CNAME" | "TXT";
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
}): Promise<{ success: boolean; recordId: string | null; error?: string }> {
  const config = getConfig();

  if (!config) {
    // Mock mode
    const id = mockRecordId();
    console.log(`[Cloudflare Mock] Created ${params.type} record: ${params.name} → ${params.content} (id: ${id})`);
    return { success: true, recordId: id };
  }

  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${config.zoneId}/dns_records`,
      {
        method: "POST",
        headers: getHeaders(config.apiToken),
        body: JSON.stringify({
          type: params.type,
          name: params.name,
          content: params.content,
          ttl: params.ttl ?? 1,
          // TXT records cannot be proxied
          proxied: params.type === "TXT" ? false : (params.proxied ?? false),
        }),
      }
    );

    const data: CloudflareResponse<CloudflareDNSRecord> =
      await response.json();

    if (!data.success) {
      const errorMsg = data.errors.map((e) => e.message).join(", ");
      return { success: false, recordId: null, error: errorMsg };
    }

    return { success: true, recordId: data.result.id };
  } catch (error) {
    console.error("[Cloudflare] createDNSRecord error:", error);
    return {
      success: false,
      recordId: null,
      error: "Failed to communicate with Cloudflare",
    };
  }
}

export async function updateDNSRecord(params: {
  recordId: string;
  type: "A" | "CNAME" | "TXT";
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const config = getConfig();

  if (!config) {
    console.log(
      `[Cloudflare Mock] Updated record ${params.recordId}: ${params.type} ${params.name} → ${params.content}`
    );
    return { success: true };
  }

  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${config.zoneId}/dns_records/${params.recordId}`,
      {
        method: "PATCH",
        headers: getHeaders(config.apiToken),
        body: JSON.stringify({
          type: params.type,
          name: params.name,
          content: params.content,
          ttl: params.ttl ?? 1,
          proxied: params.proxied ?? false,
        }),
      }
    );

    const data: CloudflareResponse<CloudflareDNSRecord> =
      await response.json();

    if (!data.success) {
      const errorMsg = data.errors.map((e) => e.message).join(", ");
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (error) {
    console.error("[Cloudflare] updateDNSRecord error:", error);
    return { success: false, error: "Failed to communicate with Cloudflare" };
  }
}

export async function deleteDNSRecord(
  recordId: string
): Promise<{ success: boolean; error?: string }> {
  const config = getConfig();

  if (!config) {
    console.log(`[Cloudflare Mock] Deleted record ${recordId}`);
    return { success: true };
  }

  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${config.zoneId}/dns_records/${recordId}`,
      {
        method: "DELETE",
        headers: getHeaders(config.apiToken),
      }
    );

    const data: CloudflareResponse<{ id: string }> = await response.json();

    if (!data.success) {
      const errorMsg = data.errors.map((e) => e.message).join(", ");
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (error) {
    console.error("[Cloudflare] deleteDNSRecord error:", error);
    return { success: false, error: "Failed to communicate with Cloudflare" };
  }
}

export async function verifyRecordExists(
  recordId: string
): Promise<boolean> {
  const config = getConfig();

  if (!config) {
    return true; // Mock mode always returns true
  }

  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${config.zoneId}/dns_records/${recordId}`,
      {
        method: "GET",
        headers: getHeaders(config.apiToken),
      }
    );

    const data: CloudflareResponse<CloudflareDNSRecord> =
      await response.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function listZoneDNSRecords(): Promise<{ success: boolean; result?: CloudflareDNSRecord[]; error?: string }> {
  const config = getConfig();

  if (!config) {
    return {
      success: true,
      result: [
        { id: "mock_1", type: "A", name: "arc.bd", content: "76.76.21.21", ttl: 1, proxied: true },
        { id: "mock_2", type: "CNAME", name: "www.arc.bd", content: "cname.vercel-dns.com", ttl: 1, proxied: true },
      ],
    };
  }

  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${config.zoneId}/dns_records?per_page=100`,
      {
        method: "GET",
        headers: getHeaders(config.apiToken),
      }
    );

    const data: CloudflareResponse<CloudflareDNSRecord[]> = await response.json();

    if (!data.success) {
      const errorMsg = data.errors.map((e) => e.message).join(", ");
      return { success: false, error: errorMsg };
    }

    return { success: true, result: data.result };
  } catch (error) {
    console.error("[Cloudflare] listZoneDNSRecords error:", error);
    return { success: false, error: "Failed to communicate with Cloudflare" };
  }
}

