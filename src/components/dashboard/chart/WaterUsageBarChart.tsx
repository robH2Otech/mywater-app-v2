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
  "7d": "Daily Flow Rate (m³/h)",
  "30d": "Monthly Flow Rate (m³/h)",
  "6m": "Last 6-months Flow Rate (m³/h)"
};

const getYAxisMax = (data: any[], timeRange: TimeRange = "24h") => {
  const maxVolume = Math.max(...data.map(item => item.volume || 0));
  
  if (timeRange === "24h") {
    // For hourly data, set appropriate scale based on max value
    if (maxVolume <= 1) return 1;
    if (maxVolume <= 3) return 3;
    if (maxVolume <= 5) return 5;
    if (maxVolume <= 10) return 10;
    
    // For anything larger, round up to nearest integer
    return Math.ceil(maxVolume);
  }
  
  // Keep original scaling for other time ranges
  if (timeRange === "7d") return Math.max(1000, Math.ceil(maxVolume * 1.1));
  if (timeRange === "30d") return Math.max(1000, Math.ceil(maxVolume * 1.1));
  if (timeRange === "6m") return Math.max(20000, Math.ceil(maxVolume * 1.1));
  
  return Math.ceil(maxVolume * 1.1);
}

const getXAxisLabel = (range: TimeRange) => {
  if (range === "24h") return "Time";
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

  const yAxisMax = getYAxisMax(data, timeRange);
  const volumeUnit = data[0]?.volumeUnit || 'm³';  // Use unit from data if available

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
        <XAxis
          dataKey="name"
          stroke="#666"
          tickMargin={10}
          label={{ value: getXAxisLabel(timeRange), position: "insideBottom", offset: -10, fill: "#666" }}
          // For 30d, show only key ticks
          interval={timeRange === "30d" ? 0 : undefined}
          tickFormatter={label => label}
        />
        <YAxis
          stroke="#666"
          domain={[0, yAxisMax]}
          tickFormatter={(value) => `${value}`}
          label={{ value: volumeUnit + '/h', angle: -90, position: 'insideLeft', fill: '#666' }}
        />
        <Tooltip
          formatter={(value: number) => [`${value} ${volumeUnit}/h`, legendByRange[timeRange] ]}
          contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff' }}
          labelFormatter={(label) => `${getXAxisLabel(timeRange)}: ${label}`}
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
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
