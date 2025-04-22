
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { subDays, subHours, subMonths, format } from "date-fns";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type TimeRange = "24h" | "7d" | "30d" | "6m";

interface WaterUsageChartProps {
  units?: any[];
}

export const WaterUsageChart = ({ units = [] }: WaterUsageChartProps) => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const calculateHourlyFlowRates = (measurements: any[]) => {
    if (!measurements || measurements.length < 2) return [];
    
    // Sort measurements by timestamp in ascending order
    const sortedMeasurements = [...measurements].sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return timeA.getTime() - timeB.getTime();
    });

    // Calculate flow rates between consecutive measurements
    const flowRates = [];
    for (let i = 0; i < sortedMeasurements.length - 1; i++) {
      const current = sortedMeasurements[i];
      const next = sortedMeasurements[i + 1];
      
      const currentVolume = typeof current.volume === 'number' ? current.volume : parseFloat(current.volume);
      const nextVolume = typeof next.volume === 'number' ? next.volume : parseFloat(next.volume);
      
      const volumeDiff = nextVolume - currentVolume;
      const currentTime = current.timestamp instanceof Date ? current.timestamp : new Date(current.timestamp);
      
      flowRates.push({
        name: format(currentTime, 'HH:mm'),
        volume: Number(volumeDiff.toFixed(2)) // Round to 2 decimal places
      });
    }
    
    return flowRates;
  };

  const fetchMeasurementsForTimeRange = async (range: TimeRange) => {
    if (!units || units.length === 0) {
      return [];
    }

    setIsLoading(true);
    console.log(`Fetching measurements for time range: ${range}`);
    
    try {
      // Calculate date range based on selected timeRange
      const endDate = new Date();
      let startDate: Date;
      let formatPattern: string;
      
      switch (range) {
        case "7d":
          startDate = subDays(endDate, 7);
          formatPattern = "MMM dd";
          break;
        case "30d":
          startDate = subDays(endDate, 30);
          formatPattern = "MMM dd";
          break;
        case "6m":
          startDate = subMonths(endDate, 6);
          formatPattern = "MMM yyyy";
          break;
        case "24h":
        default:
          startDate = subHours(endDate, 24);
          formatPattern = "HH:mm";
          break;
      }

      // Collect measurements for all units
      const allMeasurements = [];
      for (const unit of units) {
        if (!unit.id) continue;
        
        const collectionPath = unit.id.startsWith('MYWATER_') 
          ? `units/${unit.id}/data` 
          : `units/${unit.id}/measurements`;
        
        const q = query(
          collection(db, collectionPath),
          where("timestamp", ">=", Timestamp.fromDate(startDate)),
          where("timestamp", "<=", Timestamp.fromDate(endDate)),
          orderBy("timestamp", "asc")
        );
        
        const querySnapshot = await getDocs(q);
        const measurements = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        
        allMeasurements.push(...measurements);
      }
      
      // Calculate hourly flow rates
      const flowRates = calculateHourlyFlowRates(allMeasurements);
      console.log('Calculated flow rates:', flowRates);
      
      setChartData(flowRates);
    } catch (error) {
      console.error("Error fetching measurements for chart:", error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when time range changes or units update
  useEffect(() => {
    fetchMeasurementsForTimeRange(timeRange);
  }, [timeRange, units]);

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
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p>{t("chart.loading")}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
        )}
      </div>
    </Card>
  );
};
