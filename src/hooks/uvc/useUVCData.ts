
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, doc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";

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
          const unitData = unitDoc.data();
          const unitId = unitDoc.id;
          
          console.log(`Processing unit ${unitId} (${unitData.name})`);
          
          // Get base UVC hours from unit document
          let baseUvcHours = unitData.uvc_hours;
          if (typeof baseUvcHours === 'string') {
            baseUvcHours = parseFloat(baseUvcHours);
          } else if (baseUvcHours === undefined || baseUvcHours === null) {
            baseUvcHours = 0;
          }
          
          console.log(`Unit ${unitId} - Base UVC hours from database: ${baseUvcHours}`);
          console.log(`Unit ${unitId} - is_uvc_accumulated flag: ${unitData.is_uvc_accumulated}`);
          
          // Get latest measurement data for this unit
          let latestMeasurementUvcHours = 0;
          let hasMeasurementData = false;
          
          try {
            const measurementsQuery = query(
              collection(db, "measurements"),
              where("unit_id", "==", unitId),
              orderBy("timestamp", "desc"),
              limit(1)
            );
            
            const measurementsSnapshot = await getDocs(measurementsQuery);
            
            if (!measurementsSnapshot.empty) {
              const latestMeasurement = measurementsSnapshot.docs[0].data();
              if (latestMeasurement.uvc_hours !== undefined) {
                latestMeasurementUvcHours = typeof latestMeasurement.uvc_hours === 'string' 
                  ? parseFloat(latestMeasurement.uvc_hours) 
                  : (latestMeasurement.uvc_hours || 0);
                hasMeasurementData = true;
                
                console.log(`Unit ${unitId} - Latest measurement UVC hours: ${latestMeasurementUvcHours}`);
              }
            }
          } catch (measurementError) {
            console.error(`Error fetching measurements for unit ${unitId}:`, measurementError);
          }
          
          // Calculate total UVC hours
          let totalUvcHours = baseUvcHours;
          
          // If we have measurement data, add it to the base UVC hours, but only if the
          // unit is not already using accumulated values
          if (hasMeasurementData && !unitData.is_uvc_accumulated) {
            totalUvcHours += latestMeasurementUvcHours;
            console.log(`Unit ${unitId} - Adding measurement hours to base: ${baseUvcHours} + ${latestMeasurementUvcHours} = ${totalUvcHours}`);
          } else if (unitData.is_uvc_accumulated) {
            console.log(`Unit ${unitId} - Using accumulated hours (${baseUvcHours}), not adding measurement hours`);
          }
          
          // Calculate the correct status based on total UVC hours
          const uvcStatus = determineUVCStatus(totalUvcHours);
          
          // Ensure total_volume is a number
          let totalVolume = unitData.total_volume;
          if (typeof totalVolume === 'string') {
            totalVolume = parseFloat(totalVolume);
          } else if (totalVolume === undefined || totalVolume === null) {
            totalVolume = 0;
          }
          
          // Calculate the correct filter status based on volume
          const filterStatus = determineUnitStatus(totalVolume);
          
          console.log(`Unit ${unitId} Final UVC hours: Base ${baseUvcHours} + Latest ${hasMeasurementData && !unitData.is_uvc_accumulated ? latestMeasurementUvcHours : 0} = Total ${totalUvcHours} (status: ${uvcStatus})`);
          
          return {
            id: unitId,
            ...unitData,
            // Always use calculated statuses
            status: filterStatus,
            uvc_status: uvcStatus,
            // Use total UVC hours
            uvc_hours: totalUvcHours,
            // Add flag to track whether hours are accumulated
            is_uvc_accumulated: unitData.is_uvc_accumulated || false,
            // Ensure total_volume is a number
            total_volume: totalVolume
          };
        });
        
        const unitsData = await Promise.all(unitsPromises) as UnitWithUVC[];
        console.log("UVC units data processed:", unitsData.map(u => `${u.id}: ${u.name}, UVC Hours: ${u.uvc_hours}, Accumulated: ${u.is_uvc_accumulated}`));
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
