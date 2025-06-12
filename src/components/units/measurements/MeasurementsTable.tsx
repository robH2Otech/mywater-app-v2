
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
    if (index === 0) return "N/A"; // First measurement has no previous data
    
    const previousMeasurement = measurements[index - 1];
    
    const currentVolume = currentMeasurement.volume || currentMeasurement.total_volume || 0;
    const previousVolume = previousMeasurement.volume || previousMeasurement.total_volume || 0;
    
    if (typeof currentVolume !== 'number' || typeof previousVolume !== 'number') {
      return "N/A";
    }
    
    const volumeDifference = currentVolume - previousVolume;
    
    if (volumeDifference <= 0) return "0.00";
    
    // Convert to m³ if needed and format for hourly rate
    // Assuming measurements are roughly hourly, so the difference is already per hour
    const flowRate = volumeDifference / 1000; // Convert L to m³
    
    return flowRate.toFixed(3);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Timestamp</TableHead>
          {isUVCUnit ? (
            <>
              <TableHead>UVC Hours</TableHead>
              <TableHead>Total Volume (L)</TableHead>
              <TableHead>Flow (m³/hour)</TableHead>
              <TableHead>Temperature (°C)</TableHead>
            </>
          ) : (
            <>
              <TableHead>Volume (L)</TableHead>
              <TableHead>Flow Rate (L/min)</TableHead>
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
                <TableCell>{formatValue(measurement.value || measurement.flow_rate)}</TableCell>
                <TableCell>{formatValue(measurement.temp || measurement.temperature)}</TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
