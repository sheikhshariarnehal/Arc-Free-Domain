-- Migration: Add SECURITY DEFINER RPC function for checking subdomain availability
-- Allows anonymous and authenticated users to check if a subdomain name is available
-- without bypassing RLS or leaking private user data.

CREATE OR REPLACE FUNCTION public.check_subdomain_availability(subdomain_name TEXT)
RETURNS JSONB AS $$
DECLARE
  clean_name TEXT := LOWER(TRIM(subdomain_name));
  is_reserved BOOLEAN := FALSE;
  is_taken BOOLEAN := FALSE;
BEGIN
  -- 1. Check reserved subdomains
  SELECT EXISTS (
    SELECT 1 FROM public.reserved_subdomains
    WHERE LOWER(name) = clean_name
  ) INTO is_reserved;

  IF is_reserved THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Reserved domain name');
  END IF;

  -- 2. Check active/pending/suspended claims
  SELECT EXISTS (
    SELECT 1 FROM public.subdomains
    WHERE LOWER(name) = clean_name
    AND status IN ('active', 'pending', 'suspended')
  ) INTO is_taken;

  IF is_taken THEN
    RETURN jsonb_build_object('available', false, 'reason', 'Subdomain is already claimed');
  END IF;

  RETURN jsonb_build_object('available', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.check_subdomain_availability(TEXT) TO anon, authenticated;
