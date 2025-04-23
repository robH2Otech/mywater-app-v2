
import { groupByDay } from "@/hooks/chart/useGroupedData";
import { generateSampleData } from "./sampleChartData";

export function getDailyTotals(allMeasurements: any[]) {
  try {
    const chart = groupByDay(allMeasurements);
    if (!chart || chart.length === 0) {
      return generateSampleData("7d");
    }
    return chart;
  } catch (err) {
    console.error("Error grouping by day:", err);
    return generateSampleData("7d");
  }
}
