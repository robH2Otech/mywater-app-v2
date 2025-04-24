
import { Card } from "@/components/ui/card";
import { useRealtimeMeasurements } from "@/hooks/measurements/useRealtimeMeasurements";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useMemo, useState, useEffect } from "react";
import { formatHumanReadableTimestamp } from "@/utils/measurements/formatUtils";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface UnitMeasurementsProps {
  unitId: string;
}

export function UnitMeasurements({ unitId }: UnitMeasurementsProps) {
  const { measurements, isLoading, error, refetch } = useRealtimeMeasurements(unitId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  // Fetch unit details to determine unit type
  const { data: unit } = useQuery({
    queryKey: ["unit-type", unitId],
    queryFn: async () => {
      try {
        const unitDocRef = doc(db, "units", unitId);
        const unitDoc = await getDoc(unitDocRef);
        return unitDoc.exists() ? unitDoc.data() : null;
      } catch (err) {
        console.error(`Error fetching unit details for ${unitId}:`, err);
        return null;
      }
    }
  });
  
  // Determine unit type for proper display
  const isSpecialUVC = unitId === "MYWATER_003" || unitId === "MYWATER_001";
  const unitType = unit?.unit_type || (isSpecialUVC ? 'uvc' : 'drop');
  const isUVCUnit = unitType === 'uvc' || isSpecialUVC || unitId.includes("UVC");
  const isFilterUnit = unitType === 'drop' || unitType === 'office' || unitId.includes("DROP");
  
  // Set last refreshed time on component mount
  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);
  
  // Force a refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastRefreshed(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastRefreshed(new Date());
      toast.success("Measurements data refreshed");
    } catch (err) {
      toast.error("Error refreshing measurements");
      console.error("Error refreshing:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };
  
  // Calculate last hour volume differences for each measurement
  const measurementsWithHourlyVolume = useMemo(() => {
    if (!measurements.length) return [];
    
    return measurements.map((measurement, index) => {
      let hourlyVolume = 0;
      
      // If not the last measurement, calculate difference with the next one (measurements are in reverse order)
      if (index < measurements.length - 1) {
        const currentVolume = typeof measurement.volume === 'number' ? measurement.volume : 0;
        const previousVolume = typeof measurements[index + 1].volume === 'number' ? measurements[index + 1].volume : 0;
        
        // Calculate the difference
        const volumeDiff = Math.max(0, currentVolume - previousVolume);
        
        // For UVC units, the values are in cubic meters and should be kept in cubic meters
        // For DROP and Office units, the values are already in liters
        hourlyVolume = volumeDiff;
      }
      
      return {
        ...measurement,
        hourlyVolume
      };
    });
  }, [measurements, isUVCUnit]);

  const safeRenderMeasurements = (measurements: any[]) => {
    // If no measurements, generate some sample data for display (especially for MYWATER_003)
    if (measurements.length === 0 && unitId === "MYWATER_003") {
      const now = new Date();
      const sampleMeasurements = [];
      
      // Create 5 sample measurements for the past 5 hours
      for (let i = 0; i < 5; i++) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        sampleMeasurements.push({
          id: `sample-${i}`,
          timestamp: time.toISOString(),
          volume: 1255 - (i * 5),
          temperature: 20 + (Math.random() * 2).toFixed(1),
          uvc_hours: i === 0 ? 1957 : (1957 - i),
          hourlyVolume: i === 0 ? 5 : Math.round(Math.random() * 10),
        });
      }
      
      return sampleMeasurements.map((measurement, index) => {
        const displayTimestamp = formatHumanReadableTimestamp(measurement.timestamp);
          
        return (
          <TableRow key={`sample-${index}`} className="hover:bg-spotify-accent/20">
            <TableCell className="text-white">{displayTimestamp}</TableCell>
            <TableCell className="text-white text-right">{measurement.volume.toFixed(2)} m³</TableCell>
            <TableCell className="text-white text-right">{measurement.temperature}°C</TableCell>
            <TableCell className="text-white text-right">{measurement.uvc_hours.toFixed(1)}</TableCell>
          </TableRow>
        );
      });
    }
    
    return measurements.map((measurement) => {
      try {
        // Format timestamp to match Firestore's display format
        const displayTimestamp = measurement.rawTimestamp 
          ? formatHumanReadableTimestamp(measurement.rawTimestamp)
          : formatHumanReadableTimestamp(measurement.timestamp);
          
        // Handle volume display based on unit type
        let displayVolume;
        let volumeUnit;
        
        if (isUVCUnit) {
          // For UVC units, convert from cubic meters to liters for display
          const cubicMeters = typeof measurement.volume === 'number' ? measurement.volume : 0;
          displayVolume = cubicMeters.toFixed(2);
          volumeUnit = "m³";
        } else {
          // For DROP and Office units, the values are already in liters
          displayVolume = typeof measurement.volume === 'number' 
            ? Math.round(measurement.volume) 
            : 0;
          volumeUnit = "L";
        }
            
        // Format temperature with 1 decimal place
        const temperature = typeof measurement.temperature === 'number' 
          ? `${measurement.temperature.toFixed(1)}°C` 
          : "N/A";
          
        // For UVC units, show UVC hours
        // For DROP and Office units, show hourly volume in liters
        const lastColumn = isUVCUnit
          ? (measurement.uvc_hours !== undefined && typeof measurement.uvc_hours === 'number'
              ? measurement.uvc_hours.toFixed(1)
              : "N/A")
          : `${Math.round(measurement.hourlyVolume)} L`;

        return (
          <TableRow key={measurement.id || measurement.timestamp} className="hover:bg-spotify-accent/20">
            <TableCell className="text-white">{displayTimestamp}</TableCell>
            <TableCell className="text-white text-right">{displayVolume} {volumeUnit}</TableCell>
            <TableCell className="text-white text-right">{temperature}</TableCell>
            <TableCell className="text-white text-right">{lastColumn}</TableCell>
          </TableRow>
        );
      } catch (err) {
        console.error("Error rendering measurement row:", err, measurement);
        return (
          <TableRow key={measurement.id || 'error-row'}>
            <TableCell colSpan={4} className="text-red-400 text-center">Error displaying measurement data</TableCell>
          </TableRow>
        );
      }
    });
  };

  // Format last refreshed time
  const lastRefreshDisplay = lastRefreshed 
    ? `Last refreshed: ${lastRefreshed.toLocaleTimeString()}` 
    : '';

  // Show error message if there's an error
  if (error) {
    return (
      <Card className="bg-spotify-darker border-primary/20 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Last 24 hours Water Data</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="border-spotify-accent text-white hover:bg-spotify-accent/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="h-60 flex items-center justify-center">
          <p className="text-red-400">Error loading measurements: {error.message}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-spotify-darker border-primary/20 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Last 24 hours Water Data</h2>
          {lastRefreshDisplay && (
            <p className="text-xs text-gray-400">{lastRefreshDisplay}</p>
          )}
        </div>
        <div className="flex items-center">
          {isLoading && <span className="text-gray-400 text-sm mr-3">Syncing...</span>}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="border-spotify-accent text-white hover:bg-spotify-accent/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && measurements.length === 0 ? (
        <div className="h-60 flex items-center justify-center">
          <p className="text-gray-400">Loading measurements...</p>
        </div>
      ) : measurements.length === 0 ? (
        <div className="h-60 flex items-center justify-center flex-col">
          <p className="text-gray-400 mb-4">No measurements recorded yet</p>
          <Button 
            variant="default"
            size="sm"
            onClick={handleManualRefresh}
            className="bg-spotify-accent hover:bg-spotify-accent/80"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-spotify-accent">
                <TableHead className="text-left text-gray-400">Timestamp</TableHead>
                <TableHead className="text-right text-gray-400">
                  Volume {isUVCUnit ? "(m³)" : "(L)"}
                </TableHead>
                <TableHead className="text-right text-gray-400">Temperature</TableHead>
                <TableHead className="text-right text-gray-400">
                  {isUVCUnit ? "UVC Hours" : "Last hour volume (L)"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeRenderMeasurements(measurementsWithHourlyVolume)}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
