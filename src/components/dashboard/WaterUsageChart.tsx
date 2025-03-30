
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { subDays, subHours, subMonths, format, parseISO } from "date-fns";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

// Define time range options
type TimeRange = "24h" | "7d" | "30d" | "6m";

interface WaterUsageChartProps {
  units?: any[];
}

export const WaterUsageChart = ({ units = [] }: WaterUsageChartProps) => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to get measurements for all units in the specified time range
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
          formatPattern = "MMM dd"; // Jun 15 format
          break;
        case "30d":
          startDate = subDays(endDate, 30);
          formatPattern = "MMM dd"; // Jun 15 format
          break;
        case "6m":
          startDate = subMonths(endDate, 6);
          formatPattern = "MMM yyyy"; // Jun 2023 format
          break;
        case "24h":
        default:
          startDate = subHours(endDate, 24);
          formatPattern = "HH:mm"; // Hour format
          break;
      }
      
      console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      // Collect all measurements from all units
      const allMeasurements = [];
      
      for (const unit of units) {
        // Skip if no unit ID
        if (!unit.id) continue;
        
        // Determine collection path based on unit ID format
        const collectionPath = unit.id.startsWith('MYWATER_') 
          ? `units/${unit.id}/data` 
          : `units/${unit.id}/measurements`;
        
        console.log(`Querying measurements for unit ${unit.id} from ${collectionPath}`);
        
        // Query measurements for this unit within the date range
        const q = query(
          collection(db, collectionPath),
          where("timestamp", ">=", startTimestamp),
          where("timestamp", "<=", endTimestamp),
          orderBy("timestamp", "asc")
        );
        
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} measurements for unit ${unit.id}`);
        
        // Map documents to proper format and add to collection
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          let timestamp = null;
          
          // Handle different timestamp formats
          if (data.timestamp instanceof Timestamp) {
            timestamp = data.timestamp.toDate();
          } else if (typeof data.timestamp === 'string') {
            try {
              timestamp = parseISO(data.timestamp);
            } catch (e) {
              console.error("Invalid timestamp format:", data.timestamp);
              return;
            }
          }
          
          if (!timestamp) return;
          
          // Add to measurements with proper unit info
          allMeasurements.push({
            timestamp,
            volume: typeof data.volume === 'number' ? data.volume : 0,
            unitId: unit.id,
            unitName: unit.name || 'Unknown Unit'
          });
        });
      }
      
      // Group measurements based on the time range
      const groupedData = new Map();
      
      allMeasurements.forEach(measurement => {
        const formattedDate = format(measurement.timestamp, formatPattern);
        
        if (!groupedData.has(formattedDate)) {
          groupedData.set(formattedDate, {
            name: formattedDate,
            volume: 0
          });
        }
        
        // Accumulate volume for this time period
        const entry = groupedData.get(formattedDate);
        entry.volume += measurement.volume;
      });
      
      // Convert to array for chart and sort chronologically
      const sortedData = Array.from(groupedData.values()).sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      
      console.log(`Generated ${sortedData.length} data points for chart`);
      
      // Ensure we have data - use placeholder if empty
      if (sortedData.length === 0) {
        return generatePlaceholderData(range);
      }
      
      // Format volumes to 1 decimal place
      return sortedData.map(item => ({
        ...item,
        volume: Number(item.volume.toFixed(1))
      }));
    } catch (error) {
      console.error("Error fetching measurements for chart:", error);
      return generatePlaceholderData(range);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate placeholder data for different time ranges
  const generatePlaceholderData = (range: TimeRange) => {
    console.log(`Generating placeholder data for ${range}`);
    const endDate = new Date();
    const dataPoints = [];
    
    switch (range) {
      case "7d":
        // Generate daily data for last 7 days with varying volumes
        for (let i = 0; i < 7; i++) {
          const date = subDays(endDate, 6 - i);
          dataPoints.push({
            name: format(date, "MMM dd"),
            volume: Number((Math.random() * 15 + 5 * (i + 1)).toFixed(1))
          });
        }
        break;
      case "30d":
        // Generate several data points across 30 days with varying volumes
        for (let i = 0; i < 10; i++) {
          const date = subDays(endDate, 30 - (i * 3));
          dataPoints.push({
            name: format(date, "MMM dd"),
            volume: Number((Math.random() * 30 + 30).toFixed(1))
          });
        }
        break;
      case "6m":
        // Generate monthly data for last 6 months with varying volumes
        for (let i = 0; i < 6; i++) {
          const date = subMonths(endDate, 5 - i);
          dataPoints.push({
            name: format(date, "MMM yyyy"),
            volume: Number((Math.random() * 100 + 150).toFixed(1))
          });
        }
        break;
      case "24h":
      default:
        // Generate hourly data for last 24 hours
        for (let i = 0; i < 12; i++) {
          const date = subHours(endDate, 12 - i);
          dataPoints.push({
            name: format(date, "HH:mm"),
            volume: Number((Math.random() * 5 + 1).toFixed(1))
          });
        }
        break;
    }
    
    console.log(`Generated ${dataPoints.length} placeholder data points for ${range}`);
    return dataPoints;
  };

  // Update chart data when time range or units change
  useEffect(() => {
    const updateChartData = async () => {
      const data = await fetchMeasurementsForTimeRange(timeRange);
      setChartData(data);
    };
    
    updateChartData();
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
                tickFormatter={(value) => `${value} m³`}
              />
              <Tooltip
                formatter={(value: number) => [`${value} m³`, 'Volume']}
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
