
import { formatHumanReadableTimestamp } from "@/utils/measurements/formatUtils";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface SampleDataGeneratorProps {
  unitId: string;
}

export function SampleDataGenerator({ unitId }: SampleDataGeneratorProps) {
  // Generate sample data specifically for MYWATER_003 or other demo units
  if (unitId === "MYWATER_003") {
    const now = new Date();
    const sampleMeasurements = [];
    
    // Create sample measurements for the past 5 hours
    for (let i = 0; i < 5; i++) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      sampleMeasurements.push({
        id: `sample-${i}`,
        timestamp: time.toISOString(),
        volume: 1255 - (i * 5),
        temperature: 20 + (Math.random() * 2),
        uvc_hours: i === 0 ? 1957 : (1957 - i),
        hourlyVolume: i === 0 ? 5 : Math.round(Math.random() * 10),
      });
    }
    
    return (
      <>
        {sampleMeasurements.map((measurement, index) => {
          const displayTimestamp = formatHumanReadableTimestamp(measurement.timestamp);
          
          return (
            <TableRow key={`sample-${index}`} className="hover:bg-spotify-accent/20">
              <TableCell className="text-white">{displayTimestamp}</TableCell>
              <TableCell className="text-white text-right">{measurement.volume.toFixed(2)} m³</TableCell>
              <TableCell className="text-white text-right">{measurement.temperature.toFixed(1)}°C</TableCell>
              <TableCell className="text-white text-right">{measurement.uvc_hours.toFixed(1)}</TableCell>
            </TableRow>
          );
        })}
      </>
    );
  }
  
  return null;
}
