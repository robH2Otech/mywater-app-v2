
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { RawMeasurement } from "@/hooks/measurements/types/measurementTypes";
import { Timestamp } from "firebase/firestore";

interface MeasurementsTableProps {
  measurements: RawMeasurement[];
  isUVCUnit: boolean;
}

export function MeasurementsTable({ measurements, isUVCUnit }: MeasurementsTableProps) {
  const formatTimestamp = (timestamp: string | Date | Timestamp | null) => {
    if (!timestamp) return "N/A";
    try {
      // Handle Firebase Timestamp objects by converting to Date
      if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
        const date = timestamp.toDate();
        return format(date, "MMM d, yyyy HH:mm");
      }
      // Handle regular Date objects or strings
      return format(new Date(timestamp as string | Date), "MMM d, yyyy HH:mm");
    } catch (err) {
      console.error("Invalid timestamp format:", timestamp);
      return "Invalid date";
    }
  };

  const formatValue = (value: number | string | undefined | null) => {
    if (value === undefined || value === null) return "N/A";
    if (typeof value === "string") {
      try {
        return parseFloat(value).toFixed(2);
      } catch {
        return value;
      }
    }
    return value.toFixed(2);
  };

  const calculateHourlyFlow = (currentMeasurement: RawMeasurement, index: number) => {
    // Since measurements are ordered newest to oldest, the last measurement has no previous data
    if (index === measurements.length - 1) return "N/A";
    
    // The previous (older) measurement is at index + 1
    const previousMeasurement = measurements[index + 1];
    
    const currentVolume = currentMeasurement.volume || currentMeasurement.total_volume || 0;
    const previousVolume = previousMeasurement.volume || previousMeasurement.total_volume || 0;
    
    console.log(`Flow calculation - Index: ${index}, Current: ${currentVolume}, Previous: ${previousVolume}`);
    
    if (typeof currentVolume !== 'number' || typeof previousVolume !== 'number') {
      return "N/A";
    }
    
    // Calculate the volume difference (current - previous)
    const volumeDifference = currentVolume - previousVolume;
    
    if (volumeDifference <= 0) return "0.00";
    
    // Direct volume difference for hourly flow
    // UVC units: m³/hour, DROP/Office units: L/hour
    return volumeDifference.toFixed(2);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Timestamp</TableHead>
          {isUVCUnit ? (
            <>
              <TableHead>UVC Hours</TableHead>
              <TableHead>Total Volume (m³)</TableHead>
              <TableHead>Flow (m³/hour)</TableHead>
              <TableHead>Temperature (°C)</TableHead>
            </>
          ) : (
            <>
              <TableHead>Volume (L)</TableHead>
              <TableHead>Flow (L/hour)</TableHead>
              <TableHead>Temperature (°C)</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {measurements.map((measurement, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">
              {formatTimestamp(measurement.timestamp)}
            </TableCell>
            {isUVCUnit ? (
              <>
                <TableCell>{formatValue(measurement.uvc_hours)}</TableCell>
                <TableCell>{formatValue(measurement.volume || measurement.total_volume)}</TableCell>
                <TableCell>{calculateHourlyFlow(measurement, index)}</TableCell>
                <TableCell>{formatValue(measurement.temp || measurement.temperature)}</TableCell>
              </>
            ) : (
              <>
                <TableCell>{formatValue(measurement.volume)}</TableCell>
                <TableCell>{calculateHourlyFlow(measurement, index)}</TableCell>
                <TableCell>{formatValue(measurement.temp || measurement.temperature)}</TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
