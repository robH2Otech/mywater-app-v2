
import { useState, useEffect } from "react";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

/**
 * Hook that calculates UVC status for a list of units
 * Processes measurements and calculates total UVC hours
 */
export function useUVCStatusCalculation(units: any[]) {
  const [processedUnits, setProcessedUnits] = useState<any[]>([]);

  useEffect(() => {
    const processUnitsWithLatestData = async () => {
      try {
        console.log("Processing units in useUVCStatusCalculation:", units.length);
        
        // Process each unit in parallel
        const updatedUnitsPromises = units.map(async unit => {
          // Process basic unit data
          let baseUvcHours = unit.uvc_hours;
          if (typeof baseUvcHours === 'string') {
            baseUvcHours = parseFloat(baseUvcHours);
          } else if (baseUvcHours === undefined || baseUvcHours === null) {
            baseUvcHours = 0;
          }
          
          let totalVolume = unit.total_volume;
          if (typeof totalVolume === 'string') {
            totalVolume = parseFloat(totalVolume);
          } else if (totalVolume === undefined || totalVolume === null) {
            totalVolume = 0;
          }
          
          // If this unit doesn't already use accumulated hours, check for latest measurement data
          let totalUvcHours = baseUvcHours;
          let measurementUvcHours = 0;
          
          try {
            // Always get latest measurement for this unit
            const measurementsQuery = query(
              collection(db, "measurements"),
              where("unit_id", "==", unit.id),
              orderBy("timestamp", "desc"),
              limit(1)
            );
            
            const measurementsSnapshot = await getDocs(measurementsQuery);
            
            if (!measurementsSnapshot.empty) {
              const latestMeasurement = measurementsSnapshot.docs[0].data();
              
              if (latestMeasurement.uvc_hours !== undefined) {
                measurementUvcHours = typeof latestMeasurement.uvc_hours === 'string' 
                  ? parseFloat(latestMeasurement.uvc_hours) 
                  : (latestMeasurement.uvc_hours || 0);
                
                console.log(`Unit ${unit.id} - Latest measurement UVC hours: ${measurementUvcHours}`);
                
                // Add measurement hours to base hours, ONLY if the flag is NOT set
                // This prevents double counting hours we've already accumulated
                if (!unit.is_uvc_accumulated) {
                  totalUvcHours += measurementUvcHours;
                  console.log(`useUVCStatusCalculation - Unit ${unit.id}: Base ${baseUvcHours} + Measurement ${measurementUvcHours} = Total ${totalUvcHours}`);
                } else {
                  console.log(`useUVCStatusCalculation - Unit ${unit.id}: Using accumulated hours (${baseUvcHours}), ignoring measurement hours`);
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching measurements for unit ${unit.id}:`, error);
          }
          
          // Calculate statuses
          const uvcStatus = determineUVCStatus(totalUvcHours);
          const filterStatus = determineUnitStatus(totalVolume);
          
          // Log for debugging
          console.log(`useUVCStatusCalculation Final: Unit ${unit.id} - UVC hours: ${totalUvcHours}, Base: ${baseUvcHours}, Measurement: ${measurementUvcHours}, Status: ${uvcStatus}, Accumulated: ${unit.is_uvc_accumulated}`);
          
          // Return the updated unit data
          return {
            ...unit,
            uvc_status: uvcStatus,
            uvc_hours: totalUvcHours,
            status: filterStatus,
            total_volume: totalVolume
          };
        });
        
        const resolvedUnits = await Promise.all(updatedUnitsPromises);
        setProcessedUnits(resolvedUnits);
      } catch (error) {
        console.error("Error processing units in useUVCStatusCalculation:", error);
        // Fallback to basic processing if there's an error
        const basicProcessedUnits = units.map(unit => {
          // Ensure UVC hours is a number
          let uvcHours = unit.uvc_hours;
          if (typeof uvcHours === 'string') {
            uvcHours = parseFloat(uvcHours);
          } else if (uvcHours === undefined || uvcHours === null) {
            uvcHours = 0;
          }
          
          // Ensure total_volume is a number
          let totalVolume = unit.total_volume;
          if (typeof totalVolume === 'string') {
            totalVolume = parseFloat(totalVolume);
          } else if (totalVolume === undefined || totalVolume === null) {
            totalVolume = 0;
          }
          
          // Calculate statuses
          const uvcStatus = determineUVCStatus(uvcHours);
          const filterStatus = determineUnitStatus(totalVolume);
          
          return {
            ...unit,
            uvc_status: uvcStatus,
            uvc_hours: uvcHours,
            status: filterStatus,
            total_volume: totalVolume
          };
        });
        
        setProcessedUnits(basicProcessedUnits);
      }
    };
    
    processUnitsWithLatestData();
  }, [units]);

  return processedUnits;
}
