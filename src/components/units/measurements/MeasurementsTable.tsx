
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
        return format(timestamp.toDate(), "MMM d, yyyy HH:mm");
      }
      // Handle regular Date objects or strings
      return format(new Date(timestamp), "MMM d, yyyy HH:mm");
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Timestamp</TableHead>
          {isUVCUnit ? (
            <>
              <TableHead>UVC Hours</TableHead>
              <TableHead>Flow Rate (L/min)</TableHead>
              <TableHead>Temperature (°C)</TableHead>
              <TableHead>Humidity (%)</TableHead>
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
                <TableCell>{formatValue(measurement.value || measurement.flow_rate)}</TableCell>
                <TableCell>{formatValue(measurement.temp || measurement.temperature)}</TableCell>
                <TableCell>{formatValue(measurement.humidity)}</TableCell>
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
