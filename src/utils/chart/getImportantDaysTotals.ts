
import { groupByImportantDays } from "@/hooks/chart/useGroupedData";
import { generateSampleData } from "./sampleChartData";

export function getImportantDaysTotals(allMeasurements: any[]) {
  try {
    const chart = groupByImportantDays(allMeasurements);
    if (!chart || chart.length === 0) {
      return generateSampleData("30d");
    }
    return chart;
  } catch (err) {
    console.error("Error grouping by important days:", err);
    return generateSampleData("30d");
  }
}
