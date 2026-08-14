-- Migration: Enforce subdomain approval for DNS management in RLS
-- Users can only insert, update, or delete DNS records if the associated subdomain has status = 'active'.
-- Prevents unauthorized DNS modifications while a domain claim is in 'pending' or 'suspended' status.

-- Drop existing user policies on dns_records (including duplicate case variations)
DROP POLICY IF EXISTS "Users can view own DNS records" ON public.dns_records;
DROP POLICY IF EXISTS "Users can insert own DNS records" ON public.dns_records;
DROP POLICY IF EXISTS "Users can update own DNS records" ON public.dns_records;
DROP POLICY IF EXISTS "Users can delete own DNS records" ON public.dns_records;
DROP POLICY IF EXISTS "Users can view own dns records" ON public.dns_records;
DROP POLICY IF EXISTS "Users can insert own dns records" ON public.dns_records;
DROP POLICY IF EXISTS "Users can update own dns records" ON public.dns_records;
DROP POLICY IF EXISTS "Users can delete own dns records" ON public.dns_records;

-- 1. Users can view own DNS records (even if pending)
CREATE POLICY "Users can view own DNS records"
  ON public.dns_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subdomains
      WHERE subdomains.id = dns_records.subdomain_id
      AND subdomains.user_id = auth.uid()
    )
  );

-- 2. Users can ONLY insert DNS records if subdomain is active (approved)
CREATE POLICY "Users can insert own DNS records"
  ON public.dns_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subdomains
      WHERE subdomains.id = dns_records.subdomain_id
      AND subdomains.user_id = auth.uid()
      AND subdomains.status = 'active'
    )
  );

-- 3. Users can ONLY update DNS records if subdomain is active (approved)
CREATE POLICY "Users can update own DNS records"
  ON public.dns_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.subdomains
      WHERE subdomains.id = dns_records.subdomain_id
      AND subdomains.user_id = auth.uid()
      AND subdomains.status = 'active'
    )
  );

-- 4. Users can ONLY delete DNS records if subdomain is active (approved)
CREATE POLICY "Users can delete own DNS records"
  ON public.dns_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.subdomains
      WHERE subdomains.id = dns_records.subdomain_id
      AND subdomains.user_id = auth.uid()
      AND subdomains.status = 'active'
    )
  );
