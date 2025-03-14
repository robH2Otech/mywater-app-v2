
import { useEffect } from "react";
import { useUVCStatusCalculation } from "./useUVCStatusCalculation";
import { useUVCStatusUpdate } from "./useUVCStatusUpdate";

/**
 * Hook that monitors changes in UVC status and updates Firestore when needed
 */
export function useUVCStatusMonitoring(units: any[]) {
  const processedUnits = useUVCStatusCalculation(units);
  const { updateUVCStatus, updateFilterStatus } = useUVCStatusUpdate();
  
  // Monitor for status changes
  useEffect(() => {
    const checkForStatusChanges = async () => {
      if (!processedUnits.length) return;
      
      for (const processedUnit of processedUnits) {
        const originalUnit = units.find(u => u.id === processedUnit.id);
        if (!originalUnit) continue;
        
        // Check if UVC status changed
        if (originalUnit.uvc_status !== processedUnit.uvc_status) {
          console.log(`UVC status changed for ${processedUnit.id}: ${originalUnit.uvc_status} -> ${processedUnit.uvc_status}`);
          await updateUVCStatus(
            processedUnit.id, 
            processedUnit.uvc_status, 
            processedUnit.name,
            processedUnit.uvc_hours
          );
        }
        
        // Check if filter status changed
        if (originalUnit.status !== processedUnit.status) {
          console.log(`Filter status changed for ${processedUnit.id}: ${originalUnit.status} -> ${processedUnit.status}`);
          await updateFilterStatus(
            processedUnit.id, 
            processedUnit.status, 
            processedUnit.name,
            processedUnit.total_volume
          );
        }
      }
    };
    
    checkForStatusChanges();
  }, [processedUnits, units, updateUVCStatus, updateFilterStatus]);
  
  return { processedUnits };
}
