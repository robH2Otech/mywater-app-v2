
import { useState, useEffect } from 'react';
import { determineUVCStatus } from '@/utils/uvcStatusUtils';
import { UnitWithUVC } from './useUVCData';

export function useUVCStatusMonitoring(units: any[]) {
  const [processedUnits, setProcessedUnits] = useState<UnitWithUVC[]>([]);
  
  // Process units whenever they change
  useEffect(() => {
    if (!units || units.length === 0) {
      setProcessedUnits([]);
      return;
    }
    
    const processed = units.map(unit => {
      // Calculate total UVC hours based on measurements and accumulated data
      const numericUVCHours = typeof unit.uvc_hours === 'string'
        ? parseFloat(unit.uvc_hours)
        : (unit.uvc_hours || 0);
        
      // Get the latest measurement UVC hours if available
      const measurementUVCHours = unit.latest_measurement?.uvc_hours || 0;
      
      // Total UVC hours - use accumulated if flagged, otherwise add measurement
      let totalUVCHours = numericUVCHours;
      if (!unit.is_uvc_accumulated && measurementUVCHours > 0) {
        totalUVCHours += measurementUVCHours;
      }
      
      // Determine status based on total hours
      const uvcStatus = determineUVCStatus(totalUVCHours);
      
      console.log(`UVC Unit ${unit.id}: ${unit.name}, Base Hours: ${numericUVCHours}, Measurement: ${measurementUVCHours}, Total: ${totalUVCHours}, Status: ${uvcStatus}`);
      
      // Return updated unit with processed UVC data
      return {
        ...unit,
        uvc_hours: totalUVCHours,
        uvc_status: uvcStatus
      };
    });
    
    setProcessedUnits(processed);
  }, [units]);
  
  return { processedUnits };
}
