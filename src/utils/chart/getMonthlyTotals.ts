
import { groupByMonth } from "@/hooks/chart/useGroupedData";
import { generateSampleData } from "./sampleChartData";

export function getMonthlyTotals(allMeasurements: any[]) {
  try {
    const chart = groupByMonth(allMeasurements);
    if (!chart || chart.length === 0) {
      return generateSampleData("6m");
    }
    return chart;
  } catch (err) {
    console.error("Error grouping by month:", err);
    return generateSampleData("6m");
  }
}
