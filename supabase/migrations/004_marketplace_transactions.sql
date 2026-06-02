-- ROOTCHAIN · Marketplace investment transactions + pending investment lifecycle

ALTER TABLE public.investments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'failed')),
  ADD COLUMN IF NOT EXISTS wallet_address TEXT,
  ADD COLUMN IF NOT EXISTS prepared_xdr TEXT;

CREATE INDEX IF NOT EXISTS investments_status_idx ON public.investments (status);

CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE RESTRICT,
  investment_id UUID REFERENCES public.investments (id) ON DELETE SET NULL,
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'failed')),
  wallet_address TEXT,
  prepared_xdr TEXT,
  stellar_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS marketplace_transactions_user_id_idx
  ON public.marketplace_transactions (user_id);
CREATE INDEX IF NOT EXISTS marketplace_transactions_project_id_idx
  ON public.marketplace_transactions (project_id);
CREATE INDEX IF NOT EXISTS marketplace_transactions_status_idx
  ON public.marketplace_transactions (status);

DROP TRIGGER IF EXISTS marketplace_transactions_set_updated_at ON public.marketplace_transactions;
CREATE TRIGGER marketplace_transactions_set_updated_at
  BEFORE UPDATE ON public.marketplace_transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- Only count confirmed investments toward project.raised_amount
CREATE OR REPLACE FUNCTION public.apply_investment_to_project_raised()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE public.projects
    SET raised_amount = raised_amount + NEW.amount, updated_at = NOW()
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' THEN
    UPDATE public.projects
    SET raised_amount = raised_amount + NEW.amount, updated_at = NOW()
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_tx_select_own" ON public.marketplace_transactions;
CREATE POLICY "marketplace_tx_select_own" ON public.marketplace_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "marketplace_tx_insert_own" ON public.marketplace_transactions;
CREATE POLICY "marketplace_tx_insert_own" ON public.marketplace_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "marketplace_tx_update_own" ON public.marketplace_transactions;
CREATE POLICY "marketplace_tx_update_own" ON public.marketplace_transactions
  FOR UPDATE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.marketplace_transactions TO authenticated;
