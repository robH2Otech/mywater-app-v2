
import { useState, useEffect } from "react";
import { Timestamp, collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { subDays, subHours, subMonths } from "date-fns";
import { calculateHourlyFlowRates } from "@/utils/chart/waterUsageCalculations";
import { groupByDay, groupByImportantDays, groupByMonth } from "@/hooks/chart/useGroupedData";
import { generateSampleData } from "@/utils/chart/sampleChartData";

export type TimeRange = "24h" | "7d" | "30d" | "6m";

export const useWaterUsageData = (units: any[] = [], timeRange: TimeRange) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMeasurementsForTimeRange = async (range: TimeRange) => {
    if (!units || units.length === 0) {
      console.log("No units provided for water usage chart");
      setChartData([]);
      return;
    }

    setIsLoading(true);
    try {
      const endDate = new Date();
      let startDate: Date;
      let measurementLimit: number;

      switch (range) {
        case "7d":
          startDate = subDays(endDate, 7);
          measurementLimit = 168;
          break;
        case "30d":
          startDate = subDays(endDate, 30);
          measurementLimit = 200;
          break;
        case "6m":
          startDate = subMonths(endDate, 6);
          measurementLimit = 400;
          break;
        case "24h":
        default:
          startDate = subHours(endDate, 24);
          measurementLimit = 100;
          break;
      }

      const allMeasurements = [];
      let unitTypeIsFilter = false;

      // Fetch measurements for all units
      for (const unit of units) {
        if (!unit.id) continue;
        
        if (unit.unit_type === 'drop' || unit.unit_type === 'office') {
          unitTypeIsFilter = true;
        }
        
        const collectionPath = unit.id.startsWith("MYWATER_")
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
          if (querySnapshot.empty) continue;
          
          const measurements = querySnapshot.docs.map(doc => {
            const data = doc.data();
            let timestamp = data.timestamp;
            
            if (timestamp && typeof timestamp.toDate === "function") {
              timestamp = timestamp.toDate();
            } else if (typeof timestamp === "string") {
              timestamp = new Date(timestamp);
            }
            
            return { ...data, id: doc.id, timestamp };
          });
          
          allMeasurements.push(...measurements);
        } catch (err) {
          console.log(`Error fetching measurements for unit ${unit.id}:`, err);
        }
      }

      console.log(`Fetched ${allMeasurements.length} measurements for ${range} chart`);

      let chart: any[] = [];

      if (allMeasurements.length < 2) {
        setChartData(generateSampleData(range));
        setIsLoading(false);
        return;
      }

      // Process data based on time range
      switch (range) {
        case "24h":
          try {
            chart = calculateHourlyFlowRates(allMeasurements);
            console.log(`Calculated ${chart.length} hourly flow rates`);

            if (chart.length === 0) {
              chart = generateSampleData("24h");
            }
          } catch (error) {
            console.error("Error calculating hourly flow rates:", error);
            chart = generateSampleData("24h");
          }
          break;
          
        case "7d":
          chart = groupByDay(allMeasurements);
          break;
          
        case "30d":
          chart = groupByImportantDays(allMeasurements);
          break;
          
        case "6m":
          chart = groupByMonth(allMeasurements);
          break;
      }

      // Add volume unit to each data point
      const chartWithUnits = chart.map(item => ({
        ...item,
        volumeUnit: unitTypeIsFilter ? 'L' : 'm³'
      }));

      setChartData(chartWithUnits);
    } catch (error) {
      console.error(`Error fetching ${timeRange} data:`, error);
      setChartData(generateSampleData(range));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurementsForTimeRange(timeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, JSON.stringify(units)]);

  return { chartData, isLoading };
};
