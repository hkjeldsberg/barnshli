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
}

type Tab = "weight" | "height";

export function GrowthChart({
  childData,
  whoWeight,
  whoHeight,
  childName,
}: GrowthChartProps): React.JSX.Element {
  const [tab, setTab] = useState<Tab>("weight");

  const who = tab === "weight" ? whoWeight : whoHeight;
  const metric = tab === "weight" ? "weight_kg" : "height_cm";
  const unit = tab === "weight" ? "kg" : "cm";

  // Build combined dataset: all age_months from WHO p50 series
  const whoBase = who.p50.map(({ x }) => {
    const childPoint = childData.find(
      (r) =>
        Math.round(
          (new Date(r.recorded_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30),
        ) === x,
    );
    return {
      age: x,
      child: childPoint?.[metric] ?? null,
      p3: who.p3.find((p) => p.x === x)?.y ?? null,
      p15: who.p15.find((p) => p.x === x)?.y ?? null,
      p50: who.p50.find((p) => p.x === x)?.y ?? null,
      p85: who.p85.find((p) => p.x === x)?.y ?? null,
      p97: who.p97.find((p) => p.x === x)?.y ?? null,
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
      <figure aria-label={`${childName}'s ${tab} growth chart with WHO reference curves`}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={whoBase} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE5D4" />
            <XAxis
              dataKey="age"
              label={{ value: "Age (months)", position: "insideBottom", offset: -4 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              label={{ value: unit, angle: -90, position: "insideLeft", offset: 12 }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) =>
                value != null ? [`${Number(value).toFixed(1)} ${unit}`, name] : ["-", name]
              }
              labelFormatter={(label) => `Age: ${label} months`}
            />
            <Legend verticalAlign="top" />

            {/* WHO percentile reference lines */}
            <Line dataKey="p3" name="P3 (WHO)" stroke="#D4E4D4" strokeWidth={1} dot={false} strokeDasharray="4 2" />
            <Line dataKey="p15" name="P15 (WHO)" stroke="#B8CEB8" strokeWidth={1} dot={false} strokeDasharray="4 2" />
            <Line dataKey="p50" name="P50 (WHO)" stroke="#8FAF8F" strokeWidth={1.5} dot={false} />
            <Line dataKey="p85" name="P85 (WHO)" stroke="#B8CEB8" strokeWidth={1} dot={false} strokeDasharray="4 2" />
            <Line dataKey="p97" name="P97 (WHO)" stroke="#D4E4D4" strokeWidth={1} dot={false} strokeDasharray="4 2" />

            {/* Child data */}
            <Line
              dataKey="child"
              name={childName}
              stroke="#C9908C"
              strokeWidth={2.5}
              dot={{ fill: "#C9908C", r: 4 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <figcaption className="text-xs text-slate-400 text-center mt-2">
          WHO reference curves: P3, P15, P50 (median), P85, P97
        </figcaption>
      </figure>
    </div>
  );
}
