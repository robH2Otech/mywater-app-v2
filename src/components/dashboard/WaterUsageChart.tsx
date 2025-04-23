
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { WaterUsageBarChart } from "./chart/WaterUsageBarChart";
import { useWaterUsageData, TimeRange } from "@/hooks/chart/useWaterUsageData";
import { TimeRangeSelector } from "./chart/TimeRangeSelector";
import { ChartContainer } from "./chart/ChartContainer";

interface WaterUsageChartProps {
  units?: any[];
}

export const WaterUsageChart = ({ units = [] }: WaterUsageChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const { chartData, isLoading } = useWaterUsageData(units, timeRange);

  return (
    <Card className="p-6 glass lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Water Usage</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>
      <ChartContainer>
        <WaterUsageBarChart 
          data={chartData} 
          isLoading={isLoading} 
          timeRange={timeRange} 
        />
      </ChartContainer>
    </Card>
  );
};
