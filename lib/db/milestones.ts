import { createClient } from "@/lib/supabase/server";
import type { Tables, InsertTables } from "@/types/database";
import type { AgeBand } from "@/lib/utils/age";

export type Milestone = Tables<"milestones">;

export async function listMilestones(
  childId: string,
  type?: "custom" | "ai",
): Promise<Milestone[]> {
  const supabase = await createClient();
  let query = supabase
    .from("milestones")
    .select("*")
    .eq("child_id", childId)
    .order("achieved_at", { ascending: false });

  if (type === "custom") query = query.eq("is_custom", true);
  if (type === "ai") query = query.eq("is_custom", false);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list milestones: ${error.message}`);
  return data ?? [];
}

export async function createCustomMilestone(
  childId: string,
  data: Pick<InsertTables<"milestones">, "title" | "achieved_at" | "age_band">,
): Promise<Milestone> {
  const supabase = await createClient();
  const { data: milestone, error } = await supabase
    .from("milestones")
    .insert({
      child_id: childId,
      title: data.title,
      achieved_at: data.achieved_at,
      age_band: data.age_band,
      is_custom: true,
      completed: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create milestone: ${error.message}`);
  return milestone;
}

export async function toggleMilestone(
  milestoneId: string,
  childId: string,
  completed: boolean,
): Promise<Milestone> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .update({ completed })
    .eq("id", milestoneId)
    .eq("child_id", childId)
    .select()
    .single();

  if (error) throw new Error(`Failed to toggle milestone: ${error.message}`);
  return data;
}

export async function updateMilestone(
  milestoneId: string,
  childId: string,
  data: { title?: string; achieved_at?: string; age_band?: string },
): Promise<Milestone> {
  const supabase = await createClient();
  const { data: milestone, error } = await supabase
    .from("milestones")
    .update(data)
    .eq("id", milestoneId)
    .eq("child_id", childId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update milestone: ${error.message}`);
  return milestone;
}

export async function deleteMilestone(
  milestoneId: string,
  childId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", milestoneId)
    .eq("child_id", childId);

  if (error) throw new Error(`Failed to delete milestone: ${error.message}`);
}

export async function getAIChecklistForBand(
  childId: string,
  ageBand: AgeBand,
): Promise<Milestone[]> {
  const supabase = await createClient();
  // Returns only AI-generated items (source='ai') for backward compat also
  // accepts rows where source is null (pre-migration data).
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("child_id", childId)
    .eq("age_band", ageBand)
    .eq("is_custom", false)
    .in("source", ["ai"])
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch AI checklist: ${error.message}`);
  return data ?? [];
}

export async function getUserChallengesForBand(
  childId: string,
  ageBand: AgeBand,
): Promise<Milestone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("child_id", childId)
    .eq("age_band", ageBand)
    .eq("is_custom", false)
    .eq("source", "user")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch user challenges: ${error.message}`);
  return data ?? [];
}

export async function createUserChallenge(
  childId: string,
  data: { title: string; ageBand: AgeBand },
): Promise<Milestone> {
  const supabase = await createClient();
  const { data: milestone, error } = await supabase
    .from("milestones")
    .insert({
      child_id: childId,
      title: data.title,
      age_band: data.ageBand,
      is_custom: false,
      completed: false,
      source: "user",
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create user challenge: ${error.message}`);
  return milestone;
}

export async function bulkInsertAIChecklist(
  childId: string,
  ageBand: AgeBand,
  titles: string[],
): Promise<Milestone[]> {
  const supabase = await createClient();
  const rows: InsertTables<"milestones">[] = titles.map((title) => ({
    child_id: childId,
    title,
    age_band: ageBand,
    is_custom: false,
    completed: false,
    source: "ai",
  }));

  const { data, error } = await supabase
    .from("milestones")
    .insert(rows)
    .select();

  if (error) throw new Error(`Failed to bulk insert AI checklist: ${error.message}`);
  return data ?? [];
}
