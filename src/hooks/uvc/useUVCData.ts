
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { processUnitUVCData } from "./uvcDataUtils";
import { fetchLatestMeasurement } from "./measurementUtils";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";

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
        
        // Check if MYWATER_003 unit exists, if not we'll add it specifically 
        const mywater003Doc = await getDoc(doc(db, "units", "MYWATER_003"));
        
        // Process each unit and directly fetch latest measurements
        let unitsPromises = unitsSnapshot.docs.map(async (unitDoc) => {
          const unitData = unitDoc.data();
          const unitId = unitDoc.id;
          
          // Get the correct measurements collection path for this unit
          const measurementsPath = getMeasurementsCollectionPath(unitId);
          console.log(`Getting latest measurements from ${measurementsPath} for unit ${unitId}`);
          
          // Fetch the latest measurement directly from the measurements collection
          const measurementData = await fetchLatestMeasurement(unitId);
          
          // Process the unit with its measurement data
          return processUnitUVCData(unitDoc, measurementData);
        });
        
        // If MYWATER_003 doesn't exist in the collection but we want to include it
        if (!mywater003Doc.exists()) {
          console.log("Adding special MYWATER_003 unit to the results");
          
          // Create a document-like object for the special unit
          const specialUnitDoc = {
            id: "MYWATER_003",
            data: () => ({
              id: "MYWATER_003",
              name: "MYWATER 003",
              unit_type: "uvc",
              status: "active",
              location: "Main Office",
              // Add other default fields as needed
            }),
            exists: () => true
          };
          
          // Fetch special unit's measurements directly
          const specialMeasurementData = await fetchLatestMeasurement("MYWATER_003");
          
          // Add special unit to promises array
          unitsPromises.push(processUnitUVCData(specialUnitDoc, specialMeasurementData));
        }
        
        // Wait for all units to be processed
        const allUnitsData = await Promise.all(unitsPromises) as UnitWithUVC[];
        
        // Filter only units that have UVC related data
        const unitsData = allUnitsData.filter(unit => 
          unit.unit_type === 'uvc' || 
          unit.id === "MYWATER_003" ||
          (unit.uvc_hours !== undefined && unit.uvc_hours > 0)
        );
        
        console.log("UVC units data processed successfully:", unitsData.length);
        
        // Log detailed info for debugging each unit
        unitsData.forEach(unit => {
          console.log(`Unit ${unit.id}: ${unit.name}, UVC Hours: ${unit.uvc_hours}, Accumulated: ${unit.is_uvc_accumulated}, Status: ${unit.uvc_status}, Latest Timestamp: ${unit.latest_measurement_timestamp}`);
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
    staleTime: 5 * 1000, // 5 seconds stale time (reduced for more frequent updates)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
