
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";

export function useUnitDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["unit", id],
    queryFn: async () => {
      if (!id) throw new Error("Unit ID is required");
      
      // 1. Get the unit base data
      const unitDocRef = doc(db, "units", id);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (!unitSnapshot.exists()) {
        throw new Error("Unit not found");
      }
      
      const unitData = unitSnapshot.data();
      
      // 2. Get the latest measurements data to check for additional UVC hours
      // This ensures we're getting the most up-to-date UVC hours
      const measurementsQuery = query(
        collection(db, "measurements"),
        where("unit_id", "==", id),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      
      const measurementsSnapshot = await getDocs(measurementsQuery);
      
      // Initialize values that we'll potentially update from measurements
      let latestMeasurementUvcHours = 0;
      let hasMeasurementData = false;
      
      // Check if we have measurement data
      if (!measurementsSnapshot.empty) {
        const latestMeasurement = measurementsSnapshot.docs[0].data();
        if (latestMeasurement.uvc_hours !== undefined) {
          latestMeasurementUvcHours = typeof latestMeasurement.uvc_hours === 'string' 
            ? parseFloat(latestMeasurement.uvc_hours) 
            : (latestMeasurement.uvc_hours || 0);
          hasMeasurementData = true;
        }
      }
      
      // 3. Process the total volume
      let totalVolume = unitData.total_volume;
      if (typeof totalVolume === 'string') {
        totalVolume = parseFloat(totalVolume);
      } else if (totalVolume === undefined || totalVolume === null) {
        totalVolume = 0;
      }
      
      // 4. Process the UVC hours from the unit document
      let baseUvcHours = unitData.uvc_hours;
      if (typeof baseUvcHours === 'string') {
        baseUvcHours = parseFloat(baseUvcHours);
      } else if (baseUvcHours === undefined || baseUvcHours === null) {
        baseUvcHours = 0;
      }
      
      // 5. Calculate the total UVC hours by adding base hours and measurement hours
      // We use either the base hours (if no measurements) or the sum of both
      let totalUvcHours = baseUvcHours;
      
      // If we have measurement data, add it to the base UVC hours, but only if the
      // unit is not already using accumulated values
      if (hasMeasurementData && !unitData.is_uvc_accumulated) {
        totalUvcHours += latestMeasurementUvcHours;
        console.log(`Unit ${id} - Base UVC hours: ${baseUvcHours}, Measurement UVC hours: ${latestMeasurementUvcHours}, Total: ${totalUvcHours}`);
      }
      
      // 6. Recalculate statuses
      const filterStatus = determineUnitStatus(totalVolume);
      const uvcStatus = determineUVCStatus(totalUvcHours);
      
      console.log(`useUnitDetails - Unit ${id}: UVC Hours - Base: ${baseUvcHours}, Latest: ${latestMeasurementUvcHours}, Total: ${totalUvcHours}, Status: ${uvcStatus}`);
      
      return {
        id: unitSnapshot.id,
        ...unitData,
        // Return numeric values for consistency
        total_volume: totalVolume,
        uvc_hours: totalUvcHours,
        // Ensure statuses are calculated based on current values
        status: filterStatus,
        uvc_status: uvcStatus,
        // Add flag to track whether UVC hours are already accumulated
        is_uvc_accumulated: unitData.is_uvc_accumulated || false
      } as UnitData;
    },
    enabled: !!id,
  });
}
