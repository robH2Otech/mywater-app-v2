
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

// Create sample data based on real units
const generateChartData = (units: any[]) => {
  // If no units, return sample data
  if (!units || units.length === 0) {
    return [
      { name: "Jan", value: 400 },
      { name: "Feb", value: 300 },
      { name: "Mar", value: 600 },
      { name: "Apr", value: 800 },
      { name: "May", value: 500 },
      { name: "Jun", value: 700 },
    ];
  }

  // Get all unique locations
  const locations = Array.from(new Set(units.map(unit => unit.location || "Unknown")));
  
  // Create month abbreviations
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  
  // Generate data with random values based on units count and total volume
  const totalVolume = units.reduce((sum, unit) => sum + (parseFloat(unit.total_volume) || 0), 0);
  const baseValue = totalVolume > 0 ? totalVolume / 6 : 500;
  
  return months.map((month, index) => {
    // Random variation but somewhat consistent
    const value = baseValue * (0.8 + Math.random() * 0.4) * (index + 1) / 3;
    return {
      name: month,
      value: Math.round(value),
    };
  });
};

interface WaterUsageChartProps {
  units?: any[];
}

export const WaterUsageChart = ({ units = [] }: WaterUsageChartProps) => {
  const [chartData, setChartData] = useState(generateChartData(units));

  useEffect(() => {
    setChartData(generateChartData(units));
  }, [units]);

  return (
    <Card className="p-6 glass lg:col-span-2 rounded-xl overflow-hidden">
      <h2 className="text-lg font-semibold mb-4">Water Usage</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1DB954" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#282828",
                border: "none",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1DB954"
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
