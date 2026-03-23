import { createClient } from "@/lib/supabase/server";
import type { Tables, InsertTables } from "@/types/database";

export type Profile = Tables<"profiles">;

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function upsertProfile(
  userId: string,
  data: Pick<InsertTables<"profiles">, "display_name">,
): Promise<Profile> {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...data, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(`Failed to upsert profile: ${error.message}`);
  return profile;
}
