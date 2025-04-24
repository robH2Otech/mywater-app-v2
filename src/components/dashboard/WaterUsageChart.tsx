
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WaterUsageBarChart } from "./chart/WaterUsageBarChart";
import { useWaterUsageData, TimeRange } from "@/hooks/chart/useWaterUsageData";
import { TimeRangeSelector } from "./chart/TimeRangeSelector";
import { ChartContainer } from "./chart/ChartContainer";

interface WaterUsageChartProps {
  units?: any[];
}

export const WaterUsageChart = ({ units = [] }: WaterUsageChartProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("24h");
  
  // Extract unit IDs from the units array
  const unitIds = units.map(unit => unit.id);
  
  // Use the hook with the unit IDs
  const { data, isLoading, timeRange, setTimeRange } = useWaterUsageData(unitIds.length > 0 ? unitIds : undefined);

  // Sync the local state with the hook's state
  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setSelectedTimeRange(newTimeRange);
    setTimeRange(newTimeRange);
  };

  return (
    <Card className="p-6 glass lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Water Usage</h2>
        <TimeRangeSelector value={selectedTimeRange} onChange={handleTimeRangeChange} />
      </div>
      <ChartContainer>
        <WaterUsageBarChart 
          data={data} 
          isLoading={isLoading} 
          timeRange={timeRange} 
        />
      </ChartContainer>
    </Card>
  );
};
