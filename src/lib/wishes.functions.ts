import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const adminGate = z.object({ password: z.string().min(1).max(200) });

export const listWishes = createServerFn({ method: "POST" })
  .inputValidator((input) => adminGate.parse(input))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD || "admin123";
    if (data.password !== expected) {
      throw new Error("Unauthorized");
    }
    const { data: rows, error } = await supabaseAdmin
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return { wishes: rows ?? [] };
  });
