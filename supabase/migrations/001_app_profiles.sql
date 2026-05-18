-- ROOTCHAIN · Supabase Auth profiles + RLS (run in Supabase SQL editor or CLI)
-- Links auth.users to application role, onboarding, wallet link, farmer verification state.

CREATE TABLE IF NOT EXISTS public.app_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'investor' CHECK (role IN ('investor', 'farmer', 'admin')),
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  wallet_public_key TEXT,
  farmer_verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (farmer_verification_status IN ('pending', 'submitted', 'verified', 'rejected')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS app_profiles_wallet_idx ON public.app_profiles (wallet_public_key)
  WHERE wallet_public_key IS NOT NULL;

ALTER TABLE public.app_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.app_profiles;
CREATE POLICY "profiles_select_own" ON public.app_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.app_profiles;
CREATE POLICY "profiles_insert_own" ON public.app_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.app_profiles;
CREATE POLICY "profiles_update_own" ON public.app_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_auth_user_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.app_profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'role', ''), 'investor'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_auth_user_profiles();

