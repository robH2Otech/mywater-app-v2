
import { calculateHourlyFlowRates } from "./waterUsageCalculations";
import { generateSampleData } from "./sampleChartData";

export function getHourlyFlowRates(allMeasurements: any[]) {
  try {
    // Add unit_type information to measurements if it doesn't exist
    const enrichedMeasurements = allMeasurements.map(measurement => {
      // If measurement already has unit_type, use it
      if (measurement.unit_type) return measurement;
      
      // Try to extract from unitId (e.g., "DROP_001" should be type "drop")
      const unitId = measurement.unitId || '';
      let unitType = 'uvc'; // Default type
      
      if (unitId.toLowerCase().includes('drop')) {
        unitType = 'drop';
      } else if (unitId.toLowerCase().includes('office')) {
        unitType = 'office';
      }
      
      return { ...measurement, unit_type: unitType };
    });

    const chart = calculateHourlyFlowRates(enrichedMeasurements);
    
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
