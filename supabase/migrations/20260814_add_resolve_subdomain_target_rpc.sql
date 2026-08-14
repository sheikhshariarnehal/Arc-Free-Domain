-- Migration: Add SECURITY DEFINER RPC for resolving a subdomain's routing
-- target during wildcard *.arc.bd hostname routing.
--
-- Why this is needed: `subdomains` and `dns_records` are protected by RLS
-- policies that only allow a row's owner (or an admin) to SELECT it. The
-- wildcard routing middleware runs on behalf of anonymous visitors (anyone
-- hitting <slug>.arc.bd), so it has no session/user_id to satisfy those
-- policies. Without this RPC, hostname resolution silently returns no rows
-- for every anonymous visitor and every claimed subdomain would incorrectly
-- appear "not found".
--
-- This mirrors the existing `check_subdomain_availability` RPC pattern:
-- a narrow, purpose-built SECURITY DEFINER function that returns only the
-- minimal data required (claim status + routing target), instead of
-- broadening RLS SELECT access to the underlying tables.

CREATE OR REPLACE FUNCTION public.resolve_subdomain_target(subdomain_name TEXT)
RETURNS JSONB AS $$
DECLARE
  clean_name TEXT := LOWER(TRIM(subdomain_name));
  sub_id UUID;
  rec_type TEXT;
  rec_content TEXT;
BEGIN
  SELECT id INTO sub_id
  FROM public.subdomains
  WHERE LOWER(name) = clean_name
  AND status = 'active'
  LIMIT 1;

  IF sub_id IS NULL THEN
    RETURN jsonb_build_object('claimed', false);
  END IF;

  SELECT type, content INTO rec_type, rec_content
  FROM public.dns_records
  WHERE subdomain_id = sub_id
  AND status = 'active'
  AND type IN ('A', 'CNAME')
  ORDER BY created_at DESC
  LIMIT 1;

  IF rec_content IS NULL THEN
    RETURN jsonb_build_object('claimed', true, 'target', NULL);
  END IF;

  RETURN jsonb_build_object(
    'claimed', true,
    'target', jsonb_build_object('type', rec_type, 'content', rec_content)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.resolve_subdomain_target(TEXT) TO anon, authenticated;
