
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { processUnitUVCData } from "./uvcDataUtils";
import { fetchLatestMeasurement } from "./measurementUtils";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/utils/collectionPaths";

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
        // Get all units first
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        
        console.log(`📊 Found ${unitsSnapshot.docs.length} total units`);
        
        // Check if special units exist (MYWATER, X-WATER units)
        const specialUnits = ["MYWATER_003", "X-WATER 000"];
        const specialUnitPromises = specialUnits.map(async (unitId) => {
          const unitDoc = await getDoc(doc(db, "units", unitId));
          if (!unitDoc.exists()) {
            console.log(`📝 Creating special unit entry for ${unitId}`);
            // Create a document-like object for the special unit with all required UVC properties
            return {
              id: unitId,
              data: () => ({
                id: unitId,
                name: unitId.replace("_", " "),
                unit_type: "uvc",
                status: "active",
                location: "Main Office",
                uvc_hours: 0,
                uvc_status: 'active' as const,
                is_uvc_accumulated: false,
                total_volume: 0
              }),
              exists: () => true
            };
          }
          return unitDoc;
        });
        
        const specialUnitDocs = await Promise.all(specialUnitPromises);
        
        // Process each unit and directly fetch latest measurements
        const allUnitDocs = [...unitsSnapshot.docs, ...specialUnitDocs];
        
        let unitsPromises = allUnitDocs.map(async (unitDoc) => {
          const unitData = unitDoc.data();
          const unitId = unitDoc.id;
          
          // Check if this is a UVC-related unit
          const isSpecialUnit = unitId.startsWith("MYWATER_") || unitId.startsWith("X-WATER");
          const isUVCType = unitData.unit_type === 'uvc';
          const hasUVCData = unitData.uvc_hours !== undefined || unitData.uvc_status;
          
          // For special units, always process them regardless of type
          // For other units, only process if they're UVC-related
          if (!isSpecialUnit && !isUVCType && !hasUVCData) {
            return null;
          }
          
          console.log(`🔧 Processing UVC unit ${unitId} (Special: ${isSpecialUnit}, Type: ${unitData.unit_type})`);
          
          // Get the correct measurements collection path for this unit
          const measurementsPath = getMeasurementsCollectionPath(unitId);
          console.log(`📊 Getting measurements from ${measurementsPath} for unit ${unitId}`);
          
          // Fetch the latest measurement directly from the measurements collection
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
            unit.id?.startsWith("MYWATER_") ||
            unit.id?.startsWith("X-WATER") ||
            (unit.uvc_hours !== undefined && unit.uvc_hours > 0)
          )
        );
        
        console.log(`✅ UVC units data processed successfully: ${unitsData.length} units`);
        
        // Log detailed info for debugging each unit
        unitsData.forEach(unit => {
          console.log(`📊 Unit ${unit.id}: ${unit.name}, UVC Hours: ${unit.uvc_hours}, Accumulated: ${unit.is_uvc_accumulated}, Status: ${unit.uvc_status}, Latest: ${unit.latest_measurement_timestamp}`);
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
    // Set a shorter staleTime to ensure data is refreshed more frequently
    staleTime: 5 * 1000, // 5 seconds stale time for more frequent updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for real-time data
  });
}
