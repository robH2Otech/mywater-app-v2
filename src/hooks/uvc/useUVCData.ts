
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
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
 * Hook for fetching UVC data with proper processing of UVC hours for all unit types
 */
export function useUVCData() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["uvc-units"],
    queryFn: async () => {
      console.log("🔍 Fetching UVC units data with latest measurements...");
      try {
        // Get only real units from the database
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        
        console.log(`📊 Found ${unitsSnapshot.docs.length} total units`);
        
        // Process each real unit and directly fetch latest measurements
        let unitsPromises = unitsSnapshot.docs.map(async (unitDoc) => {
          const unitData = unitDoc.data();
          const unitId = unitDoc.id;
          
          // Only process units that are UVC-related or have UVC data
          const isUVCType = unitData.unit_type === 'uvc';
          const hasUVCData = unitData.uvc_hours !== undefined || unitData.uvc_status;
          
          // Skip units that are not UVC-related
          if (!isUVCType && !hasUVCData) {
            return null;
          }
          
          console.log(`🔧 Processing UVC unit ${unitId} (Type: ${unitData.unit_type})`);
          
          // Fetch the latest measurement directly for each unit
          console.log(`📊 Fetching fresh measurement data for unit ${unitId}`);
          const measurementData = await fetchLatestMeasurement(unitId);
          
          // Process the unit with its measurement data
          return processUnitUVCData(unitDoc, measurementData);
        });
        
        // Wait for all units to be processed
        const allUnitsData = await Promise.all(unitsPromises);
        
        // Filter out null results and ensure we have valid UVC units
        const unitsData = allUnitsData.filter((unit): unit is UnitWithUVC => 
          unit !== null && (
            unit.unit_type === 'uvc' || 
            (unit.uvc_hours !== undefined && unit.uvc_hours > 0)
          )
        );
        
        console.log(`✅ UVC units data processed successfully: ${unitsData.length} units`);
        
        // Log detailed info for debugging each unit
        unitsData.forEach(unit => {
          console.log(`📊 UVC Unit ${unit.id}: ${unit.name}, UVC Hours: ${unit.uvc_hours}, Status: ${unit.uvc_status}, Latest: ${unit.latest_measurement_timestamp}`);
        });
        
        return unitsData;
      } catch (error) {
        console.error("❌ Error fetching UVC units:", error);
        toast({
          title: "Error fetching units",
          description: "Failed to load UVC units",
          variant: "destructive",
        });
        throw error;
      }
    },
    // Reduced refresh frequency to 1 hour for better performance
    staleTime: 3600 * 1000, // 1 hour stale time
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Disable window focus refetch
    refetchInterval: 3600 * 1000, // Refetch every 1 hour
  });
}
