-- Fix: dns_records_type_check constraint was missing TXT type.
-- TXT records are needed for domain verification (e.g. Vercel ownership proof).
ALTER TABLE public.dns_records DROP CONSTRAINT dns_records_type_check;
ALTER TABLE public.dns_records ADD CONSTRAINT dns_records_type_check
  CHECK (type = ANY (ARRAY['A'::text, 'CNAME'::text, 'TXT'::text]));
