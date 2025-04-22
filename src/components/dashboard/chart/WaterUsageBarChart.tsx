
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

interface WaterUsageBarChartProps {
  data: any[];
  isLoading?: boolean;
}

export const WaterUsageBarChart = ({ data, isLoading }: WaterUsageBarChartProps) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>{t("chart.loading")}</p>
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
        />
        <YAxis 
          stroke="#666"
          tickFormatter={(value) => `${value} m³/h`}
        />
        <Tooltip
          formatter={(value: number) => [`${value} m³/h`, 'Volume per hour']}
          contentStyle={{ backgroundColor: '#222', border: '1px solid #444', color: '#fff' }}
        />
        <Bar 
          dataKey="volume" 
          fill="#39afcd"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
