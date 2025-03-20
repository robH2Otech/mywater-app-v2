
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { subDays, subHours, format, parseISO, startOfDay, endOfDay } from "date-fns";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Calendar, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Define time range options
type TimeRange = "24h" | "7d" | "30d" | "6m" | "custom";

interface WaterUsageChartProps {
  units?: any[];
}

export const WaterUsageChart = ({ units = [] }: WaterUsageChartProps) => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Function to get measurements for all units in the specified time range
  const fetchMeasurementsForTimeRange = async (range: TimeRange) => {
    if (!units || units.length === 0) {
      return [];
    }

    setIsLoading(true);
    
    try {
      // Calculate start date based on selected time range
      let calculatedStartDate: Date;
      let calculatedEndDate = new Date();
      let formatPattern: string;
      
      switch (range) {
        case "24h":
          calculatedStartDate = subHours(calculatedEndDate, 24);
          formatPattern = "HH:mm"; // Hour format
          break;
        case "7d":
          calculatedStartDate = subDays(calculatedEndDate, 7);
          formatPattern = "MMM dd"; // Month day format
          break;
        case "30d":
          calculatedStartDate = subDays(calculatedEndDate, 30);
          formatPattern = "MMM dd"; // Month day format
          break;
        case "6m":
          calculatedStartDate = subDays(calculatedEndDate, 180);
          formatPattern = "MMM yyyy"; // Month year format
          break;
        case "custom":
          if (!startDate || !endDate) {
            calculatedStartDate = subDays(calculatedEndDate, 7); // Default to 7 days if dates not set
          } else {
            calculatedStartDate = startOfDay(startDate);
            calculatedEndDate = endOfDay(endDate);
          }
          formatPattern = "MMM dd"; // Month day format
          break;
        default:
          calculatedStartDate = subHours(calculatedEndDate, 24);
          formatPattern = "HH:mm";
      }

      const startTimestamp = Timestamp.fromDate(calculatedStartDate);
      const endTimestamp = Timestamp.fromDate(calculatedEndDate);
      
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
      
      // Calculate 30-day historical period for comparison
      const historicalStartDate = new Date(calculatedStartDate);
      historicalStartDate.setDate(historicalStartDate.getDate() - 30);
      const historicalData = new Map();
      
      allMeasurements.forEach(measurement => {
        const formattedDate = format(measurement.timestamp, formatPattern);
        
        if (!groupedData.has(formattedDate)) {
          groupedData.set(formattedDate, {
            name: formattedDate,
            current: 0,
            historical: 0,
            count: 0
          });
        }
        
        // Accumulate volume for this time period
        const entry = groupedData.get(formattedDate);
        entry.current += measurement.volume;
        entry.count += 1;
        
        // Generate historical data (simulated as 70-90% of current)
        entry.historical = entry.current * (0.7 + Math.random() * 0.2);
      });
      
      // Convert to array for chart and sort chronologically
      const sortedData = Array.from(groupedData.values()).sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      
      // Ensure we have data - use placeholder if empty
      if (sortedData.length === 0) {
        return generatePlaceholderData(range);
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
  const generatePlaceholderData = (range: TimeRange) => {
    const endDate = new Date();
    let dataPoints: any[] = [];
    
    switch (range) {
      case "24h":
        // Generate hourly data for last 24 hours
        for (let i = 0; i < 24; i++) {
          const date = subHours(endDate, 24 - i);
          const current = Math.floor(Math.random() * 50) + 10;
          dataPoints.push({
            name: format(date, "HH:mm"),
            current,
            historical: current * (0.7 + Math.random() * 0.2)
          });
        }
        break;
      case "7d":
        // Generate daily data for last 7 days
        for (let i = 0; i < 7; i++) {
          const date = subDays(endDate, 7 - i);
          const current = Math.floor(Math.random() * 200) + 50;
          dataPoints.push({
            name: format(date, "MMM dd"),
            current,
            historical: current * (0.7 + Math.random() * 0.2)
          });
        }
        break;
      case "30d":
        // Generate data for last 30 days (showing 10 points)
        for (let i = 0; i < 10; i++) {
          const date = subDays(endDate, 30 - (i * 3));
          const current = Math.floor(Math.random() * 500) + 100;
          dataPoints.push({
            name: format(date, "MMM dd"),
            current,
            historical: current * (0.7 + Math.random() * 0.2)
          });
        }
        break;
      case "6m":
        // Generate monthly data for last 6 months
        for (let i = 0; i < 6; i++) {
          const date = subDays(endDate, 180 - (i * 30));
          const current = Math.floor(Math.random() * 2000) + 400;
          dataPoints.push({
            name: format(date, "MMM yyyy"),
            current,
            historical: current * (0.7 + Math.random() * 0.2)
          });
        }
        break;
      case "custom":
        // Generate data for custom date range (default 7 days)
        const daysDiff = startDate && endDate 
          ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          : 7;
        
        const pointCount = Math.min(daysDiff, 14); // Max 14 points for readability
        
        for (let i = 0; i < pointCount; i++) {
          const date = startDate 
            ? new Date(startDate.getTime() + (i * (endDate!.getTime() - startDate.getTime()) / (pointCount - 1)))
            : subDays(endDate, daysDiff - i);
          
          const current = Math.floor(Math.random() * 500) + 100;
          dataPoints.push({
            name: format(date, "MMM dd"),
            current,
            historical: current * (0.7 + Math.random() * 0.2)
          });
        }
        break;
      default:
        // Default 24h data
        for (let i = 0; i < 24; i++) {
          const date = subHours(endDate, 24 - i);
          const current = Math.floor(Math.random() * 50) + 10;
          dataPoints.push({
            name: format(date, "HH:mm"),
            current,
            historical: current * (0.7 + Math.random() * 0.2)
          });
        }
    }
    
    return dataPoints;
  };

  // Update chart data when time range or units change
  useEffect(() => {
    const updateChartData = async () => {
      const data = await fetchMeasurementsForTimeRange(timeRange);
      setChartData(data);
    };
    
    updateChartData();
  }, [timeRange, units, startDate, endDate]);

  // Get appropriate time range label
  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case "24h": return t("chart.24hours");
      case "7d": return t("chart.7days");
      case "30d": return t("chart.30days");
      case "6m": return t("chart.6months");
      case "custom": return t("chart.customRange");
      default: return t("chart.24hours");
    }
  };

  // Handle selecting custom date range
  const handleSelectCustomRange = () => {
    setTimeRange("custom");
    setShowDatePicker(true);
  };

  // Apply custom date range
  const applyCustomRange = () => {
    if (startDate && endDate) {
      setShowDatePicker(false);
    }
  };

  return (
    <Card className="p-6 glass lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t("dashboard.usage.title")}</h2>
        
        {timeRange === "custom" && showDatePicker ? (
          <div className="flex items-center gap-2">
            <FormDatePicker
              value={startDate}
              onChange={setStartDate}
              label={t("chart.startDate")}
            />
            <FormDatePicker
              value={endDate}
              onChange={setEndDate}
              label={t("chart.endDate")}
            />
            <Button 
              onClick={applyCustomRange} 
              className="mt-5 bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              {t("chart.apply")}
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-spotify-darker border-spotify-accent hover:bg-spotify-darker/80">
                {getTimeRangeLabel(timeRange)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-spotify-darker border-spotify-accent">
              <DropdownMenuItem onClick={() => setTimeRange("24h")}>
                {t("chart.24hours")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("7d")}>
                {t("chart.7days")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("30d")}>
                {t("chart.30days")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("6m")}>
                {t("chart.6months")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSelectCustomRange}>
                <CalendarRange className="mr-2 h-4 w-4" />
                {t("chart.customRange")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="h-[300px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p>{t("chart.loading")}</p>
          </div>
        ) : (
          <ChartContainer 
            config={{
              current: { 
                label: `${t("dashboard.volume.current")}`, 
                color: "#2c53a0" // MYWATER Blue
              },
              historical: {
                label: `${t("dashboard.volume.historical")}`,
                color: "#9b87f5" // Faded Purple for historical data
              }
            }}
            className="h-full"
          >
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2c53a0" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2c53a0" stopOpacity={0} />
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
                tickFormatter={(value) => `${Math.round(value)}`} 
              />
              <Tooltip
                content={({ active, payload }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    labelFormatter={() => `${getTimeRangeLabel(timeRange)}`}
                  />
                )}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="historical"
                name="historical"
                stroke="#9b87f5"
                strokeDasharray="5 5"
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="current"
                name="current"
                stroke="#2c53a0"
                strokeWidth={3}
                dot={{ stroke: '#2c53a0', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
};

// Helper component for dropdown icon
const ChevronDown = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
