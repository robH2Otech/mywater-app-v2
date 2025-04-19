
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { processUnitUVCData } from "./uvcDataUtils";
import { fetchLatestMeasurement } from "./measurementUtils";

export interface UnitWithUVC {
  id: string;
  name?: string;
  uvc_hours?: number;
  uvc_installation_date?: string;
  uvc_status?: 'active' | 'warning' | 'urgent';
  is_uvc_accumulated?: boolean;
  status?: string;
  total_volume?: number;
  location?: string;
  unit_type?: string;
  latest_measurement_timestamp?: string;
  [key: string]: any;
}

/**
 * Hook for fetching UVC data with proper processing of UVC hours
 */
export function useUVCData() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["uvc-units"],
    queryFn: async () => {
      console.log("Fetching UVC units data with latest measurements...");
      try {
        // Get all units first
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        
        // Process each unit and accumulate UVC hours from measurements
        const unitsPromises = unitsSnapshot.docs.map(async (unitDoc) => {
          const unitData = unitDoc.data();
          const unitId = unitDoc.id;
          
          // Always get the latest measurement first to ensure fresh data
          const measurementData = await fetchLatestMeasurement(unitId);
          
          // Add the measurement data to the unit for processing
          return processUnitUVCData(unitDoc, measurementData);
        });
        
        const allUnitsData = await Promise.all(unitsPromises) as UnitWithUVC[];
        
        // Filter only units that have UVC after processing
        const unitsData = allUnitsData.filter(unit => 
          unit.unit_type === 'uvc' || 
          (unit.uvc_hours !== undefined && unit.uvc_hours > 0)
        );
        
        console.log("UVC units data processed successfully:", unitsData.length);
        
        // Log detailed info for debugging each unit
        unitsData.forEach(unit => {
          console.log(`Unit ${unit.id}: ${unit.name}, UVC Hours: ${unit.uvc_hours}, Accumulated: ${unit.is_uvc_accumulated}, Status: ${unit.uvc_status}`);
        });
        
        return unitsData;
      } catch (error) {
        console.error("Error fetching UVC units:", error);
        toast({
          title: "Error fetching units",
          description: "Failed to load UVC units",
          variant: "destructive",
        });
        throw error;
      }
    },
    // Set a shorter staleTime to ensure data is refreshed more frequently
    staleTime: 10 * 1000, // 10 seconds stale time (reduced from 30)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
