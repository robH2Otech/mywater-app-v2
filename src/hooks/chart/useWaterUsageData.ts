
import { useState, useEffect, useMemo } from "react";
import { Timestamp, collection, query, where, orderBy, getDocs, limit, documentId, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { subDays, subHours, subMonths, format } from "date-fns";
import { generateSampleData } from "@/utils/chart/sampleChartData";
import { getHourlyFlowRates } from "@/utils/chart/getHourlyFlowRates";
import { getDailyTotals } from "@/utils/chart/getDailyTotals";
import { getImportantDaysTotals } from "@/utils/chart/getImportantDaysTotals";
import { getMonthlyTotals } from "@/utils/chart/getMonthlyTotals";
import { toast } from "sonner";

export type TimeRange = "24h" | "7d" | "30d" | "6m";

export const useWaterUsageData = (units: any[] = [], timeRange: TimeRange) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a stable array of unitIds to use in the dependency array
  const unitIds = useMemo(() => units.map(unit => unit.id).filter(Boolean), [units]);

  useEffect(() => {
    const fetchMeasurementsForTimeRange = async () => {
      if (!units || units.length === 0) {
        console.log("No units provided for water usage chart");
        setChartData(generateSampleData(timeRange));
        return;
      }

      setIsLoading(true);
      try {
        const endDate = new Date();
        let startDate: Date;
        let measurementLimit: number;

        switch (timeRange) {
          case "7d":
            startDate = subDays(endDate, 7);
            measurementLimit = 1000; // Increased for better data resolution
            break;
          case "30d":
            startDate = subDays(endDate, 30);
            measurementLimit = 1500;
            break;
          case "6m":
            startDate = subMonths(endDate, 6);
            measurementLimit = 2000;
            break;
          case "24h":
          default:
            startDate = subHours(endDate, 24);
            measurementLimit = 1000; // Increased to capture more hourly data points
            break;
        }

        const allMeasurements = [];
        console.log(`Fetching data for ${units.length} units, timeRange: ${timeRange}`);
        console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // Generate sample data for development if no real data is available
        const shouldGenerateData = false; // Toggle this for development testing
        if (shouldGenerateData) {
          await generateSampleMeasurements(units, startDate, endDate);
        }

        // Fetch measurements for all units
        for (const unit of units) {
          if (!unit.id) continue;
          
          const collectionPath = unit.id.startsWith("MYWATER_") || unit.id.includes("MYWATER")
            ? `units/${unit.id}/data`
            : `units/${unit.id}/measurements`;

          try {
            const q = query(
              collection(db, collectionPath),
              where("timestamp", ">=", Timestamp.fromDate(startDate)),
              where("timestamp", "<=", Timestamp.fromDate(endDate)),
              orderBy("timestamp", "asc"),
              limit(measurementLimit)
            );
            
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
              console.log(`No data for unit ${unit.id}, trying alternate paths...`);
              
              // Try alternate collection paths if primary is empty
              const altPaths = [`units/${unit.id}/data`, `units/${unit.id}/measurements`];
              for (const path of altPaths) {
                if (path === collectionPath) continue; // Skip if already checked
                
                const altQuery = query(
                  collection(db, path),
                  where("timestamp", ">=", Timestamp.fromDate(startDate)),
                  where("timestamp", "<=", Timestamp.fromDate(endDate)),
                  orderBy("timestamp", "asc"),
                  limit(measurementLimit)
                );
                
                const altSnapshot = await getDocs(altQuery);
                if (!altSnapshot.empty) {
                  console.log(`Found ${altSnapshot.size} measurements in alternate path: ${path}`);
                  
                  const unitMeasurements = altSnapshot.docs.map(doc => {
                    const data = doc.data();
                    let timestamp = data.timestamp;
                    
                    if (timestamp && typeof timestamp.toDate === "function") {
                      timestamp = timestamp.toDate();
                    } else if (typeof timestamp === "string") {
                      timestamp = new Date(timestamp);
                    }
                    
                    // Extract volume from various possible fields
                    let volume = 0;
                    if (typeof data.volume === 'number') {
                      volume = data.volume;
                    } else if (typeof data.volume === 'string') {
                      volume = parseFloat(data.volume) || 0;
                    } else if (typeof data.value === 'number') {
                      volume = data.value;
                    } else if (typeof data.total_volume === 'number') {
                      volume = data.total_volume;
                    }
                    
                    // Add unitId and unit_type to each measurement
                    return { 
                      ...data, 
                      id: doc.id, 
                      timestamp,
                      unitId: unit.id,
                      unit_type: unit.unit_type || 'uvc', // Default to uvc if not specified
                      volume // Use extracted volume
                    };
                  });
                  
                  allMeasurements.push(...unitMeasurements);
                  break; // Stop checking alternate paths if we found data
                }
              }
              continue;
            }
            
            const unitMeasurements = querySnapshot.docs.map(doc => {
              const data = doc.data();
              let timestamp = data.timestamp;
              
              if (timestamp && typeof timestamp.toDate === "function") {
                timestamp = timestamp.toDate();
              } else if (typeof timestamp === "string") {
                timestamp = new Date(timestamp);
              }
              
              // Extract volume from various possible fields
              let volume = 0;
              if (typeof data.volume === 'number') {
                volume = data.volume;
              } else if (typeof data.volume === 'string') {
                volume = parseFloat(data.volume) || 0;
              } else if (typeof data.value === 'number') {
                volume = data.value;
              } else if (typeof data.total_volume === 'number') {
                volume = data.total_volume;
              }
              
              // Add unitId and unit_type to each measurement
              return { 
                ...data, 
                id: doc.id, 
                timestamp,
                unitId: unit.id,
                unit_type: unit.unit_type || 'uvc', // Default to uvc if not specified
                volume // Use extracted volume
              };
            });
            
            console.log(`Fetched ${unitMeasurements.length} measurements for unit ${unit.id}`);
            if (unitMeasurements.length > 0) {
              console.log(`Sample measurement:`, {
                unitId: unitMeasurements[0].unitId,
                timestamp: unitMeasurements[0].timestamp,
                volume: unitMeasurements[0].volume,
                unit_type: unitMeasurements[0].unit_type
              });
            }
            
            allMeasurements.push(...unitMeasurements);
          } catch (err) {
            console.error(`Error fetching measurements for unit ${unit.id}:`, err);
          }
        }

        console.log(`Total fetched: ${allMeasurements.length} measurements for ${timeRange} chart`);

        // If we don't have enough measurements even after trying alternate paths, 
        // generate some sample data with the actual unit IDs
        if (allMeasurements.length < 2) {
          console.warn("Not enough measurements, generating sample data with real unit IDs");
          // Generate sample data that includes actual unit IDs for development and testing
          const sampleData = generateSampleDataWithUnitIds(timeRange, unitIds);
          setChartData(sampleData);
          setIsLoading(false);
          return;
        }

        let chart: any[] = [];

        // Use utilities for data transformation based on time range
        switch (timeRange) {
          case "24h":
            chart = getHourlyFlowRates(allMeasurements);
            break;      
          case "7d":
            chart = getDailyTotals(allMeasurements);
            break;      
          case "30d":
            chart = getImportantDaysTotals(allMeasurements);
            break;      
          case "6m":
            chart = getMonthlyTotals(allMeasurements);
            break;
        }

        // Add volume unit to each data point
        const chartWithUnits = chart.map(item => ({
          ...item,
          volumeUnit: 'm³' // Always use m³ as we convert liters to m³
        }));

        if (chartWithUnits.length > 0) {
          console.log(`Chart data ready with ${chartWithUnits.length} data points`, chartWithUnits[0]);
        } else {
          console.warn("Generated chart has no data points");
        }

        setChartData(chartWithUnits);
      } catch (error) {
        console.error(`Error fetching ${timeRange} data:`, error);
        const sampleData = generateSampleDataWithUnitIds(timeRange, unitIds);
        setChartData(sampleData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeasurementsForTimeRange();
  }, [timeRange, unitIds]); // Using stable unitIds array in dependency

  return { chartData, isLoading };
};

// Helper function to generate sample data that includes real unit IDs
function generateSampleDataWithUnitIds(timeRange: TimeRange, unitIds: string[]): any[] {
  const sampleData = generateSampleData(timeRange);
  
  // Add unit IDs to each data point to make the sample data more realistic
  return sampleData.map(item => ({
    ...item,
    unitIds: unitIds.length > 0 ? [unitIds[Math.floor(Math.random() * unitIds.length)]] : ['sample-unit']
  }));
}

// Helper function to generate realistic sample measurements for development
async function generateSampleMeasurements(units: any[], startDate: Date, endDate: Date) {
  // Only use this in development environments!
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) return;

  console.log("Generating sample measurements for development...");
  
  for (const unit of units) {
    if (!unit.id) continue;
    
    const collectionPath = `units/${unit.id}/measurements`;
    let currentDate = new Date(startDate);
    let cumulativeVolume = Math.random() * 100; // Start with a random base volume
    
    // Generate a measurement every hour
    while (currentDate <= endDate) {
      const hourlyIncrement = Math.random() * 0.5; // Random increase between 0 and 0.5 m³
      cumulativeVolume += hourlyIncrement;
      
      try {
        await addDoc(collection(db, collectionPath), {
          timestamp: Timestamp.fromDate(currentDate),
          volume: cumulativeVolume,
          unit_type: unit.unit_type || 'uvc'
        });
      } catch (err) {
        console.error(`Error adding sample measurement for unit ${unit.id}:`, err);
      }
      
      // Advance by 1 hour
      currentDate = new Date(currentDate.getTime() + 60 * 60 * 1000);
    }
  }
  
  console.log("Sample data generation complete");
}
