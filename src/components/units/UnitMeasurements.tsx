
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initializeSampleMeasurements } from "@/utils/measurements/sampleDataUtils";
import { useRealtimeMeasurements } from "@/hooks/measurements/useRealtimeMeasurements";
import { toast } from "sonner";
import { MeasurementData } from "@/types/analytics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UnitMeasurementsProps {
  unitId: string;
}

export function UnitMeasurements({ unitId }: UnitMeasurementsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { measurements, isLoading, error } = useRealtimeMeasurements(unitId);

  const handleGenerateSample = async () => {
    setIsGenerating(true);
    try {
      await initializeSampleMeasurements(unitId);
      toast.success("Sample data generated successfully");
    } catch (error) {
      console.error("Failed to generate sample data:", error);
      toast.error("Failed to generate sample data");
    } finally {
      setIsGenerating(false);
    }
  };

  const safeRenderMeasurements = (measurements: MeasurementData[]) => {
    return measurements.map((measurement) => {
      try {
        // Get timestamp directly - it should already be formatted by useRealtimeMeasurements
        const timestamp = measurement.timestamp || "Invalid date";
          
        const volume = typeof measurement.volume === 'number' 
          ? measurement.volume.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
          : "N/A";
          
        const temperature = typeof measurement.temperature === 'number' 
          ? measurement.temperature.toFixed(1) 
          : "N/A";
          
        const uvcHours = measurement.uvc_hours !== undefined && typeof measurement.uvc_hours === 'number'
          ? measurement.uvc_hours.toLocaleString(undefined, { maximumFractionDigits: 1 })
          : "N/A";
          
        // Format cumulative volume, ensure it's displayed properly
        const cumulativeVolume = typeof measurement.cumulative_volume === 'number'
          ? measurement.cumulative_volume.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : "N/A";

        return (
          <TableRow key={measurement.id} className="hover:bg-spotify-accent/20">
            <TableCell className="text-white">{timestamp}</TableCell>
            <TableCell className="text-white text-right">{volume}</TableCell>
            <TableCell className="text-white text-right">{temperature}</TableCell>
            <TableCell className="text-white text-right">{uvcHours}</TableCell>
            <TableCell className="text-white text-right">{cumulativeVolume}</TableCell>
          </TableRow>
        );
      } catch (err) {
        console.error("Error rendering measurement row:", err, measurement);
        return (
          <TableRow key={measurement.id || 'error-row'}>
            <TableCell colSpan={5} className="text-red-400 text-center">Error displaying measurement data</TableCell>
          </TableRow>
        );
      }
    });
  };

  // Show error message if there's an error
  if (error) {
    return (
      <Card className="bg-spotify-darker border-spotify-accent p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Last 24 hours Water Data</h2>
          <Button 
            onClick={handleGenerateSample}
            disabled={isGenerating}
            variant="outline"
            className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
          >
            {isGenerating ? "Generating..." : "Generate Sample Data"}
          </Button>
        </div>
        <div className="h-60 flex items-center justify-center">
          <p className="text-red-400">Error loading measurements: {error.message}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-spotify-darker border-spotify-accent p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Last 24 hours Water Data</h2>
        <div className="flex gap-2 items-center">
          {isLoading && <span className="text-gray-400 text-sm">Syncing...</span>}
          <Button 
            onClick={handleGenerateSample}
            disabled={isGenerating}
            variant="outline"
            className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
          >
            {isGenerating ? "Generating..." : "Generate Sample Data"}
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
                <TableHead className="text-right text-gray-400">Volume (m³)</TableHead>
                <TableHead className="text-right text-gray-400">Temperature (°C)</TableHead>
                <TableHead className="text-right text-gray-400">UVC Hours</TableHead>
                <TableHead className="text-right text-gray-400">Cumulative Volume (m³)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeRenderMeasurements(measurements)}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
