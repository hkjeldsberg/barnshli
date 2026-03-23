import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient(): ReturnType<typeof createBrowserClient<Database, "barnshli">> {
  return createBrowserClient<Database, "barnshli">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "barnshli" } },
  );
}
