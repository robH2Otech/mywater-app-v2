
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

interface UnitMeasurementsProps {
  unitId: string;
}

export function UnitMeasurements({ unitId }: UnitMeasurementsProps) {
  const { measurements, isLoading, error, refetch } = useRealtimeMeasurements(unitId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch unit details to determine unit type
  const { data: unit } = useQuery({
    queryKey: ["unit-type", unitId],
    queryFn: async () => {
      const unitDocRef = doc(db, "units", unitId);
      const unitDoc = await getDoc(unitDocRef);
      return unitDoc.exists() ? unitDoc.data() : null;
    }
  });
  
  const isSpecialUVC = unitId === "MYWATER_003";
  const unitType = unit?.unit_type || 'uvc';
  const isUVCUnit = unitType === 'uvc' || isSpecialUVC;
  const isFilterUnit = unitType === 'drop' || unitType === 'office';
  
  // Force a refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
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
        <h2 className="text-xl font-semibold text-white">Last 24 hours Water Data</h2>
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
        <div className="h-60 flex items-center justify-center">
          <p className="text-gray-400">No measurements recorded yet</p>
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
