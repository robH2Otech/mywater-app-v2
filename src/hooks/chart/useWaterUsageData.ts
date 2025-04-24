
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

  const processData = useCallback(() => {
    if (!measurements || measurements.length === 0) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let processedData: any[] = [];

    switch (timeRange) {
      case "24h":
        processedData = getHourlyFlowRates(measurements);
        break;
      case "7d":
        processedData = getDailyTotals(measurements, 7);
        break;
      case "30d":
        processedData = getDailyTotals(measurements, 30);
        break;
      case "6m":
        processedData = getMonthlyTotals(measurements, 6);
        break;
    }

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
