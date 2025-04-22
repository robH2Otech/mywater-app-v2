
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { WaterUsageBarChart } from "./chart/WaterUsageBarChart";
import { useWaterUsageData, TimeRange } from "@/hooks/chart/useWaterUsageData";

interface WaterUsageChartProps {
  units?: any[];
}

export const WaterUsageChart = ({ units = [] }: WaterUsageChartProps) => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const { chartData, isLoading } = useWaterUsageData(units, timeRange);

  return (
    <Card className="p-6 glass lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Water Usage</h2>
        <Select
          value={timeRange}
          onValueChange={(value: TimeRange) => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px] bg-spotify-darker border-spotify-accent">
            <SelectValue placeholder={t("chart.select.timerange")} />
          </SelectTrigger>
          <SelectContent className="bg-spotify-darker border-spotify-accent">
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-[300px]">
        <WaterUsageBarChart data={chartData} isLoading={isLoading} />
      </div>
    </Card>
  );
};
