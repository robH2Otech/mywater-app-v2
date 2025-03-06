
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLatestMeasurements, initializeSampleMeasurements, Measurement } from "@/utils/measurementUtils";
import { format } from "date-fns";

interface UnitMeasurementsProps {
  unitId: string;
}

export function UnitMeasurements({ unitId }: UnitMeasurementsProps) {
  const [measurements, setMeasurements] = useState<(Measurement & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchMeasurements = async () => {
    setIsLoading(true);
    try {
      const data = await getLatestMeasurements(unitId);
      setMeasurements(data);
    } catch (error) {
      console.error("Failed to fetch measurements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (unitId) {
      fetchMeasurements();
    }
  }, [unitId]);

  const handleGenerateSample = async () => {
    setIsGenerating(true);
    try {
      await initializeSampleMeasurements(unitId);
      await fetchMeasurements();
    } catch (error) {
      console.error("Failed to generate sample data:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    return format(new Date(isoString), "MMM d, yyyy HH:mm");
  };

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

      {isLoading ? (
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
                <th className="text-right py-2 px-4 text-gray-400">Cumulative Volume (m³)</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((measurement) => (
                <tr key={measurement.id} className="border-b border-spotify-accent hover:bg-spotify-accent/20">
                  <td className="py-2 px-4 text-white">{formatDateTime(measurement.timestamp)}</td>
                  <td className="py-2 px-4 text-white text-right">{measurement.volume.toLocaleString()}</td>
                  <td className="py-2 px-4 text-white text-right">{measurement.temperature.toFixed(1)}</td>
                  <td className="py-2 px-4 text-white text-right">{measurement.cumulative_volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
