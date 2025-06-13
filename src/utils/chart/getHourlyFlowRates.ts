
import { calculateHourlyFlowRates } from "./waterUsageCalculations";
import { generateSampleData } from "./sampleChartData";

export function getHourlyFlowRates(allMeasurements: any[]) {
  try {
    if (!allMeasurements || allMeasurements.length < 2) {
      console.log("📊 getHourlyFlowRates - Not enough measurements to calculate flow rates", allMeasurements?.length || 0);
      console.log("📊 getHourlyFlowRates - Using sample data as fallback");
      return generateSampleData("24h");
    }

    console.log(`📊 getHourlyFlowRates - Processing ${allMeasurements.length} measurements for hourly flow rates`);

    // Sort all measurements by timestamp to ensure proper order
    const sortedMeasurements = [...allMeasurements].sort((a, b) => {
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);
      return timeA.getTime() - timeB.getTime();
    });

    // Add unit_type information to measurements if it doesn't exist
    const enrichedMeasurements = sortedMeasurements.map(measurement => {
      // If measurement already has unit_type, use it
      if (measurement.unit_type) return measurement;
      
      // Try to extract from unitId (e.g., "MYWATER_001" should be type "uvc")
      const unitId = measurement.unitId || measurement.unit_id || measurement.id || '';
      let unitType = 'uvc'; // Default type for MYWATER units
      
      if (unitId.toLowerCase().includes('drop')) {
        unitType = 'drop';
      } else if (unitId.toLowerCase().includes('office')) {
        unitType = 'office';
      } else if (unitId.toLowerCase().includes('mywater') || unitId.toLowerCase().includes('uvc')) {
        // MYWATER devices typically measure in m³ directly
        unitType = 'uvc';
      }
      
      return { ...measurement, unit_type: unitType };
    });
    
    // Log the first few measurements for debugging
    console.log("📊 getHourlyFlowRates - First few enriched measurements:", 
      enrichedMeasurements.slice(0, 3).map(m => ({
        unitId: m.unitId || m.unit_id || m.id,
        timestamp: new Date(m.timestamp).toISOString(),
        volume: m.volume || m.cumulative_volume || 0,
        unit_type: m.unit_type
      }))
    );

    // Calculate hourly flow rates
    const hourlyDataPoints = calculateHourlyFlowRates(enrichedMeasurements);
    
    // If calculation produces no points or all zeroes, provide meaningful fallback
    if (!hourlyDataPoints || hourlyDataPoints.length === 0) {
      console.warn("📊 getHourlyFlowRates - No valid hourly flow data calculated");
      return generateSampleData("24h");
    }

    // Check if we have any non-zero values
    const hasRealData = hourlyDataPoints.some(point => point.volume > 0);
    if (!hasRealData) {
      console.warn("📊 getHourlyFlowRates - All calculated values are zero, using sample data");
      return generateSampleData("24h");
    }

    console.log(`📊 getHourlyFlowRates - Generated ${hourlyDataPoints.length} hourly data points with ${hourlyDataPoints.filter(p => p.volume > 0).length} non-zero values`);
    console.log("📊 getHourlyFlowRates - Sample output:", hourlyDataPoints.slice(0, 5));
    
    return hourlyDataPoints;
  } catch (err) {
    console.error("📊 getHourlyFlowRates - Error calculating hourly flow rates:", err);
    return generateSampleData("24h");
  }
}
