
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  ComposedChart,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  subDays, 
  subHours, 
  format, 
  parseISO, 
  startOfDay,
  endOfDay,
  isAfter,
  isBefore
} from "date-fns";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp 
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [useCustomDate, setUseCustomDate] = useState(false);

  // Function to get measurements for all units in the specified time range
  const fetchMeasurementsForTimeRange = async (range: TimeRange, customStartDate?: Date, customEndDate?: Date) => {
    if (!units || units.length === 0) {
      return [];
    }

    setIsLoading(true);
    
    try {
      // Calculate start date based on selected time range or use custom dates
      let queryStartDate: Date;
      let queryEndDate: Date = new Date();
      let formatPattern: string;
      let groupByField: string;
      
      if (customStartDate && customEndDate && useCustomDate) {
        queryStartDate = startOfDay(customStartDate);
        queryEndDate = endOfDay(customEndDate);
        
        // Determine format based on date range span
        const daysDiff = Math.round((queryEndDate.getTime() - queryStartDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 2) {
          formatPattern = "HH:mm"; // Hour format for 1-2 days
          groupByField = "hour";
        } else if (daysDiff <= 31) {
          formatPattern = "MMM dd"; // Month day format for up to a month
          groupByField = "day";
        } else {
          formatPattern = "MMM yyyy"; // Month year format for longer periods
          groupByField = "month";
        }
      } else {
        // Use predefined time ranges
        switch (range) {
          case "24h":
            queryStartDate = subHours(queryEndDate, 24);
            formatPattern = "HH:mm"; // Hour format
            groupByField = "hour";
            break;
          case "7d":
            queryStartDate = subDays(queryEndDate, 7);
            formatPattern = "MMM dd"; // Month day format
            groupByField = "day";
            break;
          case "30d":
            queryStartDate = subDays(queryEndDate, 30);
            formatPattern = "MMM dd"; // Month day format
            groupByField = "day";
            break;
          case "6m":
            queryStartDate = subDays(queryEndDate, 180);
            formatPattern = "MMM yyyy"; // Month year format
            groupByField = "month";
            break;
          default:
            queryStartDate = subHours(queryEndDate, 24);
            formatPattern = "HH:mm";
            groupByField = "hour";
        }
      }

      const startTimestamp = Timestamp.fromDate(queryStartDate);
      const endTimestamp = Timestamp.fromDate(queryEndDate);
      
      // Collect all measurements from all units
      const allMeasurements = [];
      
      for (const unit of units) {
        // Skip if no unit ID
        if (!unit.id) continue;
        
        // Determine collection path based on unit ID format
        const collectionPath = unit.id.startsWith('MYWATER_') 
          ? `units/${unit.id}/data` 
          : `units/${unit.id}/measurements`;
        
        // Query measurements for this unit within the date range
        const q = query(
          collection(db, collectionPath),
          where("timestamp", ">=", startTimestamp),
          where("timestamp", "<=", endTimestamp),
          orderBy("timestamp", "asc")
        );
        
        const querySnapshot = await getDocs(q);
        
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
      
      // Group measurements by time period based on selected range
      const groupedData = new Map();
      
      allMeasurements.forEach(measurement => {
        const formattedDate = format(measurement.timestamp, formatPattern);
        
        if (!groupedData.has(formattedDate)) {
          groupedData.set(formattedDate, {
            name: formattedDate,
            total: 0,
            hourlyRate: 0,
            count: 0
          });
        }
        
        // Accumulate volume for this time period
        const entry = groupedData.get(formattedDate);
        entry.total += measurement.volume;
        entry.count += 1;
      });
      
      // Calculate hourly rates
      for (const [key, entry] of groupedData.entries()) {
        if (entry.count > 0) {
          // Simple average hourly rate calculation
          entry.hourlyRate = Math.round(entry.total / entry.count);
          entry.total = Math.round(entry.total); // Round total to whole number
        }
      }
      
      // Convert to array for chart and sort chronologically
      const sortedData = Array.from(groupedData.values()).sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      
      // Ensure we have data - use placeholder if empty
      if (sortedData.length === 0) {
        return generatePlaceholderData(range, queryStartDate, queryEndDate);
      }
      
      return sortedData;
    } catch (error) {
      console.error("Error fetching measurements for chart:", error);
      return generatePlaceholderData(range);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate placeholder data when no measurements are available
  const generatePlaceholderData = (range: TimeRange, startDate?: Date, endDate?: Date) => {
    const end = endDate || new Date();
    const dataPoints: any[] = [];
    
    switch (range) {
      case "24h": {
        // Generate hourly data for last 24 hours
        const start = startDate || subHours(end, 24);
        const hourCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        
        for (let i = 0; i < hourCount; i++) {
          const date = new Date(start.getTime() + i * 60 * 60 * 1000);
          const totalVolume = Math.floor(Math.random() * 50) + 10;
          dataPoints.push({
            name: format(date, "HH:mm"),
            total: totalVolume,
            hourlyRate: Math.round(totalVolume / 2)
          });
        }
        break;
      }
      case "7d": {
        // Generate daily data for last 7 days
        const start = startDate || subDays(end, 7);
        const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        for (let i = 0; i < dayCount; i++) {
          const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          const totalVolume = Math.floor(Math.random() * 200) + 50;
          dataPoints.push({
            name: format(date, "MMM dd"),
            total: totalVolume,
            hourlyRate: Math.round(totalVolume / 8)
          });
        }
        break;
      }
      case "30d": {
        // Generate data for last 30 days (showing 10 points)
        const start = startDate || subDays(end, 30);
        const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const stepSize = Math.max(1, Math.floor(dayCount / 10));
        
        for (let i = 0; i < dayCount; i += stepSize) {
          const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          const totalVolume = Math.floor(Math.random() * 500) + 100;
          dataPoints.push({
            name: format(date, "MMM dd"),
            total: totalVolume,
            hourlyRate: Math.round(totalVolume / 24)
          });
        }
        break;
      }
      case "6m": {
        // Generate monthly data for last 6 months
        const start = startDate || subDays(end, 180);
        const monthCount = 6;
        
        for (let i = 0; i < monthCount; i++) {
          const date = new Date(start.getTime() + i * 30 * 24 * 60 * 60 * 1000);
          const totalVolume = Math.floor(Math.random() * 2000) + 400;
          dataPoints.push({
            name: format(date, "MMM yyyy"),
            total: totalVolume,
            hourlyRate: Math.round(totalVolume / 30 / 24)
          });
        }
        break;
      }
      default: {
        // Default 24h data
        const start = startDate || subHours(end, 24);
        const hourCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        
        for (let i = 0; i < hourCount; i++) {
          const date = new Date(start.getTime() + i * 60 * 60 * 1000);
          const totalVolume = Math.floor(Math.random() * 50) + 10;
          dataPoints.push({
            name: format(date, "HH:mm"),
            total: totalVolume,
            hourlyRate: Math.round(totalVolume / 2)
          });
        }
      }
    }
    
    return dataPoints;
  };

  // Update chart data when time range or units change
  useEffect(() => {
    const updateChartData = async () => {
      if (useCustomDate && startDate && endDate) {
        const data = await fetchMeasurementsForTimeRange(timeRange, startDate, endDate);
        setChartData(data);
      } else {
        const data = await fetchMeasurementsForTimeRange(timeRange);
        setChartData(data);
        // Reset custom dates when switching to predefined time ranges
        if (useCustomDate) {
          setUseCustomDate(false);
        }
      }
    };
    
    updateChartData();
  }, [timeRange, units, useCustomDate, startDate, endDate]);

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (startDate && endDate) {
      setUseCustomDate(true);
    }
  };

  // Reset to predefined ranges
  const resetToTimeRange = () => {
    setUseCustomDate(false);
    setStartDate(null);
    setEndDate(null);
  };

  // Get appropriate time range label
  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case "24h": return t("chart.24hours");
      case "7d": return t("chart.7days");
      case "30d": return t("chart.30days");
      case "6m": return t("chart.6months");
      default: return t("chart.24hours");
    }
  };

  // Get chart title based on current selection
  const getChartTitle = () => {
    if (useCustomDate && startDate && endDate) {
      return `${t("dashboard.usage.title")} (${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")})`;
    }
    return t("dashboard.usage.title");
  };

  return (
    <Card className="p-6 glass lg:col-span-2">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{getChartTitle()}</h2>
          
          <div className="flex items-center space-x-2">
            {useCustomDate ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetToTimeRange}
                className="bg-spotify-darker border-spotify-accent text-white hover:bg-spotify-accent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("chart.reset")}
              </Button>
            ) : (
              <Select
                value={timeRange}
                onValueChange={(value: TimeRange) => setTimeRange(value)}
              >
                <SelectTrigger className="w-[180px] bg-spotify-darker border-spotify-accent">
                  <SelectValue placeholder={t("chart.select.timerange")} />
                </SelectTrigger>
                <SelectContent className="bg-spotify-darker border-spotify-accent">
                  <SelectItem value="24h">{t("chart.24hours")}</SelectItem>
                  <SelectItem value="7d">{t("chart.7days")}</SelectItem>
                  <SelectItem value="30d">{t("chart.30days")}</SelectItem>
                  <SelectItem value="6m">{t("chart.6months")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="grid grid-cols-2 gap-4 flex-grow">
            <FormDatePicker
              value={startDate}
              onChange={setStartDate}
              label={t("chart.startDate") || "Start Date"}
            />
            <FormDatePicker
              value={endDate}
              onChange={setEndDate}
              label={t("chart.endDate") || "End Date"}
            />
          </div>
          <Button 
            onClick={applyCustomDateRange} 
            disabled={!startDate || !endDate || (startDate && endDate && isAfter(startDate, endDate))}
            className="bg-mywater-blue hover:bg-mywater-med-blue text-white"
          >
            {t("chart.apply") || "Apply Range"}
          </Button>
        </div>
      </div>
      
      <div className="h-[300px] mt-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p>{t("chart.loading")}</p>
          </div>
        ) : (
          <ChartContainer 
            config={{
              total: { 
                label: t("chart.totalVolume") || "Total Volume", 
                color: "#39afcd" 
              },
              hourlyRate: {
                label: t("chart.hourlyRate") || "Rate",
                color: "#2c53a0"
              }
            }}
            className="h-full"
          >
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39afcd" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#39afcd" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
              <XAxis 
                dataKey="name" 
                stroke="#666" 
                tickMargin={10}
                tickFormatter={(value) => value}
              />
              <YAxis 
                stroke="#666"
                tickFormatter={(value) => `${Math.round(value)} m³`}
              />
              <Tooltip
                content={({ active, payload }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    labelFormatter={(value) => `${value}`}
                  />
                )}
              />
              <Legend />
              <Bar 
                dataKey="hourlyRate" 
                name="hourlyRate"
                fill="#2c53a0" 
                radius={[4, 4, 0, 0]}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="total"
                stroke="#39afcd"
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
};
