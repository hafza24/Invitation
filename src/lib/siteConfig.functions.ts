import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ROW_ID = "default";

export const getSiteConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("site_config")
    .select("config, updated_at")
    .eq("id", ROW_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { config: (data?.config ?? null) as any, updatedAt: (data?.updated_at ?? null) as string | null };
});

const saveInput = z.object({
  password: z.string().min(1).max(200),
  config: z.any(),
});

export const saveSiteConfig = createServerFn({ method: "POST" })
  .inputValidator((input) => saveInput.parse(input))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD || "admin123";
    if (data.password !== expected) throw new Error("Unauthorized");

    // Defense-in-depth: strip any secret-like fields before persisting into
    // the publicly-readable site_config row.
    const cfg = (data.config && typeof data.config === "object" ? { ...(data.config as Record<string, unknown>) } : {}) as Record<string, unknown>;
    if (cfg.meta && typeof cfg.meta === "object") {
      const meta = { ...(cfg.meta as Record<string, unknown>) };
      delete meta.adminPassword;
      cfg.meta = meta;
    }

    const { data: row, error } = await supabaseAdmin
      .from("site_config")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert({ id: ROW_ID, config: cfg as any, updated_at: new Date().toISOString() })
      .select("updated_at")
      .single();
    if (error) throw new Error(error.message);
    return { updatedAt: row.updated_at as string };
  });
