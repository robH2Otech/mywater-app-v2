
import { useState, useEffect, useMemo } from "react";
import { Timestamp, collection, query, where, orderBy, getDocs, limit, documentId } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { subDays, subHours, subMonths } from "date-fns";
import { generateSampleData } from "@/utils/chart/sampleChartData";
import { getHourlyFlowRates } from "@/utils/chart/getHourlyFlowRates";
import { getDailyTotals } from "@/utils/chart/getDailyTotals";
import { getImportantDaysTotals } from "@/utils/chart/getImportantDaysTotals";
import { getMonthlyTotals } from "@/utils/chart/getMonthlyTotals";

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
            measurementLimit = 500; // Increased for better data resolution
            break;
          case "30d":
            startDate = subDays(endDate, 30);
            measurementLimit = 1000;
            break;
          case "6m":
            startDate = subMonths(endDate, 6);
            measurementLimit = 1000;
            break;
          case "24h":
          default:
            startDate = subHours(endDate, 24);
            measurementLimit = 500; // Increased to capture more hourly data points
            break;
        }

        const allMeasurements = [];
        console.log(`Fetching data for ${units.length} units, timeRange: ${timeRange}`);
        console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

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
              console.log(`No data for unit ${unit.id}`);
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
              
              // Add unitId and unit_type to each measurement
              return { 
                ...data, 
                id: doc.id, 
                timestamp,
                unitId: unit.id,
                unit_type: unit.unit_type || 'uvc' // Default to uvc if not specified
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

        let chart: any[] = [];

        if (allMeasurements.length < 2) {
          console.warn("Not enough measurements, using sample data");
          setChartData(generateSampleData(timeRange));
          setIsLoading(false);
          return;
        }

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

        setChartData(chartWithUnits);
      } catch (error) {
        console.error(`Error fetching ${timeRange} data:`, error);
        setChartData(generateSampleData(timeRange));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeasurementsForTimeRange();
  }, [timeRange, unitIds]); // Using stable unitIds array in dependency

  return { chartData, isLoading };
};
