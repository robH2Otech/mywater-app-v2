
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initializeSampleMeasurements, parseTimestamp } from "@/utils/measurementUtils";
import { useRealtimeMeasurements } from "@/hooks/useRealtimeMeasurements";
import { format } from "date-fns";
import { toast } from "sonner";
import { MeasurementData } from "@/types/analytics";

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

  const formatDateTime = (timestamp: any) => {
    try {
      const parsedDate = parseTimestamp(timestamp);
      if (!parsedDate) return "Invalid date";
      
      return format(parsedDate, "MMM d, yyyy HH:mm");
    } catch (error) {
      console.error("Error formatting date:", error, timestamp);
      return "Invalid date";
    }
  };

  const safeRenderMeasurements = (measurements: MeasurementData[]) => {
    return measurements.map((measurement) => {
      try {
        // Safely access and format all fields with fallbacks
        const timestamp = measurement.timestamp ? formatDateTime(measurement.timestamp) : "Invalid date";
        const volume = typeof measurement.volume === 'number' ? measurement.volume.toLocaleString() : "N/A";
        const temperature = typeof measurement.temperature === 'number' ? measurement.temperature.toFixed(1) : "N/A";
        const uvcHours = measurement.uvc_hours !== undefined && typeof measurement.uvc_hours === 'number'
          ? measurement.uvc_hours.toLocaleString(undefined, { maximumFractionDigits: 1 })
          : "N/A";
        const cumulativeVolume = typeof measurement.cumulative_volume === 'number'
          ? measurement.cumulative_volume.toLocaleString()
          : "N/A";

        return (
          <tr key={measurement.id} className="border-b border-spotify-accent hover:bg-spotify-accent/20">
            <td className="py-2 px-4 text-white">{timestamp}</td>
            <td className="py-2 px-4 text-white text-right">{volume}</td>
            <td className="py-2 px-4 text-white text-right">{temperature}</td>
            <td className="py-2 px-4 text-white text-right">{uvcHours}</td>
            <td className="py-2 px-4 text-white text-right">{cumulativeVolume}</td>
          </tr>
        );
      } catch (err) {
        console.error("Error rendering measurement row:", err, measurement);
        return (
          <tr key={measurement.id || 'error-row'} className="border-b border-spotify-accent hover:bg-spotify-accent/20">
            <td colSpan={5} className="py-2 px-4 text-red-400 text-center">Error displaying measurement data</td>
          </tr>
        );
      }
    });
  };

  // Show error message if there's an error
  if (error) {
    return (
      <Card className="bg-spotify-darker border-spotify-accent p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Water Measurements</h2>
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
        <h2 className="text-xl font-semibold text-white">Water Measurements</h2>
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
          <table className="w-full">
            <thead className="border-b border-spotify-accent">
              <tr>
                <th className="text-left py-2 px-4 text-gray-400">Timestamp</th>
                <th className="text-right py-2 px-4 text-gray-400">Volume (m³)</th>
                <th className="text-right py-2 px-4 text-gray-400">Temperature (°C)</th>
                <th className="text-right py-2 px-4 text-gray-400">UVC Hours</th>
                <th className="text-right py-2 px-4 text-gray-400">Cumulative Volume (m³)</th>
              </tr>
            </thead>
            <tbody>
              {safeRenderMeasurements(measurements)}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
