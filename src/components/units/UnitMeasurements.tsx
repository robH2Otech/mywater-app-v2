
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
        if (!unitDoc.exists()) {
          console.log(`Unit document not found for ${unitId}, trying alternative paths`);
          // Try an alternative path for MYWATER units
          if (unitId.startsWith("MYWATER_")) {
            const altUnitDocRef = doc(db, "devices", unitId);
            const altUnitDoc = await getDoc(altUnitDocRef);
            if (altUnitDoc.exists()) {
              return altUnitDoc.data();
            }
          }
          return null;
        }
        return unitDoc.data();
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
  
  // Set last refreshed time on component mount and when measurements change
  useEffect(() => {
    setLastRefreshed(new Date());
  }, [measurements]);
  
  // Force a refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
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
  
  useEffect(() => {
    if (isMyWaterUnit) {
      console.log(`🌊 MYWATER unit detected: ${unitId}`);
      console.log(`Data status: ${isLoading ? 'Loading' : 'Loaded'} | Error: ${error ? error.message : 'None'}`);
      console.log(`Measurements count: ${measurements.length}`);
      if (measurements.length > 0) {
        console.log('First measurement:', {
          timestamp: measurements[0].timestamp,
          volume: measurements[0].volume,
          temperature: measurements[0].temperature,
          uvc_hours: measurements[0].uvc_hours
        });
      }
    }
  }, [isMyWaterUnit, measurements, isLoading, error, unitId]);
  
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
