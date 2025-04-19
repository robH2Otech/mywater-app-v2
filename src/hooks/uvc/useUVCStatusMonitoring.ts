
import { useState, useEffect } from "react";
import { determineUVCStatus } from "@/utils/uvcStatusUtils";
import { fetchLatestMeasurement } from "./measurementUtils";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

/**
 * Enhanced hook that monitors UVC status - ensuring measurements are always checked
 */
export function useUVCStatusMonitoring(units: any[]) {
  const [processedUnits, setProcessedUnits] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!units || units.length === 0) return;
    
    const processUnits = async () => {
      setIsProcessing(true);
      console.log(`Processing ${units.length} units for UVC status`);
      
      // Process each unit to get updated UVC hours from measurements
      const updatedUnits = await Promise.all(units.map(async (unit) => {
        try {
          // Always get the latest unit data to ensure we have current values
          const unitDocRef = doc(db, "units", unit.id);
          const unitDoc = await getDoc(unitDocRef);
          const latestUnitData = unitDoc.exists() ? unitDoc.data() : {};
          
          // Default values from unit document
          let baseUvcHours = latestUnitData.uvc_hours !== undefined ? 
            latestUnitData.uvc_hours : 
            unit.uvc_hours || 0;
            
          let isUvcAccumulated = latestUnitData.is_uvc_accumulated !== undefined ?
            latestUnitData.is_uvc_accumulated :
            unit.is_uvc_accumulated || false;
          
          // Convert to number if it's a string
          if (typeof baseUvcHours === 'string') {
            baseUvcHours = parseFloat(baseUvcHours);
          }
          
          let totalUvcHours = baseUvcHours;
          
          // Only fetch latest measurements if this unit is not already using accumulated hours
          if (!isUvcAccumulated) {
            console.log(`Fetching measurements for unit ${unit.id} - not using accumulated hours`);
            const measurementData = await fetchLatestMeasurement(unit.id);
            
            if (measurementData.hasMeasurementData) {
              const latestMeasurementUvcHours = measurementData.latestMeasurementUvcHours;
              
              console.log(`Unit ${unit.id}: Base UVC Hours = ${baseUvcHours}, Measurement UVC Hours = ${latestMeasurementUvcHours}`);
              
              // Add measurement hours to the base hours
              totalUvcHours += latestMeasurementUvcHours;
            }
          } else {
            console.log(`Unit ${unit.id} using accumulated hours: ${totalUvcHours}`);
          }
          
          // Determine status based on the calculated total UVC hours
          const uvcStatus = determineUVCStatus(totalUvcHours);
          
          // Merge with the latest unit data and override with our calculations
          return {
            ...unit,
            ...latestUnitData,
            id: unit.id,
            name: latestUnitData.name || unit.name,
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
      setIsProcessing(false);
    };
    
    processUnits();
  }, [units]);

  return { processedUnits, isProcessing };
}
