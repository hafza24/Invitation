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
  return {
    config: (data?.config ?? null) as Record<string, unknown> | null,
    updatedAt: data?.updated_at ?? null,
  };
});

const saveInput = z.object({
  password: z.string().min(1).max(200),
  config: z.record(z.string(), z.unknown()),
});

export const saveSiteConfig = createServerFn({ method: "POST" })
  .inputValidator((input) => saveInput.parse(input))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD || "admin123";
    if (data.password !== expected) throw new Error("Unauthorized");

    const { data: row, error } = await supabaseAdmin
      .from("site_config")
      .upsert({ id: ROW_ID, config: data.config, updated_at: new Date().toISOString() })
      .select("updated_at")
      .single();
    if (error) throw new Error(error.message);
    return { updatedAt: row.updated_at };
  });
