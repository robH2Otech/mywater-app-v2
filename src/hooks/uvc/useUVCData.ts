
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { processUnitUVCData } from "./uvcDataUtils";

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
      console.log("Fetching UVC units data...");
      try {
        // Get all units
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        
        // Process each unit and accumulate UVC hours from measurements
        const unitsPromises = unitsSnapshot.docs.map(async (unitDoc) => {
          return processUnitUVCData(unitDoc);
        });
        
        const unitsData = await Promise.all(unitsPromises) as UnitWithUVC[];
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
  });
}
