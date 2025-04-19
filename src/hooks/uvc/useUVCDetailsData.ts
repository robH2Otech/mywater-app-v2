
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { fetchLatestMeasurement } from "./measurementUtils";
import { formatDecimal } from "@/utils/measurements/formatUtils";

/**
 * Hook for fetching and managing UVC details for a single unit
 */
export function useUVCDetailsData(unitId: string | undefined, isEnabled: boolean) {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Query to get the latest UVC data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["uvc-unit-details", unitId],
    queryFn: async () => {
      if (!unitId) throw new Error("Unit ID is required");
      
      console.log(`UVCDetailsData - Fetching latest data for unit ${unitId}`);
      
      // Get the latest unit data from Firestore
      const unitDocRef = doc(db, "units", unitId);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (!unitSnapshot.exists()) {
        throw new Error(`Unit ${unitId} not found`);
      }
      
      const latestUnitData = unitSnapshot.data();
      console.log(`UVCDetailsData - Latest unit data for ${unitId}:`, latestUnitData);
      
      // Parse base UVC hours from unit document
      let baseUvcHours = latestUnitData.uvc_hours;
      if (typeof baseUvcHours === 'string') {
        baseUvcHours = parseFloat(baseUvcHours);
      } else if (baseUvcHours === undefined || baseUvcHours === null) {
        baseUvcHours = 0;
      }
      
      // If this unit doesn't already use accumulated hours, get the latest measurement data
      let totalUvcHours = baseUvcHours;
      let latestMeasurementTimestamp = null;
      
      if (!latestUnitData.is_uvc_accumulated) {
        const measurementData = await fetchLatestMeasurement(unitId);
        
        if (measurementData.hasMeasurementData) {
          // Add measurement hours to the base hours
          totalUvcHours += measurementData.latestMeasurementUvcHours;
          latestMeasurementTimestamp = measurementData.timestamp;
          console.log(`UVCDetailsData - Unit ${unitId}: Base ${baseUvcHours} + Measurement ${measurementData.latestMeasurementUvcHours} = Total ${totalUvcHours}`);
        }
      } else {
        console.log(`UVCDetailsData - Unit ${unitId}: Using accumulated hours (${baseUvcHours}), not adding measurement hours`);
      }
      
      return {
        ...latestUnitData,
        id: unitId,
        uvc_hours: totalUvcHours,
        latest_measurement_timestamp: latestMeasurementTimestamp
      };
    },
    enabled: !!unitId && isEnabled,
  });
  
  // Update lastUpdated state when data changes
  useEffect(() => {
    if (data) {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [data]);
  
  return {
    data,
    isLoading,
    refetch,
    lastUpdated
  };
}
