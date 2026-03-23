import { createClient } from "@/lib/supabase/server";
import type { Tables, InsertTables, UpdateTables } from "@/types/database";

export type Child = Tables<"children">;
export type ChildInsert = InsertTables<"children">;
export type ChildUpdate = UpdateTables<"children">;

export async function listChildren(parentId: string): Promise<Child[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to list children: ${error.message}`);
  return data ?? [];
}

export async function getChild(
  childId: string,
  parentId: string,
): Promise<Child | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .eq("parent_id", parentId)
    .single();

  if (error) return null;
  return data;
}

export async function createChild(
  parentId: string,
  data: Pick<ChildInsert, "name" | "date_of_birth" | "sex">,
): Promise<Child> {
  const supabase = await createClient();
  const { data: child, error } = await supabase
    .from("children")
    .insert({ parent_id: parentId, ...data })
    .select()
    .single();

  if (error) throw new Error(`Failed to create child: ${error.message}`);
  return child;
}

export async function updateChild(
  childId: string,
  parentId: string,
  data: ChildUpdate,
): Promise<Child> {
  const supabase = await createClient();
  const { data: child, error } = await supabase
    .from("children")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", childId)
    .eq("parent_id", parentId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update child: ${error.message}`);
  return child;
}

export async function deleteChild(
  childId: string,
  parentId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("children")
    .delete()
    .eq("id", childId)
    .eq("parent_id", parentId);

  if (error) throw new Error(`Failed to delete child: ${error.message}`);
}
