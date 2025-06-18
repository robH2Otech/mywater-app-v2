
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
      
      // Get the latest measurement data - ALWAYS fetch fresh data
      const measurementData = await fetchLatestMeasurement(unitId);
      
      // For UVC details, ALWAYS prioritize measurement data if available
      let totalUvcHours = baseUvcHours;
      let latestMeasurementTimestamp = null;
      
      if (measurementData.hasMeasurementData && measurementData.latestMeasurementUvcHours > 0) {
        // Use measurement hours directly as they are the most current
        totalUvcHours = measurementData.latestMeasurementUvcHours;
        latestMeasurementTimestamp = measurementData.timestamp;
        console.log(`UVCDetailsData - Using measurement UVC hours: ${totalUvcHours} for unit ${unitId}`);
      } else {
        console.log(`UVCDetailsData - No measurement data found for unit ${unitId}, using base hours: ${totalUvcHours}`);
      }
      
      // Extract the installation date if available
      const uvcInstallationDate = latestUnitData.uvc_installation_date || null;
      
      return {
        ...latestUnitData,
        id: unitId,
        uvc_hours: totalUvcHours,
        uvc_installation_date: uvcInstallationDate,
        latest_measurement_timestamp: latestMeasurementTimestamp
      };
    },
    enabled: !!unitId && isEnabled,
    // Reduced refresh frequency to match the main UVC data hook
    staleTime: 60 * 1000, // 60 seconds instead of aggressive refresh
    refetchInterval: 60 * 1000, // 60 seconds
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
