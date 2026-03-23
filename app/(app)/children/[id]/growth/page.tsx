import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChild } from "@/lib/db/children";
import { listGrowthRecords } from "@/lib/db/growth";
import { loadWHODataset, getPercentileSeries } from "@/lib/db/who-reference";
import { ChildHeader } from "@/components/children/ChildHeader";
import { GrowthForm } from "@/components/forms/GrowthForm";
import { LazyGrowthChart } from "@/components/charts";
import type { WHOChartSeries } from "@/components/charts/GrowthChart";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { title: "Growth" };
  const child = await getChild(id, user.id);
  return { title: child ? `${child.name} — Growth` : "Growth" };
}

async function buildWHOSeries(sex: "male" | "female"): Promise<{
  weight: WHOChartSeries;
  height: WHOChartSeries;
}> {
  const [wBoys, hBoys] = await Promise.all([
    loadWHODataset("weight", sex),
    loadWHODataset("height", sex),
  ]);

  const toSeries = (data: typeof wBoys): WHOChartSeries => ({
    p3: getPercentileSeries(data, 3),
    p15: getPercentileSeries(data, 15),
    p50: getPercentileSeries(data, 50),
    p85: getPercentileSeries(data, 85),
    p97: getPercentileSeries(data, 97),
  });

  return { weight: toSeries(wBoys), height: toSeries(hBoys) };
}

export default async function GrowthPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const child = await getChild(id, user.id);
  if (!child) notFound();

  const [records, { weight: whoWeight, height: whoHeight }] = await Promise.all([
    listGrowthRecords(id),
    buildWHOSeries(child.sex as "male" | "female"),
  ]);

  return (
    <div>
      <ChildHeader child={child} />

      <div className="clay-card mb-6 p-6">
        <LazyGrowthChart
          childData={records}
          whoWeight={whoWeight}
          whoHeight={whoHeight}
          childName={child.name}
        />
      </div>

      <div className="clay-card p-6">
        <GrowthForm childId={id} />
      </div>
    </div>
  );
}
