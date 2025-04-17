
import { useState, useEffect } from "react";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export function useUVCStatusMonitoring(units: any[]) {
  const [processedUnits, setProcessedUnits] = useState<any[]>([]);

  useEffect(() => {
    if (!units || units.length === 0) return;
    
    const processUnits = async () => {
      console.log(`Processing ${units.length} units for UVC status`);
      
      // Process each unit to get updated UVC hours from measurements
      const updatedUnits = await Promise.all(units.map(async (unit) => {
        try {
          // Default values from unit document
          let totalUvcHours = unit.uvc_hours || 0;
          let isUvcAccumulated = unit.is_uvc_accumulated || false;
          
          // Convert to number if it's a string
          if (typeof totalUvcHours === 'string') {
            totalUvcHours = parseFloat(totalUvcHours);
          }

          // Only fetch latest measurements if this unit is not already using accumulated hours
          if (!isUvcAccumulated) {
            console.log(`Fetching latest measurements for unit ${unit.id} - not using accumulated hours`);
            
            // Get the latest measurement to check UVC hours
            const measurementsCollection = `units/${unit.id}/measurements`;
            const measurementsQuery = query(
              collection(db, measurementsCollection),
              orderBy('timestamp', 'desc'),
              limit(1)
            );
            
            const measurementsSnapshot = await getDocs(measurementsQuery);
            
            if (!measurementsSnapshot.empty) {
              const latestMeasurement = measurementsSnapshot.docs[0].data();
              
              // Check if measurement has UVC hours
              if (latestMeasurement.uvc_hours !== undefined) {
                const measurementUvcHours = typeof latestMeasurement.uvc_hours === 'string'
                  ? parseFloat(latestMeasurement.uvc_hours)
                  : (latestMeasurement.uvc_hours || 0);
                  
                console.log(`Unit ${unit.id}: Base UVC Hours = ${totalUvcHours}, Measurement UVC Hours = ${measurementUvcHours}`);
                
                // Get the total UVC hours by adding base + measurement
                totalUvcHours = Math.max(totalUvcHours, measurementUvcHours);
              }
            } else {
              console.log(`No measurements found for unit ${unit.id}`);
            }
          } else {
            console.log(`Unit ${unit.id} using accumulated hours: ${totalUvcHours}`);
          }
          
          // Determine status based on the calculated total UVC hours
          const uvcStatus = determineUVCStatus(totalUvcHours);
          
          return {
            ...unit,
            uvc_hours: totalUvcHours,
            uvc_status: uvcStatus
          };
        } catch (error) {
          console.error(`Error processing UVC data for unit ${unit.id}:`, error);
          return unit;
        }
      }));
      
      console.log('Updated UVC units:', updatedUnits.map(u => `${u.id}: ${u.uvc_hours} hours`));
      setProcessedUnits(updatedUnits);
    };
    
    processUnits();
  }, [units]);

  return { processedUnits };
}
