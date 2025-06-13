
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
  const { measurements, isLoading: isMeasurementsLoading } = useMeasurementCollection(unitId);

  console.log("useWaterUsageData - Input unitId:", unitId);
  console.log("useWaterUsageData - Measurements received:", measurements?.length || 0);

  const processData = useCallback(() => {
    if (!measurements || measurements.length === 0) {
      console.log("useWaterUsageData - No measurements available");
      setData([]);
      setIsLoading(false);
      return;
    }

    console.log("useWaterUsageData - Processing measurements for timeRange:", timeRange);
    console.log("useWaterUsageData - Sample measurements:", measurements.slice(0, 3));

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

    console.log("useWaterUsageData - Processed data:", processedData);
    setData(processedData);
    setIsLoading(false);
  }, [measurements, timeRange]);

  useEffect(() => {
    setIsLoading(true);
    if (!isMeasurementsLoading) {
      processData();
    }
  }, [isMeasurementsLoading, timeRange, processData]);

  return {
    data,
    isLoading: isLoading || isMeasurementsLoading,
    timeRange,
    setTimeRange
  };
};
