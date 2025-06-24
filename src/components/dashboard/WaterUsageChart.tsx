
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
  const { t } = useLanguage();
  
  // Extract unit IDs more comprehensively
  const unitIds = units.map(unit => {
    // Try multiple possible ID field names
    const id = unit.id || unit.unitId || unit.unit_id || unit._id || unit.name;
    return id;
  }).filter(Boolean); // Remove any undefined/null values
  
  console.log("🏠 WaterUsageChart - Units received:", units.length);
  console.log("🏠 WaterUsageChart - Sample units:", units.slice(0, 2).map(u => ({
    id: u.id,
    name: u.name,
    unitId: u.unitId,
    unit_id: u.unit_id
  })));
  console.log("🏠 WaterUsageChart - Extracted unit IDs:", unitIds);
  
  // Use the hook with the unit IDs
  const { data, isLoading, timeRange, setTimeRange, error } = useWaterUsageData(unitIds.length > 0 ? unitIds : undefined);

  // Sync the local state with the hook's state
  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    console.log("🏠 WaterUsageChart - Time range changed to:", newTimeRange);
    setSelectedTimeRange(newTimeRange);
    setTimeRange(newTimeRange);
  };

  // Show error state if there's an error
  if (error) {
    console.error("🏠 WaterUsageChart - Error:", error);
  }

  return (
    <Card className="p-6 glass lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">{t("chart.water.usage")}</h2>
          <p className="text-sm text-gray-400">
            {unitIds.length > 0 ? `${unitIds.length} ${t("dashboard.units")}` : t("chart.no.units")} • {data?.length || 0} {t("chart.data.points")}
          </p>
        </div>
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
