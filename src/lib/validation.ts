/**
 * ARC.BD — Validation Utilities
 *
 * Shared validation logic for subdomain names, DNS record targets, etc.
 */

const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const HOSTNAME_REGEX =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

// Private/reserved IP ranges that should be rejected for A records
const BLOCKED_IP_PREFIXES = [
  "127.", // Loopback
  "0.", // Current network
  "10.", // Private Class A
  "192.168.", // Private Class C
  "169.254.", // Link-local
  "224.", // Multicast
  "255.", // Broadcast
];

const BLOCKED_IP_RANGES_172 = { start: 16, end: 31 }; // 172.16.0.0 - 172.31.255.255

// Domains that should not be used as CNAME targets
const BLOCKED_CNAME_TARGETS = ["arc.bd", "www.arc.bd"];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a subdomain name
 */
export function validateSubdomainName(
  name: string,
  minLength = 3,
  maxLength = 32
): ValidationResult {
  if (!name) {
    return { valid: false, error: "Subdomain name is required" };
  }

  const normalized = name.toLowerCase().trim();

  if (normalized.length < minLength) {
    return {
      valid: false,
      error: `Name must be at least ${minLength} characters`,
    };
  }

  if (normalized.length > maxLength) {
    return {
      valid: false,
      error: `Name must be at most ${maxLength} characters`,
    };
  }

  if (!SUBDOMAIN_REGEX.test(normalized)) {
    if (normalized.startsWith("-")) {
      return { valid: false, error: "Name cannot start with a hyphen" };
    }
    if (normalized.endsWith("-")) {
      return { valid: false, error: "Name cannot end with a hyphen" };
    }
    return {
      valid: false,
      error: "Name can only contain lowercase letters, numbers, and hyphens",
    };
  }

  return { valid: true };
}

/**
 * Validate an IPv4 address for A records
 */
export function validateIPv4(ip: string): ValidationResult {
  if (!ip) {
    return { valid: false, error: "IP address is required" };
  }

  const trimmed = ip.trim();

  if (!IPV4_REGEX.test(trimmed)) {
    return { valid: false, error: "Invalid IPv4 address format" };
  }

  // Block private and reserved ranges
  for (const prefix of BLOCKED_IP_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return {
        valid: false,
        error: "Private and reserved IP addresses are not allowed",
      };
    }
  }

  // Check 172.16.0.0 - 172.31.255.255
  if (trimmed.startsWith("172.")) {
    const secondOctet = parseInt(trimmed.split(".")[1], 10);
    if (
      secondOctet >= BLOCKED_IP_RANGES_172.start &&
      secondOctet <= BLOCKED_IP_RANGES_172.end
    ) {
      return {
        valid: false,
        error: "Private and reserved IP addresses are not allowed",
      };
    }
  }

  return { valid: true };
}

/**
 * Validate a hostname for CNAME records
 */
export function validateHostname(hostname: string): ValidationResult {
  if (!hostname) {
    return { valid: false, error: "Hostname is required" };
  }

  const normalized = hostname.toLowerCase().trim();

  // Remove trailing dot if present
  const cleaned = normalized.endsWith(".")
    ? normalized.slice(0, -1)
    : normalized;

  if (!HOSTNAME_REGEX.test(cleaned)) {
    return { valid: false, error: "Invalid hostname format" };
  }

  // Block self-referential CNAME targets
  for (const blocked of BLOCKED_CNAME_TARGETS) {
    if (cleaned === blocked || cleaned.endsWith(`.${blocked}`)) {
      return {
        valid: false,
        error: "Cannot point to arc.bd or its subdomains",
      };
    }
  }

  return { valid: true };
}

/**
 * Validate DNS record content based on type
 */
export function validateDNSContent(
  type: string,
  content: string
): ValidationResult {
  switch (type.toUpperCase()) {
    case "A":
      return validateIPv4(content);
    case "CNAME":
      return validateHostname(content);
    default:
      return { valid: false, error: `Unsupported record type: ${type}` };
  }
}
