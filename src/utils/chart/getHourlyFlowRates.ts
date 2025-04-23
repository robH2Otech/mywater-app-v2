
import { calculateHourlyFlowRates } from "./waterUsageCalculations";
import { generateSampleData } from "./sampleChartData";

export function getHourlyFlowRates(allMeasurements: any[]) {
  try {
    const chart = calculateHourlyFlowRates(allMeasurements);
    // If calculation produces no points fallback to sample
    if (!chart || chart.length === 0) {
      return generateSampleData("24h");
    }
    return chart;
  } catch (err) {
    console.error("Error calculating hourly flow rates:", err);
    return generateSampleData("24h");
  }
}
