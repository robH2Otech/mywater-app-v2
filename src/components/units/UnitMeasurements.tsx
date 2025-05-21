
import { Card } from "@/components/ui/card";
import { useRealtimeMeasurements } from "@/hooks/measurements/hooks";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MeasurementsHeader } from "./measurements/MeasurementsHeader";
import { MeasurementsTable } from "./measurements/MeasurementsTable";
import { EmptyMeasurements } from "./measurements/EmptyMeasurements";
import { Loader2 } from "lucide-react";

interface UnitMeasurementsProps {
  unitId: string;
}

export function UnitMeasurements({ unitId }: UnitMeasurementsProps) {
  const { measurements, isLoading, error, refetch, pathSearching } = useRealtimeMeasurements(unitId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  // Fetch unit details to determine unit type
  const { data: unit } = useQuery({
    queryKey: ["unit-type", unitId],
    queryFn: async () => {
      try {
        // All units are stored in the units collection
        const unitDocRef = doc(db, "units", unitId);
        const unitDoc = await getDoc(unitDocRef);
        
        if (unitDoc.exists()) {
          console.log(`Found unit ${unitId} in units collection`);
          return unitDoc.data();
        }
        
        console.log(`Unit document not found for ${unitId} in units collection`);
        return null;
      } catch (err) {
        console.error(`Error fetching unit details for ${unitId}:`, err);
        return null;
      }
    }
  });
  
  // Determine unit type for proper display
  const isMyWaterUnit = unitId.startsWith("MYWATER_");
  const unitType = unit?.unit_type || (isMyWaterUnit ? 'uvc' : 'drop');
  
  // Check if it's a UVC unit type (for correct display format)
  const isUVCUnit = unitType === 'uvc' && !unitType.includes('drop') && !unitType.includes('office');
  
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
        <div className="h-60 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400 text-center">
            Error loading measurements: {error.message}
            <br />
            <span className="text-sm text-gray-400 mt-1">
              {isMyWaterUnit ? "This is a MYWATER unit and may have a different data structure." : ""}
            </span>
          </p>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-spotify-accent hover:bg-spotify-accent/80 text-white rounded-md flex items-center gap-2"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  // Special loading state when searching for the correct data path
  if (pathSearching) {
    return (
      <Card className="bg-spotify-darker border-primary/20 p-6">
        <MeasurementsHeader
          isLoading={true}
          isRefreshing={true}
          onRefresh={handleManualRefresh}
          lastRefreshed={lastRefreshed}
        />
        <div className="h-60 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-spotify-accent animate-spin" />
          <p className="text-gray-300">Searching for measurement data...</p>
          <p className="text-xs text-gray-400 max-w-md text-center">
            For MYWATER units, this may take a moment as we locate the correct data path.
          </p>
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
