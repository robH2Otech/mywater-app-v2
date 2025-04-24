
import { calculateHourlyFlowRates } from "./waterUsageCalculations";
import { generateSampleData } from "./sampleChartData";

export function getHourlyFlowRates(allMeasurements: any[]) {
  try {
    if (!allMeasurements || allMeasurements.length < 2) {
      console.log("Not enough measurements to calculate flow rates", allMeasurements);
      return generateSampleData("24h");
    }

    console.log(`Processing ${allMeasurements.length} measurements for hourly flow rates`);

    // Sort all measurements by timestamp to ensure proper order
    const sortedMeasurements = [...allMeasurements].sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return timeA.getTime() - timeB.getTime();
    });

    // Add unit_type information to measurements if it doesn't exist
    const enrichedMeasurements = sortedMeasurements.map(measurement => {
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
    
    // Log the first few measurements for debugging
    console.log("First few sorted measurements:", 
      enrichedMeasurements.slice(0, 3).map(m => ({
        unitId: m.unitId,
        timestamp: new Date(m.timestamp).toISOString(),
        volume: m.volume,
        unit_type: m.unit_type
      }))
    );

    // Group measurements by unitId for more accurate flow rate calculation
    const measurementsByUnit: {[unitId: string]: any[]} = {};
    
    enrichedMeasurements.forEach(measurement => {
      const unitId = measurement.unitId || 'unknown';
      if (!measurementsByUnit[unitId]) {
        measurementsByUnit[unitId] = [];
      }
      measurementsByUnit[unitId].push(measurement);
    });
    
    // Calculate hourly flow rates by checking differences within each hour
    const hourlyDataPoints = calculateHourlyFlowRates(enrichedMeasurements);
    
    // If calculation produces no points fallback to sample
    if (!hourlyDataPoints || hourlyDataPoints.length === 0) {
      console.warn("No hourly flow data calculated, using sample data");
      return generateSampleData("24h");
    }

    console.log(`Generated ${hourlyDataPoints.length} hourly data points:`, hourlyDataPoints.slice(0, 3));
    return hourlyDataPoints;
  } catch (err) {
    console.error("Error calculating hourly flow rates:", err);
    return generateSampleData("24h");
  }
}
