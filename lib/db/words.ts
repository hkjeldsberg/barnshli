import { createClient } from "@/lib/supabase/server";
import type { Tables, InsertTables, UpdateTables } from "@/types/database";

export type WordEntry = Tables<"word_entries">;
export type WordVariant = Tables<"word_variants">;

export interface WordEntryWithVariants extends WordEntry {
  variants: WordVariant[];
}

export async function listWordEntries(
  childId: string,
): Promise<WordEntryWithVariants[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("word_entries")
    .select("*, variants:word_variants(*)")
    .eq("child_id", childId)
    .order("first_heard_at", { ascending: true });

  if (error) throw new Error(`Failed to list word entries: ${error.message}`);

  return (data ?? []).map((entry) => ({
    ...entry,
    variants: (entry.variants ?? []).sort(
      (a: WordVariant, b: WordVariant) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
    ),
  }));
}

export async function createWordEntry(
  childId: string,
  data: Pick<InsertTables<"word_entries">, "base_word" | "first_heard_at" | "real_word">,
): Promise<WordEntry> {
  const supabase = await createClient();
  const { data: entry, error } = await supabase
    .from("word_entries")
    .insert({ child_id: childId, ...data })
    .select()
    .single();

  if (error) throw new Error(`Failed to create word entry: ${error.message}`);
  return entry;
}

export async function updateWordEntry(
  wordEntryId: string,
  childId: string,
  data: Pick<UpdateTables<"word_entries">, "base_word" | "first_heard_at" | "real_word">,
): Promise<WordEntry> {
  const supabase = await createClient();
  const { data: entry, error } = await supabase
    .from("word_entries")
    .update(data)
    .eq("id", wordEntryId)
    .eq("child_id", childId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update word entry: ${error.message}`);
  return entry;
}

export async function deleteWordEntry(
  wordEntryId: string,
  childId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("word_entries")
    .delete()
    .eq("id", wordEntryId)
    .eq("child_id", childId);

  if (error) throw new Error(`Failed to delete word entry: ${error.message}`);
}

export async function addWordVariant(
  wordEntryId: string,
  data: Pick<InsertTables<"word_variants">, "variant" | "recorded_at">,
): Promise<WordVariant> {
  const supabase = await createClient();
  const { data: variant, error } = await supabase
    .from("word_variants")
    .insert({ word_entry_id: wordEntryId, ...data })
    .select()
    .single();

  if (error) throw new Error(`Failed to add word variant: ${error.message}`);
  return variant;
}

export async function updateWordVariant(
  variantId: string,
  data: Pick<UpdateTables<"word_variants">, "recorded_at">,
): Promise<WordVariant> {
  const supabase = await createClient();
  const { data: variant, error } = await supabase
    .from("word_variants")
    .update(data)
    .eq("id", variantId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update word variant: ${error.message}`);
  return variant;
}
