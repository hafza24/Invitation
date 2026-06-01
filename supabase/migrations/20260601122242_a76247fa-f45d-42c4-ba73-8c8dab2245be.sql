CREATE TABLE public.site_config (
  id text PRIMARY KEY,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_config TO anon, authenticated;
GRANT ALL ON public.site_config TO service_role;

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site config"
  ON public.site_config FOR SELECT
  USING (true);

-- Enable realtime so admin edits propagate to open visitors/preview tabs
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_config;

-- Seed a default empty row so reads always succeed
INSERT INTO public.site_config (id, config) VALUES ('default', '{}'::jsonb)
  ON CONFLICT (id) DO NOTHING;