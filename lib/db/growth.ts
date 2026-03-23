import { createClient } from "@/lib/supabase/server";
import { getChild } from "@/lib/db/children";
import {
  validateDateNotBeforeDOB,
  validateDateNotFuture,
  validateWeight,
  validateHeight,
} from "@/lib/utils/validation";
import type { Tables, InsertTables } from "@/types/database";

export type GrowthRecord = Tables<"growth_records">;

export interface GrowthRecordInput {
  recorded_at: string;
  weight_kg?: number | null;
  height_cm?: number | null;
}

export async function listGrowthRecords(
  childId: string,
): Promise<GrowthRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("growth_records")
    .select("*")
    .eq("child_id", childId)
    .order("recorded_at", { ascending: true });

  if (error) throw new Error(`Failed to list growth records: ${error.message}`);
  return data ?? [];
}

export async function createGrowthRecord(
  childId: string,
  parentId: string,
  input: GrowthRecordInput,
): Promise<GrowthRecord> {
  // Ownership + date validation requires child record
  const child = await getChild(childId, parentId);
  if (!child) throw new Error("Child not found or access denied.");

  const futureDateCheck = validateDateNotFuture(input.recorded_at);
  if (!futureDateCheck.valid) throw new Error(futureDateCheck.error);

  const dobCheck = validateDateNotBeforeDOB(
    input.recorded_at,
    child.date_of_birth,
  );
  if (!dobCheck.valid) throw new Error(dobCheck.error);

  if (input.weight_kg != null) {
    const wCheck = validateWeight(input.weight_kg);
    if (!wCheck.valid) throw new Error(wCheck.error);
  }

  if (input.height_cm != null) {
    const hCheck = validateHeight(input.height_cm);
    if (!hCheck.valid) throw new Error(hCheck.error);
  }

  if (input.weight_kg == null && input.height_cm == null) {
    throw new Error("At least one of weight or height must be provided.");
  }

  const supabase = await createClient();
  const row: InsertTables<"growth_records"> = {
    child_id: childId,
    recorded_at: input.recorded_at,
    weight_kg: input.weight_kg ?? null,
    height_cm: input.height_cm ?? null,
  };

  const { data, error } = await supabase
    .from("growth_records")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Failed to create growth record: ${error.message}`);
  return data;
}
