
import { calculateHourlyFlowRates } from "./waterUsageCalculations";
import { generateSampleData } from "./sampleChartData";

export function getHourlyFlowRates(allMeasurements: any[]) {
  try {
    if (!allMeasurements || allMeasurements.length < 2) {
      console.log("Not enough measurements to calculate flow rates", allMeasurements);
      return generateSampleData("24h");
    }

    console.log(`Processing ${allMeasurements.length} measurements for hourly flow rates`);

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

    // Sort all measurements by timestamp to ensure proper order
    enrichedMeasurements.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return timeA.getTime() - timeB.getTime();
    });

    // Log the first few measurements to help debug
    console.log("First few measurements:", 
      enrichedMeasurements.slice(0, 3).map(m => ({
        unitId: m.unitId,
        timestamp: m.timestamp,
        volume: m.volume,
        unit_type: m.unit_type
      }))
    );

    const chart = calculateHourlyFlowRates(enrichedMeasurements);
    
    // If calculation produces no points fallback to sample
    if (!chart || chart.length === 0) {
      console.warn("No hourly flow data calculated, using sample data");
      return generateSampleData("24h");
    }

    console.log(`Generated ${chart.length} hourly data points:`, chart.slice(0, 3));
    return chart;
  } catch (err) {
    console.error("Error calculating hourly flow rates:", err);
    return generateSampleData("24h");
  }
}
