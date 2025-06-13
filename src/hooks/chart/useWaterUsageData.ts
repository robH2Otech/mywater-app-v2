
import { useCallback, useState, useEffect } from "react";
import { useMeasurementCollection } from "@/hooks/measurements/useMeasurementCollection";
import { getHourlyFlowRates } from "@/utils/chart/getHourlyFlowRates";
import { getDailyTotals } from "@/utils/chart/getDailyTotals";
import { getMonthlyTotals } from "@/utils/chart/getMonthlyTotals";

export type TimeRange = "24h" | "7d" | "30d" | "6m";

export const useWaterUsageData = (unitId?: string | string[]) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { measurements, isLoading: isMeasurementsLoading, error: measurementsError } = useMeasurementCollection(unitId);

  console.log("📊 useWaterUsageData - Input unitId:", unitId);
  console.log("📊 useWaterUsageData - Measurements received:", measurements?.length || 0);
  console.log("📊 useWaterUsageData - isMeasurementsLoading:", isMeasurementsLoading);
  console.log("📊 useWaterUsageData - measurementsError:", measurementsError);

  const processData = useCallback(() => {
    try {
      setError(null);
      
      if (!measurements || measurements.length === 0) {
        console.log("📊 useWaterUsageData - No measurements available");
        setData([]);
        setIsLoading(false);
        return;
      }

      console.log("📊 useWaterUsageData - Processing measurements for timeRange:", timeRange);
      console.log("📊 useWaterUsageData - Sample measurements:", measurements.slice(0, 3).map(m => ({
        unitId: m.unitId,
        timestamp: m.timestamp,
        volume: m.volume,
        cumulative_volume: m.cumulative_volume
      })));

      let processedData: any[] = [];

      switch (timeRange) {
        case "24h":
          processedData = getHourlyFlowRates(measurements);
          break;
        case "7d":
          processedData = getDailyTotals(measurements);
          break;
        case "30d":
          processedData = getDailyTotals(measurements);
          break;
        case "6m":
          processedData = getMonthlyTotals(measurements);
          break;
      }

      console.log("📊 useWaterUsageData - Processed data:", processedData.length, "data points");
      console.log("📊 useWaterUsageData - Sample processed data:", processedData.slice(0, 3));
      
      setData(processedData);
      setIsLoading(false);
    } catch (err) {
      console.error("📊 useWaterUsageData - Error processing data:", err);
      setError(err as Error);
      setData([]);
      setIsLoading(false);
    }
  }, [measurements, timeRange]);

  useEffect(() => {
    setIsLoading(true);
    if (!isMeasurementsLoading) {
      processData();
    }
  }, [isMeasurementsLoading, timeRange, processData]);

  // Pass through measurement errors
  useEffect(() => {
    if (measurementsError) {
      setError(measurementsError as Error);
    }
  }, [measurementsError]);

  return {
    data,
    isLoading: isLoading || isMeasurementsLoading,
    timeRange,
    setTimeRange,
    error
  };
};
