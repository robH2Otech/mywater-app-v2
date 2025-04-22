
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

interface WaterUsageBarChartProps {
  data: any[];
  isLoading?: boolean;
}

export const WaterUsageBarChart = ({ data, isLoading }: WaterUsageBarChartProps) => {
  const { t } = useLanguage();

  console.log("Rendering WaterUsageBarChart with data:", data);

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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
        <XAxis 
          dataKey="name" 
          stroke="#666" 
          tickMargin={10}
          label={{ value: 'Time', position: 'insideBottom', offset: -10, fill: '#666' }}
        />
        <YAxis 
          stroke="#666"
          tickFormatter={(value) => `${value}`}
          label={{ value: 'm³/h', angle: -90, position: 'insideLeft', fill: '#666' }}
        />
        <Tooltip
          formatter={(value: number) => [`${value} m³/h`, 'Flow Rate']}
          contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff' }}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Legend 
          verticalAlign="top" 
          height={36} 
          formatter={() => "Hourly Flow Rate (m³/h)"}
        />
        <Bar 
          dataKey="volume" 
          fill="#39afcd"
          name="Flow Rate"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
