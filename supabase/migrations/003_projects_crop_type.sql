-- ROOTCHAIN · Marketplace crop classification on projects

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS crop_type TEXT NOT NULL DEFAULT 'other';

CREATE INDEX IF NOT EXISTS projects_crop_type_idx ON public.projects (crop_type);

COMMENT ON COLUMN public.projects.crop_type IS 'Harvest / crop category for marketplace filters (e.g. cocoa, coffee, maize).';
