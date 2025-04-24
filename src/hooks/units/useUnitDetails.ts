
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";

export function useUnitDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["unit", id],
    queryFn: async () => {
      if (!id) throw new Error("Unit ID is required");
      
      console.log(`Fetching unit details for ${id}`);
      
      // Special case for MYWATER 003
      const isSpecialUnit = id === "MYWATER_003";
      
      // 1. Get the unit base data
      let unitDocRef;
      if (isSpecialUnit) {
        unitDocRef = doc(db, "units", id);
      } else {
        unitDocRef = doc(db, "units", id);
      }
      
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (!unitSnapshot.exists()) {
        throw new Error("Unit not found");
      }
      
      const unitData = unitSnapshot.data() as Record<string, any>;
      console.log(`Unit ${id} base data:`, unitData);
      
      // 2. Get the latest measurements data using the correct collection path
      const collectionPath = getMeasurementsCollectionPath(id);
      console.log(`Unit ${id} - Using measurements path: ${collectionPath}`);
      
      const measurementsQuery = query(
        collection(db, collectionPath),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      
      const measurementsSnapshot = await getDocs(measurementsQuery);
      
      // Initialize values that we'll potentially update from measurements
      let latestMeasurementUvcHours = 0;
      let latestVolume = 0;
      let hasMeasurementData = false;
      
      // Check if we have measurement data
      if (!measurementsSnapshot.empty) {
        const latestMeasurement = measurementsSnapshot.docs[0].data();
        console.log(`Latest measurement for unit ${id}:`, latestMeasurement);
        
        if (latestMeasurement.volume !== undefined) {
          // Get latest volume from measurement
          latestVolume = typeof latestMeasurement.volume === 'string' 
            ? parseFloat(latestMeasurement.volume) 
            : (latestMeasurement.volume || 0);
          hasMeasurementData = true;
          console.log(`Unit ${id} - Latest measurement volume: ${latestVolume}`);
        }
        
        if (latestMeasurement.uvc_hours !== undefined) {
          latestMeasurementUvcHours = typeof latestMeasurement.uvc_hours === 'string' 
            ? parseFloat(latestMeasurement.uvc_hours) 
            : (latestMeasurement.uvc_hours || 0);
          console.log(`Unit ${id} - Latest measurement UVC hours: ${latestMeasurementUvcHours}`);
        }
      } else {
        console.log(`Unit ${id} - No measurements found in collection: ${collectionPath}`);
      }
      
      // 3. Use the latest volume as the total_volume
      let totalVolume = latestVolume;
      if (!hasMeasurementData) {
        // Fallback to the unit's stored total_volume if no measurements exist
        totalVolume = unitData.total_volume || 0;
        if (typeof totalVolume === 'string') {
          totalVolume = parseFloat(totalVolume);
        } else if (totalVolume === undefined || totalVolume === null) {
          totalVolume = 0;
        }
      }
      
      // 4. Process the UVC hours from the unit document
      let baseUvcHours = unitData.uvc_hours || 0;
      if (typeof baseUvcHours === 'string') {
        baseUvcHours = parseFloat(baseUvcHours);
      } else if (baseUvcHours === undefined || baseUvcHours === null) {
        baseUvcHours = 0;
      }
      
      console.log(`Unit ${id} - Base UVC hours: ${baseUvcHours}`);
      
      // For MYWATER 003, if we have measurement data, use it directly instead of adding
      let totalUvcHours = baseUvcHours;
      if (isSpecialUnit && latestMeasurementUvcHours > 0) {
        totalUvcHours = latestMeasurementUvcHours;
        console.log(`Special unit ${id} - Using measurement hours directly: ${totalUvcHours}`);
      }
      // For other units with UVC hours
      else if (hasMeasurementData && latestMeasurementUvcHours > 0 && !unitData.is_uvc_accumulated) {
        totalUvcHours += latestMeasurementUvcHours;
        console.log(`Unit ${id} - Adding measurement hours: ${baseUvcHours} + ${latestMeasurementUvcHours} = ${totalUvcHours}`);
      }
      
      // 6. Recalculate statuses
      const filterStatus = determineUnitStatus(totalVolume);
      const uvcStatus = determineUVCStatus(totalUvcHours);
      
      console.log(`useUnitDetails - Unit ${id}: Volume - ${totalVolume}, UVC Hours - Base: ${baseUvcHours}, Latest: ${latestMeasurementUvcHours}, Total: ${totalUvcHours}, Status: ${uvcStatus}`);
      
      const result: UnitData = {
        id: unitSnapshot.id,
        name: unitData.name || "",
        location: unitData.location,
        status: filterStatus,
        total_volume: totalVolume,
        uvc_hours: totalUvcHours,
        uvc_status: uvcStatus,
        is_uvc_accumulated: unitData.is_uvc_accumulated || false,
        unit_type: unitData.unit_type,
        contact_name: unitData.contact_name,
        contact_email: unitData.contact_email,
        contact_phone: unitData.contact_phone,
        next_maintenance: unitData.next_maintenance,
        setup_date: unitData.setup_date,
        uvc_installation_date: unitData.uvc_installation_date,
        eid: unitData.eid,
        iccid: unitData.iccid
      };
      
      return result;
    },
    enabled: !!id,
    retry: 1, // Only retry once to avoid excessive error messages
  });
}
