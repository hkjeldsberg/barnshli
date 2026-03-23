"use client";

import dynamic from "next/dynamic";
import React from "react";

function GrowthChartSkeleton(): React.JSX.Element {
  return (
    <div
      className="w-full h-80 rounded-3xl bg-cream-100 animate-pulse"
      aria-label="Loading growth chart…"
      role="status"
    />
  );
}

export const LazyGrowthChart = dynamic(
  () => import("./GrowthChart").then((mod) => mod.GrowthChart),
  {
    ssr: false,
    loading: GrowthChartSkeleton,
  },
);
