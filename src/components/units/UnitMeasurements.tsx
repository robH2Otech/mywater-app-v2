
import { Card } from "@/components/ui/card";
import { useRealtimeMeasurements } from "@/hooks/measurements/useRealtimeMeasurements";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MeasurementsHeader } from "./measurements/MeasurementsHeader";
import { MeasurementsTable } from "./measurements/MeasurementsTable";
import { EmptyMeasurements } from "./measurements/EmptyMeasurements";

interface UnitMeasurementsProps {
  unitId: string;
}

export function UnitMeasurements({ unitId }: UnitMeasurementsProps) {
  const { measurements, isLoading, error, refetch } = useRealtimeMeasurements(unitId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  // Fetch unit details to determine unit type
  const { data: unit } = useQuery({
    queryKey: ["unit-type", unitId],
    queryFn: async () => {
      try {
        const unitDocRef = doc(db, "units", unitId);
        const unitDoc = await getDoc(unitDocRef);
        return unitDoc.exists() ? unitDoc.data() : null;
      } catch (err) {
        console.error(`Error fetching unit details for ${unitId}:`, err);
        return null;
      }
    }
  });
  
  // Determine unit type for proper display
  const isMyWaterUnit = unitId.startsWith("MYWATER_");
  const unitType = unit?.unit_type || (isMyWaterUnit ? 'uvc' : 'drop');
  const isUVCUnit = unitType === 'uvc' || isMyWaterUnit || unitId.includes("UVC");
  
  // Set last refreshed time on component mount
  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);
  
  // Force a refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastRefreshed(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastRefreshed(new Date());
      toast.success("Measurements data refreshed");
    } catch (err) {
      toast.error("Error refreshing measurements");
      console.error("Error refreshing:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };
  
  // Show error message if there's an error
  if (error) {
    return (
      <Card className="bg-spotify-darker border-primary/20 p-6">
        <MeasurementsHeader
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
          lastRefreshed={lastRefreshed}
        />
        <div className="h-60 flex items-center justify-center">
          <p className="text-red-400">Error loading measurements: {error.message}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-spotify-darker border-primary/20 p-6">
      <MeasurementsHeader
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={handleManualRefresh}
        lastRefreshed={lastRefreshed}
      />

      {isLoading && measurements.length === 0 ? (
        <EmptyMeasurements isLoading={true} onRefresh={handleManualRefresh} />
      ) : measurements.length === 0 ? (
        <EmptyMeasurements isLoading={false} onRefresh={handleManualRefresh} />
      ) : (
        <div className="overflow-x-auto">
          <MeasurementsTable 
            measurements={measurements} 
            isUVCUnit={isUVCUnit} 
          />
        </div>
      )}
    </Card>
  );
}
