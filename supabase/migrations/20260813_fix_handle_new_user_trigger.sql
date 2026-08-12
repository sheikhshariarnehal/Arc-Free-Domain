-- Fix: handle_new_user trigger was incorrectly granting admin role
-- to ALL @arc.bd email addresses due to overly broad LIKE condition.
-- Also: ON CONFLICT was updating the role on every login, which could
-- demote/promote users incorrectly.
--
-- Fix:
-- 1. Restrict admin auto-assignment to only specific emails
-- 2. Remove role from ON CONFLICT UPDATE (preserve manually set roles)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'user';
BEGIN
  -- Only grant admin to specific admin emails on first signup
  IF NEW.email = 'admin@arc.bd' OR NEW.email LIKE '%nehal%@arc.bd' THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  -- NOTE: role is intentionally NOT updated on conflict
  -- to preserve roles set manually via the admin panel.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
