"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import type { GrowthRecord } from "@/lib/db/growth";
import type { WHOPercentilePoint } from "@/lib/db/who-reference";

export interface WHOChartSeries {
  p3: WHOPercentilePoint[];
  p15: WHOPercentilePoint[];
  p50: WHOPercentilePoint[];
  p85: WHOPercentilePoint[];
  p97: WHOPercentilePoint[];
}

interface GrowthChartProps {
  childData: GrowthRecord[];
  whoWeight: WHOChartSeries;
  whoHeight: WHOChartSeries;
  childName: string;
  dateOfBirth: string;
}

type Tab = "weight" | "height";

/** Age in months from date-of-birth to measurement date, rounded to nearest month. */
function ageMonthsAt(dateOfBirth: string, measuredAt: string): number {
  const born = new Date(dateOfBirth).getTime();
  const measured = new Date(measuredAt).getTime();
  return Math.round((measured - born) / (1000 * 60 * 60 * 24 * 30.44));
}

export function GrowthChart({
  childData,
  whoWeight,
  whoHeight,
  childName,
  dateOfBirth,
}: GrowthChartProps): React.JSX.Element {
  const [tab, setTab] = useState<Tab>("weight");

  const who = tab === "weight" ? whoWeight : whoHeight;
  const metric = tab === "weight" ? "weight_kg" : "height_cm";
  const unit = tab === "weight" ? "kg" : "cm";

  // Build a WHO lookup: age_months → percentile values
  const whoLookup = new Map<
    number,
    { p3: number; p15: number; p50: number; p85: number; p97: number }
  >();
  who.p50.forEach(({ x }) => {
    whoLookup.set(x, {
      p3: who.p3.find((p) => p.x === x)?.y ?? 0,
      p15: who.p15.find((p) => p.x === x)?.y ?? 0,
      p50: who.p50.find((p) => p.x === x)?.y ?? 0,
      p85: who.p85.find((p) => p.x === x)?.y ?? 0,
      p97: who.p97.find((p) => p.x === x)?.y ?? 0,
    });
  });

  // Map each child measurement to its correct age in months
  const childPoints = childData.map((r) => ({
    age: ageMonthsAt(dateOfBirth, r.recorded_at),
    value: r[metric] ?? null,
  }));

  // Combine all age points (WHO + child measurements), sorted ascending
  const allAges = Array.from(
    new Set([...who.p50.map((p) => p.x), ...childPoints.map((p) => p.age)])
  ).sort((a, b) => a - b);

  const dataset = allAges.map((age) => {
    const whoRow = whoLookup.get(age) ?? null;
    const childPoint = childPoints.find((p) => p.age === age);
    return {
      age,
      child: childPoint?.value ?? null,
      p3: whoRow?.p3 ?? null,
      p15: whoRow?.p15 ?? null,
      p50: whoRow?.p50 ?? null,
      p85: whoRow?.p85 ?? null,
      p97: whoRow?.p97 ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Tab switcher */}
      <div className="flex gap-2" role="tablist" aria-label="Growth metric">
        {(["weight", "height"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={[
              "px-4 py-1.5 rounded-full text-sm font-semibold font-display transition-colors min-h-[44px]",
              tab === t
                ? "bg-sage text-white shadow-clay-sm"
                : "bg-cream-100 text-slate-600 hover:bg-cream-200",
            ].join(" ")}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <figure
        aria-label={`${childName}'s ${tab} growth chart with WHO reference curves`}
      >
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart
            data={dataset}
            margin={{ top: 8, right: 16, left: 0, bottom: 32 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE5D4" />
            <XAxis
              dataKey="age"
              label={{
                value: "Age (months)",
                position: "insideBottom",
                offset: -20,
              }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              label={{
                value: unit,
                angle: -90,
                position: "insideLeft",
                offset: 12,
              }}
              tick={{ fontSize: 11 }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              formatter={(value, name) =>
                value != null
                  ? [`${Number(value).toFixed(1)} ${unit}`, name]
                  : ["-", name]
              }
              labelFormatter={(label) => `Age: ${label} months`}
            />
            <Legend verticalAlign="top" />

            {/* Zoom / pan brush */}
            <Brush
              dataKey="age"
              height={22}
              travellerWidth={8}
              stroke="#8FAF8F"
              fill="#F5F0E8"
              startIndex={0}
            />

            {/* WHO percentile reference lines */}
            <Line
              dataKey="p3"
              name="P3 (WHO)"
              stroke="#D4E4D4"
              strokeWidth={1}
              dot={false}
              strokeDasharray="4 2"
              connectNulls
            />
            <Line
              dataKey="p15"
              name="P15 (WHO)"
              stroke="#B8CEB8"
              strokeWidth={1}
              dot={false}
              strokeDasharray="4 2"
              connectNulls
            />
            <Line
              dataKey="p50"
              name="P50 (WHO)"
              stroke="#8FAF8F"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
            <Line
              dataKey="p85"
              name="P85 (WHO)"
              stroke="#B8CEB8"
              strokeWidth={1}
              dot={false}
              strokeDasharray="4 2"
              connectNulls
            />
            <Line
              dataKey="p97"
              name="P97 (WHO)"
              stroke="#D4E4D4"
              strokeWidth={1}
              dot={false}
              strokeDasharray="4 2"
              connectNulls
            />

            {/* Child measurements */}
            <Line
              dataKey="child"
              name={childName}
              stroke="#C9908C"
              strokeWidth={2.5}
              dot={{ fill: "#C9908C", r: 5 }}
              activeDot={{ r: 7 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
        <figcaption className="text-xs text-slate-400 text-center mt-1">
          WHO reference curves: P3, P15, P50 (median), P85, P97 · Drag the
          brush below to zoom
        </figcaption>
      </figure>
    </div>
  );
}
