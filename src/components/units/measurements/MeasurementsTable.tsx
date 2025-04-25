
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
        // For DROP/OFFICE units, convert m³ to liters with 2 decimal places
        const volumeInM3 = typeof measurement.volume === 'number' ? Number(measurement.volume.toFixed(4)) : 0;
        const liters = (volumeInM3 * 1000).toFixed(2);
        displayVolume = liters;
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
        // Convert hourly volume from m³ to liters for DROP/OFFICE units
        const hourlyVolumeInM3 = Number(measurement.hourlyVolume.toFixed(4));
        lastColumn = `${(hourlyVolumeInM3 * 1000).toFixed(2)} L`;
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
