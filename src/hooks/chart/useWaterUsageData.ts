
import { useState, useEffect } from "react";
import { Timestamp, collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { subDays, subHours, subMonths } from "date-fns";
import { calculateHourlyFlowRates } from "@/utils/chart/waterUsageCalculations";

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
    console.log(`Fetching measurements for time range: ${range}, units:`, units.length);
    
    try {
      // Calculate date range based on selected timeRange
      const endDate = new Date();
      let startDate: Date;
      let measurementLimit: number;
      
      switch (range) {
        case "7d":
          startDate = subDays(endDate, 7);
          measurementLimit = 168; // 24hrs * 7 days
          break;
        case "30d":
          startDate = subDays(endDate, 30);
          measurementLimit = 96; // Reduced for performance, ~3 per day
          break;
        case "6m":
          startDate = subMonths(endDate, 6);
          measurementLimit = 180; // Reduced for performance, ~1 per day
          break;
        case "24h":
        default:
          startDate = subHours(endDate, 24);
          measurementLimit = 48; // 2 per hour for 24 hours
          break;
      }

      // Collect measurements for all units
      const allMeasurements = [];
      for (const unit of units) {
        if (!unit.id) {
          console.log("Unit missing ID, skipping");
          continue;
        }
        
        const collectionPath = unit.id.startsWith('MYWATER_') 
          ? `units/${unit.id}/data` 
          : `units/${unit.id}/measurements`;
        
        console.log(`Fetching from collection: ${collectionPath}`);
        
        const q = query(
          collection(db, collectionPath),
          where("timestamp", ">=", Timestamp.fromDate(startDate)),
          where("timestamp", "<=", Timestamp.fromDate(endDate)),
          orderBy("timestamp", "asc"),
          limit(measurementLimit)
        );
        
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} measurements for unit ${unit.id}`);
        
        if (querySnapshot.empty) {
          console.log("No measurements found for unit:", unit.id);
          continue;
        }
        
        const measurements = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Convert Firestore timestamp to JS Date
          let timestamp = data.timestamp;
          if (timestamp && typeof timestamp.toDate === 'function') {
            timestamp = timestamp.toDate();
          } else if (typeof timestamp === 'string') {
            timestamp = new Date(timestamp);
          }
          
          return {
            ...data,
            id: doc.id,
            timestamp: timestamp
          };
        });
        
        allMeasurements.push(...measurements);
      }
      
      console.log("All measurements collected:", allMeasurements.length);
      
      if (allMeasurements.length === 0) {
        // Generate sample data if no real measurements found
        console.log("No actual measurements found, generating sample data");
        const sampleData = generateSampleData(24);
        setChartData(sampleData);
      } else {
        // Calculate hourly flow rates from measurements
        const flowRates = calculateHourlyFlowRates(allMeasurements);
        console.log('Calculated flow rates for chart:', flowRates.length);
        
        setChartData(flowRates);
      }
    } catch (error) {
      console.error("Error fetching measurements for chart:", error);
      // Fallback to sample data on error
      const sampleData = generateSampleData(24);
      setChartData(sampleData);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate sample data for testing or when no data is available
  const generateSampleData = (hours: number) => {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < hours; i++) {
      const time = new Date(now);
      time.setHours(now.getHours() - (hours - i));
      
      data.push({
        name: time.getHours().toString().padStart(2, '0') + ':00',
        volume: Math.random() * 5 + 2 // Random volume between 2-7 m³/h
      });
    }
    
    console.log("Generated sample data:", data.length);
    return data;
  };

  // Fetch data when time range or units update
  useEffect(() => {
    fetchMeasurementsForTimeRange(timeRange);
  }, [timeRange, units]);

  return { chartData, isLoading };
};
