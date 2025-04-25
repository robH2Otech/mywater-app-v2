
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProcessedMeasurement } from "@/hooks/measurements/types/measurementTypes";
import { formatHumanReadableTimestamp } from "@/utils/measurements/formatUtils";
import { useMemo } from "react";

interface MeasurementsTableProps {
  measurements: ProcessedMeasurement[];
  isUVCUnit: boolean;
}

export function MeasurementsTable({ measurements, isUVCUnit }: MeasurementsTableProps) {
  // Calculate hourly volume differences for each measurement
  const measurementsWithHourlyVolume = useMemo(() => {
    if (!measurements.length) return [];
    
    return measurements.map((measurement, index) => {
      let hourlyVolume = 0;
      
      // If not the last measurement, calculate difference with the next one (measurements are in reverse order)
      if (index < measurements.length - 1) {
        const currentVolume = typeof measurement.cumulative_volume === 'number' 
          ? measurement.cumulative_volume 
          : measurement.volume;
          
        const previousVolume = typeof measurements[index + 1].cumulative_volume === 'number'
          ? measurements[index + 1].cumulative_volume
          : measurements[index + 1].volume;
        
        // Calculate the difference
        const volumeDiff = Math.max(0, currentVolume - previousVolume);
        hourlyVolume = volumeDiff;
      }
      
      return {
        ...measurement,
        hourlyVolume
      };
    });
  }, [measurements]);
  
  const renderMeasurementRow = (measurement: any, index: number) => {
    try {
      // Format timestamp to human-readable format
      const displayTimestamp = formatHumanReadableTimestamp(
        measurement.rawTimestamp || measurement.timestamp
      );
      
      // Handle volume display based on unit type
      let displayVolume;
      let volumeUnit;
      
      if (isUVCUnit) {
        // For UVC units, keep in cubic meters
        const cubicMeters = typeof measurement.volume === 'number' ? measurement.volume : 0;
        displayVolume = cubicMeters.toFixed(2);
        volumeUnit = "m³";
      } else {
        // For DROP/OFFICE units, check if volume is already in liters
        const rawVolume = typeof measurement.volume === 'number' ? measurement.volume : 0;
        console.log(`Raw volume for measurement ${index}:`, rawVolume);
        
        // If volume is already in liters (large number), just format it
        if (rawVolume > 100) {
          displayVolume = rawVolume.toFixed(2);
          console.log(`Volume appears to be in liters already:`, displayVolume);
        } else {
          // Convert from m³ to liters
          const liters = rawVolume * 1000;
          displayVolume = liters.toFixed(2);
          console.log(`Converted ${rawVolume}m³ to liters:`, displayVolume);
        }
        volumeUnit = "L";
      }
          
      // Format temperature with 1 decimal place
      const temperature = typeof measurement.temperature === 'number' 
        ? `${measurement.temperature.toFixed(1)}°C` 
        : "N/A";
        
      // For UVC units, show UVC hours
      // For DROP/Office units, show hourly volume in liters
      let lastColumn;
      if (isUVCUnit) {
        lastColumn = measurement.uvc_hours !== undefined && typeof measurement.uvc_hours === 'number'
          ? measurement.uvc_hours.toFixed(1)
          : "N/A";
      } else {
        // Handle hourly volume similar to main volume
        const rawHourlyVolume = measurement.hourlyVolume;
        if (rawHourlyVolume > 100) {
          lastColumn = `${rawHourlyVolume.toFixed(2)} L`;
        } else {
          const hourlyLiters = rawHourlyVolume * 1000;
          lastColumn = `${hourlyLiters.toFixed(2)} L`;
        }
      }

      return (
        <TableRow key={measurement.id || index} className="hover:bg-spotify-accent/20">
          <TableCell className="text-white">{displayTimestamp}</TableCell>
          <TableCell className="text-white text-right">{displayVolume} {volumeUnit}</TableCell>
          <TableCell className="text-white text-right">{temperature}</TableCell>
          <TableCell className="text-white text-right">{lastColumn}</TableCell>
        </TableRow>
      );
    } catch (err) {
      console.error("Error rendering measurement row:", err, measurement);
      return (
        <TableRow key={measurement.id || `error-row-${index}`}>
          <TableCell colSpan={4} className="text-red-400 text-center">Error displaying measurement data</TableCell>
        </TableRow>
      );
    }
  };

  return (
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
        {measurementsWithHourlyVolume.map((measurement, index) => renderMeasurementRow(measurement, index))}
      </TableBody>
    </Table>
  );
}
