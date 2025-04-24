
import React from "react";
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
import { TimeRange } from "@/hooks/chart/useWaterUsageData";
import { WaterUsageTooltip } from "./WaterUsageTooltip";

interface WaterUsageBarChartProps {
  data: any[];
  isLoading?: boolean;
  timeRange?: TimeRange;
}

const legendByRange = {
  "24h": "Hourly Flow Rate (m³/h)",
  "7d": "Daily Flow Rate (m³/day)",
  "30d": "Monthly Flow Rate (m³/month)",
  "6m": "Last 6-months Flow Rate (m³/month)"
};

export const WaterUsageBarChart = ({ 
  data, 
  isLoading, 
  timeRange = "24h" 
}: WaterUsageBarChartProps) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-2">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center flex-col">
        <p className="text-gray-400">No water usage data available</p>
      </div>
    );
  }

  const maxVolume = Math.max(...data.map(item => item.volume || 0));
  const yAxisMax = maxVolume <= 0 ? 0.5 : 
    maxVolume <= 0.05 ? 0.05 :
    maxVolume <= 0.1 ? 0.1 :
    maxVolume <= 0.2 ? 0.2 :
    maxVolume <= 0.5 ? 0.5 :
    maxVolume <= 1 ? 1 :
    maxVolume <= 2 ? 2 :
    maxVolume <= 5 ? 5 :
    maxVolume <= 10 ? 10 :
    Math.ceil(maxVolume / 5) * 5;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
        <XAxis
          dataKey="name"
          stroke="#666"
          tickMargin={10}
          label={{ value: "Hour", position: "insideBottom", offset: -10, fill: "#666" }}
        />
        <YAxis
          stroke="#666"
          domain={[0, yAxisMax]}
          tickFormatter={(value) => {
            if (value === 0) return '0';
            if (value < 0.01) return value.toFixed(3);
            if (value < 0.1) return value.toFixed(2);
            if (value < 1) return value.toFixed(1);
            return value.toString();
          }}
          label={{ value: "m³/h", angle: -90, position: 'insideLeft', fill: '#666' }}
        />
        <Tooltip content={<WaterUsageTooltip />} />
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
