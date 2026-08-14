"use client";

import { createBrowserClient } from "@supabase/ssr";

const fallbackUrl = "https://jhhgwqgkixiuyoelycak.supabase.co";
const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaGd3cWdraXhpdXlvZWx5Y2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzMyMDYsImV4cCI6MjEwMjEwOTIwNn0.DahFt3pbEFzLl3IByMYLMk9QYileaiEmC6y-ChjyW2c";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackKey;
  return createBrowserClient(url, anonKey);
}
