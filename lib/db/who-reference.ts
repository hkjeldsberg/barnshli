import { readFile } from "fs/promises";
import path from "path";

export interface WHODataRow {
  /** Age in completed months */
  age_months: number;
  /** 3rd percentile */
  p3: number;
  /** 15th percentile */
  p15: number;
  /** 50th percentile (median) */
  p50: number;
  /** 85th percentile */
  p85: number;
  /** 97th percentile */
  p97: number;
}

export interface WHOPercentilePoint {
  x: number;
  y: number;
}

export interface WHOSeries {
  p3: WHOPercentilePoint[];
  p15: WHOPercentilePoint[];
  p50: WHOPercentilePoint[];
  p85: WHOPercentilePoint[];
  p97: WHOPercentilePoint[];
}

type Metric = "weight" | "height";
type Sex = "male" | "female";

const fileNameMap: Record<Metric, Record<Sex, string>> = {
  weight: {
    male: "weight-for-age-boys.json",
    female: "weight-for-age-girls.json",
  },
  height: {
    male: "height-for-age-boys.json",
    female: "height-for-age-girls.json",
  },
};

/**
 * Loads WHO reference data from the embedded static JSON dataset.
 * Server-side only (uses fs/promises).
 */
export async function loadWHODataset(
  metric: Metric,
  sex: Sex,
): Promise<WHODataRow[]> {
  const fileName = fileNameMap[metric][sex];
  const filePath = path.join(process.cwd(), "public", "data", "who", fileName);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as WHODataRow[];
}

/**
 * Converts a WHO dataset into a chart-ready series of {x, y} points
 * for a given percentile.
 */
export function getPercentileSeries(
  data: WHODataRow[],
  percentile: 3 | 15 | 50 | 85 | 97,
): WHOPercentilePoint[] {
  const key = `p${percentile}` as keyof Pick<
    WHODataRow,
    "p3" | "p15" | "p50" | "p85" | "p97"
  >;
  return data.map((row) => ({ x: row.age_months, y: row[key] }));
}
