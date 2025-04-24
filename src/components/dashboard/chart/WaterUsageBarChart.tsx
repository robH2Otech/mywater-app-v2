
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
import { TimeRange } from "@/hooks/chart/useWaterUsageData";
import { useEffect, useState } from "react";

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
    if (maxVolume <= 0.05) return 0.05;
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
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [maxYAxis, setMaxYAxis] = useState<number>(1);

  // Process data when it changes
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    console.log(`Processing ${data.length} data points for chart display`);
    
    // Format data for chart display (round values for cleaner display)
    const processed = data.map(item => ({
      ...item,
      volume: Number(Number(item.volume).toFixed(4)), // Keep 4 decimal places for small values
    }));
    
    // Set the Y-axis maximum based on the data
    const yMax = getYAxisMax(processed, timeRange);
    setMaxYAxis(yMax);
    setProcessedData(processed);
    
    // Log some diagnostic info
    const nonZeroPoints = processed.filter(item => item.volume > 0).length;
    console.log(`Chart has ${nonZeroPoints} non-zero data points out of ${processed.length} total`);
    console.log(`Y-axis maximum set to ${yMax}`);
    
    if (nonZeroPoints > 0) {
      const maxPoint = processed.reduce((max, item) => 
        item.volume > max.volume ? item : max, processed[0]);
      console.log(`Maximum data point: ${maxPoint.name} = ${maxPoint.volume}`);
    }
  }, [data, timeRange]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-2">{t("chart.loading")}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center flex-col">
        <p className="text-gray-400">{t("chart.no_data")}</p>
        <p className="text-xs text-gray-500 mt-2">No flow rate data available</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Refresh Data
        </button>
      </div>
    );
  }

  const hasNonZeroData = data.some(item => item.volume > 0);
  
  if (!hasNonZeroData) {
    return (
      <div className="h-full flex items-center justify-center flex-col">
        <p className="text-gray-400">No water usage recorded</p>
        <p className="text-xs text-gray-500 mt-2">All flow rates are zero for this period</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Refresh Data
        </button>
      </div>
    );
  }

  const volumeUnit = data[0]?.volumeUnit || 'm³';  // Use unit from data if available

  const formatTooltipValue = (value: any, name: string, props: any) => {
    if (value <= 0) return ["No usage", ""];
    
    const dataPoint = data[props.payload.index];
    const units = dataPoint?.unitIds?.length > 0 
      ? `Units: ${dataPoint.unitIds.join(', ')}` 
      : 'No unit data';
    
    // Format the value based on its magnitude
    let formattedValue = value;
    if (value < 0.01) {
      formattedValue = value.toFixed(4);
    } else if (value < 0.1) {
      formattedValue = value.toFixed(3);
    } else if (value < 1) {
      formattedValue = value.toFixed(2);
    } else {
      formattedValue = value.toFixed(1);
    }
    
    return [`${formattedValue} ${volumeUnit}`, units];
  };
  
  const formatXAxis = (label: string) => {
    if (timeRange === "24h") {
      return label; // Keep as HH:00
    }
    return label;
  };

  const formatYAxis = (value: number) => {
    if (value === 0) return '0';
    if (value < 0.01) return value.toFixed(3);
    if (value < 0.1) return value.toFixed(2);
    if (value < 1) return value.toFixed(1);
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const volume = dataPoint.volume;
      const units = dataPoint.unitIds || [];
      
      let volumeDisplay;
      if (volume < 0.01) {
        volumeDisplay = volume.toFixed(4);
      } else if (volume < 0.1) {
        volumeDisplay = volume.toFixed(3);
      } else if (volume < 1) {
        volumeDisplay = volume.toFixed(2);
      } else {
        volumeDisplay = volume.toFixed(1);
      }
      
      return (
        <div className="bg-gray-800 p-3 rounded shadow border border-gray-700 text-white text-sm">
          <p className="font-medium">Hour: {label}</p>
          <p className="text-blue-300">{units.length ? units.join(', ') : 'No unit data'}: {volumeDisplay} m³</p>
          {units.length > 1 && (
            <p className="text-xs text-gray-400 mt-1">Multiple units contributing to this value</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
          domain={[0, maxYAxis]}
          tickFormatter={formatYAxis}
          label={{ value: `${volumeUnit}/${timeRange === "24h" ? "h" : timeRange === "7d" || timeRange === "30d" ? "day" : "month"}`, angle: -90, position: 'insideLeft', fill: '#666' }}
        />
        <Tooltip content={<CustomTooltip />} />
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
