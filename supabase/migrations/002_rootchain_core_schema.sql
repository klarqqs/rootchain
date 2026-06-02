-- ROOTCHAIN · Core relational schema (run after 001_app_profiles.sql)
--
-- auth.users          ← Supabase Auth (users)
-- public.profiles     ← 1:1 app identity + wallet link
-- public.farmers      ← 1:1 farmer metadata (linked to auth user)
-- public.projects     ← N:1 harvest / funding campaigns per farmer
-- public.investments  ← N:1 capital commitments per user + project
--
-- Legacy tables (farmer_profiles, investments with stellar_address) remain
-- optional for older app code paths; new features should use this schema.

-- ─── Shared utilities ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ─── profiles ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'investor'
    CHECK (role IN ('farmer', 'investor')),
  wallet_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS profiles_wallet_address_idx ON public.profiles (wallet_address)
  WHERE wallet_address IS NOT NULL;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ─── farmers ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS farmers_user_id_idx ON public.farmers (user_id);
CREATE INDEX IF NOT EXISTS farmers_verification_status_idx ON public.farmers (verification_status);

DROP TRIGGER IF EXISTS farmers_set_updated_at ON public.farmers;
CREATE TRIGGER farmers_set_updated_at
  BEFORE UPDATE ON public.farmers
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ─── projects ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.farmers (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  target_amount NUMERIC(18, 2) NOT NULL CHECK (target_amount > 0),
  raised_amount NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (raised_amount >= 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'funded', 'closed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_date_range CHECK (end_date >= start_date),
  CONSTRAINT projects_raised_lte_target CHECK (raised_amount <= target_amount)
);

CREATE INDEX IF NOT EXISTS projects_farmer_id_idx ON public.projects (farmer_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects (status);
CREATE INDEX IF NOT EXISTS projects_dates_idx ON public.projects (start_date, end_date);

DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ─── investments ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE RESTRICT,
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  transaction_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS investments_user_id_idx ON public.investments (user_id);
CREATE INDEX IF NOT EXISTS investments_project_id_idx ON public.investments (project_id);

CREATE UNIQUE INDEX IF NOT EXISTS investments_transaction_hash_unique
  ON public.investments (transaction_hash)
  WHERE transaction_hash IS NOT NULL;

-- Keep project.raised_amount in sync when investments are recorded.
CREATE OR REPLACE FUNCTION public.apply_investment_to_project_raised()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.projects
  SET
    raised_amount = raised_amount + NEW.amount,
    updated_at = NOW()
  WHERE id = NEW.project_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS investments_apply_raised ON public.investments;
CREATE TRIGGER investments_apply_raised
  AFTER INSERT ON public.investments
  FOR EACH ROW
  EXECUTE PROCEDURE public.apply_investment_to_project_raised();

-- ─── Auth signup → profiles row ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_auth_user_profiles_row()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  signup_role TEXT;
BEGIN
  signup_role := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'role', ''), 'investor');
  IF signup_role NOT IN ('farmer', 'investor') THEN
    signup_role := 'investor';
  END IF;

  INSERT INTO public.profiles (user_id, role, wallet_address)
  VALUES (NEW.id, signup_role, NULL)
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = NOW();

  IF signup_role = 'farmer' THEN
    INSERT INTO public.farmers (user_id, name, location)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), 'Farmer'),
      COALESCE(NEW.raw_user_meta_data ->> 'location', '')
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profiles ON auth.users;
CREATE TRIGGER on_auth_user_created_profiles
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_auth_user_profiles_row();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- farmers
DROP POLICY IF EXISTS "farmers_select_public_or_own" ON public.farmers;
CREATE POLICY "farmers_select_public_or_own" ON public.farmers
  FOR SELECT USING (
    verification_status = 'verified'
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "farmers_insert_own" ON public.farmers;
CREATE POLICY "farmers_insert_own" ON public.farmers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "farmers_update_own" ON public.farmers;
CREATE POLICY "farmers_update_own" ON public.farmers
  FOR UPDATE USING (auth.uid() = user_id);

-- projects
DROP POLICY IF EXISTS "projects_select_public_or_owner" ON public.projects;
CREATE POLICY "projects_select_public_or_owner" ON public.projects
  FOR SELECT USING (
    status IN ('active', 'funded', 'closed')
    OR EXISTS (
      SELECT 1
      FROM public.farmers f
      WHERE f.id = projects.farmer_id
        AND f.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "projects_insert_owner" ON public.projects;
CREATE POLICY "projects_insert_owner" ON public.projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.farmers f
      WHERE f.id = farmer_id
        AND f.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "projects_update_owner" ON public.projects;
CREATE POLICY "projects_update_owner" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.farmers f
      WHERE f.id = projects.farmer_id
        AND f.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "projects_delete_owner" ON public.projects;
CREATE POLICY "projects_delete_owner" ON public.projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.farmers f
      WHERE f.id = projects.farmer_id
        AND f.user_id = auth.uid()
    )
  );

-- investments
DROP POLICY IF EXISTS "investments_select_own_or_project_farmer" ON public.investments;
CREATE POLICY "investments_select_own_or_project_farmer" ON public.investments
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.farmers f ON f.id = p.farmer_id
      WHERE p.id = investments.project_id
        AND f.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "investments_insert_own" ON public.investments;
CREATE POLICY "investments_insert_own" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Grants ───────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.farmers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT ON public.investments TO authenticated;

GRANT SELECT ON public.farmers TO anon;
GRANT SELECT ON public.projects TO anon;
