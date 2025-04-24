
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { TimeRange } from "@/hooks/chart/useWaterUsageData";  // for legend names

interface WaterUsageBarChartProps {
  data: any[];
  isLoading?: boolean;
  timeRange?: TimeRange; // We want to adjust labels and axes for each chart
}

const legendByRange = {
  "24h": "Hourly Flow Rate (m³/h)",
  "7d": "Daily Flow Rate (m³/day)",
  "30d": "Monthly Flow Rate (m³/month)",
  "6m": "Last 6-months Flow Rate (m³/month)"
};

const getYAxisMax = (data: any[], timeRange: TimeRange = "24h") => {
  const maxVolume = Math.max(...data.map(item => item.volume || 0));
  
  if (maxVolume <= 0) return 0.5; // Default for empty charts
  
  // For hourly data, set appropriate scale based on max value 
  if (timeRange === "24h") {
    if (maxVolume <= 0.1) return 0.1;
    if (maxVolume <= 0.2) return 0.2;
    if (maxVolume <= 0.5) return 0.5;
    if (maxVolume <= 1) return 1;
    if (maxVolume <= 2) return 2;
    if (maxVolume <= 5) return 5;
    if (maxVolume <= 10) return 10;
    
    // For larger values, round up to next 5
    return Math.ceil(maxVolume / 5) * 5;
  }
  
  // Keep original scaling for other time ranges
  if (timeRange === "7d") return Math.max(10, Math.ceil(maxVolume * 1.1));
  if (timeRange === "30d") return Math.max(10, Math.ceil(maxVolume * 1.1));
  if (timeRange === "6m") return Math.max(100, Math.ceil(maxVolume * 1.1));
  
  return Math.ceil(maxVolume * 1.1) || 0.5; // Ensure non-zero default
}

const getXAxisLabel = (range: TimeRange) => {
  if (range === "24h") return "Hour";
  if (range === "7d") return "Day";
  if (range === "30d") return "Day";
  if (range === "6m") return "Month";
  return "";
};

export const WaterUsageBarChart = ({ data, isLoading, timeRange = "24h" }: WaterUsageBarChartProps) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>{t("chart.loading")}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center flex-col">
        <p className="text-gray-400">{t("chart.no_data")}</p>
        <p className="text-xs text-gray-500 mt-2">No flow rate data available</p>
      </div>
    );
  }

  const hasNonZeroData = data.some(item => item.volume > 0);
  
  if (!hasNonZeroData) {
    return (
      <div className="h-full flex items-center justify-center flex-col">
        <p className="text-gray-400">No water usage recorded</p>
        <p className="text-xs text-gray-500 mt-2">All flow rates are zero for this period</p>
      </div>
    );
  }

  const yAxisMax = getYAxisMax(data, timeRange);
  const volumeUnit = data[0]?.volumeUnit || 'm³';  // Use unit from data if available

  const formatTooltipValue = (value: any, name: string, props: any) => {
    if (value <= 0) return ["No usage", ""];
    
    const dataPoint = data[props.payload.index];
    const units = dataPoint?.unitIds?.length > 0 
      ? `Units: ${dataPoint.unitIds.join(', ')}` 
      : 'No unit data';
    return [`${value} ${volumeUnit}`, units];
  };
  
  const formatXAxis = (label: string) => {
    if (timeRange === "24h") {
      return label; // Keep as HH:00
    }
    return label;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
        <XAxis
          dataKey="name"
          stroke="#666"
          tickMargin={10}
          label={{ value: getXAxisLabel(timeRange), position: "insideBottom", offset: -10, fill: "#666" }}
          interval={timeRange === "30d" ? 4 : "preserveStartEnd"}
          tickFormatter={formatXAxis}
        />
        <YAxis
          stroke="#666"
          domain={[0, yAxisMax]}
          tickFormatter={(value) => `${value}`}
          label={{ value: `${volumeUnit}/${timeRange === "24h" ? "h" : timeRange === "7d" || timeRange === "30d" ? "day" : "month"}`, angle: -90, position: 'insideLeft', fill: '#666' }}
        />
        <Tooltip
          formatter={formatTooltipValue}
          contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff' }}
          labelFormatter={(label) => `${getXAxisLabel(timeRange)}: ${label}`}
          isAnimationActive={true}
          animationDuration={300}
        />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={() => legendByRange[timeRange]}
        />
        <Bar
          dataKey="volume"
          fill="#39afcd"
          name={legendByRange[timeRange]}
          radius={[4, 4, 0, 0]}
          animationDuration={1000}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
