import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string for display
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Construct the full domain from a subdomain name
 */
export function getFullDomain(name: string): string {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "arc.bd";
  return `${name}.${domain}`;
}
