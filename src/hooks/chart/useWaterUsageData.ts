
import { useState, useEffect } from "react";
import { Timestamp, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { subDays, subHours, subMonths } from "date-fns";
import { calculateHourlyFlowRates } from "@/utils/chart/waterUsageCalculations";

export type TimeRange = "24h" | "7d" | "30d" | "6m";

export const useWaterUsageData = (units: any[] = [], timeRange: TimeRange) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMeasurementsForTimeRange = async (range: TimeRange) => {
    if (!units || units.length === 0) {
      setChartData([]);
      return;
    }

    setIsLoading(true);
    console.log(`Fetching measurements for time range: ${range}`);
    
    try {
      // Calculate date range based on selected timeRange
      const endDate = new Date();
      let startDate: Date;
      
      switch (range) {
        case "7d":
          startDate = subDays(endDate, 7);
          break;
        case "30d":
          startDate = subDays(endDate, 30);
          break;
        case "6m":
          startDate = subMonths(endDate, 6);
          break;
        case "24h":
        default:
          startDate = subHours(endDate, 24);
          break;
      }

      // Collect measurements for all units
      const allMeasurements = [];
      for (const unit of units) {
        if (!unit.id) continue;
        
        const collectionPath = unit.id.startsWith('MYWATER_') 
          ? `units/${unit.id}/data` 
          : `units/${unit.id}/measurements`;
        
        const q = query(
          collection(db, collectionPath),
          where("timestamp", ">=", Timestamp.fromDate(startDate)),
          where("timestamp", "<=", Timestamp.fromDate(endDate)),
          orderBy("timestamp", "asc")
        );
        
        const querySnapshot = await getDocs(q);
        const measurements = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        
        allMeasurements.push(...measurements);
      }
      
      // Calculate hourly flow rates
      const flowRates = calculateHourlyFlowRates(allMeasurements);
      console.log('Calculated flow rates:', flowRates);
      
      setChartData(flowRates);
    } catch (error) {
      console.error("Error fetching measurements for chart:", error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when time range or units update
  useEffect(() => {
    fetchMeasurementsForTimeRange(timeRange);
  }, [timeRange, units]);

  return { chartData, isLoading };
};
