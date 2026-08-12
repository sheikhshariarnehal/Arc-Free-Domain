-- ARC.BD Database Schema
-- Supabase PostgreSQL Migration

-- ============================================================
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-confirm user emails (no email confirmation needed)
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. SUBDOMAINS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subdomains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(32) NOT NULL,
  full_domain VARCHAR(64) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subdomains_name_unique UNIQUE (name)
);

CREATE INDEX idx_subdomains_user_id ON public.subdomains(user_id);
CREATE INDEX idx_subdomains_status ON public.subdomains(status);

-- ============================================================
-- 3. DNS RECORDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dns_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain_id UUID NOT NULL REFERENCES public.subdomains(id) ON DELETE CASCADE,
  cloudflare_record_id VARCHAR(64),
  type TEXT NOT NULL CHECK (type IN ('A', 'CNAME')),
  name VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  ttl INT NOT NULL DEFAULT 1,
  proxied BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dns_records_subdomain_id ON public.dns_records(subdomain_id);

-- ============================================================
-- 4. RESERVED SUBDOMAINS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reserved_subdomains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(32) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reserved_subdomains_name_unique UNIQUE (name)
);

-- Seed default reserved names
INSERT INTO public.reserved_subdomains (name, reason) VALUES
  ('www', 'Platform infrastructure'),
  ('api', 'Platform infrastructure'),
  ('admin', 'Platform infrastructure'),
  ('app', 'Platform infrastructure'),
  ('mail', 'Email infrastructure'),
  ('ftp', 'Legacy protocol'),
  ('ns1', 'DNS infrastructure'),
  ('ns2', 'DNS infrastructure'),
  ('dashboard', 'Platform page'),
  ('status', 'Platform page'),
  ('support', 'Platform page'),
  ('help', 'Platform page'),
  ('blog', 'Platform page'),
  ('docs', 'Platform page'),
  ('cdn', 'Platform infrastructure'),
  ('static', 'Platform infrastructure'),
  ('assets', 'Platform infrastructure'),
  ('auth', 'Platform infrastructure'),
  ('login', 'Platform page'),
  ('signup', 'Platform page'),
  ('register', 'Platform page'),
  ('account', 'Platform page'),
  ('settings', 'Platform page'),
  ('profile', 'Platform page'),
  ('billing', 'Platform page'),
  ('report', 'Platform page'),
  ('abuse', 'Platform page'),
  ('test', 'Reserved'),
  ('dev', 'Reserved'),
  ('staging', 'Reserved'),
  ('demo', 'Reserved'),
  ('beta', 'Reserved'),
  ('alpha', 'Reserved'),
  ('localhost', 'Security'),
  ('arc', 'Brand protection'),
  ('arcbd', 'Brand protection')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 5. AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(64) NOT NULL,
  resource_type VARCHAR(32),
  resource_id VARCHAR(64),
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ============================================================
-- 6. SYSTEM SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(64) NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT system_settings_key_unique UNIQUE (key)
);

-- Seed default settings
INSERT INTO public.system_settings (key, value) VALUES
  ('max_subdomains_per_user', '5'),
  ('min_subdomain_length', '3'),
  ('max_subdomain_length', '32'),
  ('maintenance_mode', 'false'),
  ('rate_limit_checks_per_minute', '60'),
  ('rate_limit_claims_per_hour', '10'),
  ('rate_limit_dns_mods_per_hour', '30')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 7. ABUSE REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.abuse_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain VARCHAR(64) NOT NULL,
  reporter_email VARCHAR(255) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('spam', 'phishing', 'malware', 'impersonation', 'copyright', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_abuse_reports_status ON public.abuse_reports(status);

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Helper function to check if user is admin without triggering RLS infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Subdomains
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subdomains"
  ON public.subdomains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subdomains"
  ON public.subdomains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subdomains"
  ON public.subdomains FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subdomains"
  ON public.subdomains FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subdomains"
  ON public.subdomains FOR ALL
  USING (public.is_admin());

-- DNS Records
ALTER TABLE public.dns_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own DNS records"
  ON public.dns_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subdomains
      WHERE subdomains.id = dns_records.subdomain_id
      AND subdomains.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own DNS records"
  ON public.dns_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subdomains
      WHERE subdomains.id = dns_records.subdomain_id
      AND subdomains.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own DNS records"
  ON public.dns_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.subdomains
      WHERE subdomains.id = dns_records.subdomain_id
      AND subdomains.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own DNS records"
  ON public.dns_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.subdomains
      WHERE subdomains.id = dns_records.subdomain_id
      AND subdomains.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all DNS records"
  ON public.dns_records FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Reserved subdomains - public read
ALTER TABLE public.reserved_subdomains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reserved subdomains"
  ON public.reserved_subdomains FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage reserved subdomains"
  ON public.reserved_subdomains FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Audit logs - admin only
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- System settings - public read, admin write
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system settings"
  ON public.system_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Abuse reports - insert by anyone, manage by admin
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create abuse reports"
  ON public.abuse_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage abuse reports"
  ON public.abuse_reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subdomains_updated_at
  BEFORE UPDATE ON public.subdomains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_dns_records_updated_at
  BEFORE UPDATE ON public.dns_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
