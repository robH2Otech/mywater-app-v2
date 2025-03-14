
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";

export function useUVCStatus(units: any[]) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processedUnits, setProcessedUnits] = useState<any[]>([]);

  useEffect(() => {
    const processUnitsWithLatestData = async () => {
      try {
        console.log("Processing units in useUVCStatus:", units.length);
        
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
                  console.log(`useUVCStatus - Unit ${unit.id}: Base ${baseUvcHours} + Measurement ${measurementUvcHours} = Total ${totalUvcHours}`);
                } else {
                  console.log(`useUVCStatus - Unit ${unit.id}: Using accumulated hours (${baseUvcHours}), ignoring measurement hours`);
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
          console.log(`useUVCStatus Final: Unit ${unit.id} - UVC hours: ${totalUvcHours}, Base: ${baseUvcHours}, Measurement: ${measurementUvcHours}, Status: ${uvcStatus}, Accumulated: ${unit.is_uvc_accumulated}`);
          
          // Check if UVC status changed
          if (unit.uvc_status !== uvcStatus) {
            console.log(`UVC status changed for ${unit.id}: ${unit.uvc_status} -> ${uvcStatus}`);
            await updateUVCStatus(unit.id, uvcStatus, unit.name, totalUvcHours);
          }
          
          // Check if filter status changed
          if (unit.status !== filterStatus) {
            console.log(`Filter status changed for ${unit.id}: ${unit.status} -> ${filterStatus}`);
            await updateFilterStatus(unit.id, filterStatus, unit.name, totalVolume);
          }
          
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
        console.error("Error processing units in useUVCStatus:", error);
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
  }, [units, queryClient, toast]);

  const updateUVCStatus = async (unitId: string, newStatus: string, unitName: string, hours: number) => {
    try {
      const unitDocRef = doc(db, "units", unitId);
      await updateDoc(unitDocRef, {
        uvc_status: newStatus,
        updated_at: new Date().toISOString()
      });

      if (newStatus === 'warning' || newStatus === 'urgent') {
        const alertMessage = createUVCAlertMessage(unitName, hours, newStatus);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: unitId,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Status updated",
        description: `${unitName} UVC status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating UVC status:', error);
    }
  };

  const updateFilterStatus = async (unitId: string, newStatus: string, unitName: string, volume: number) => {
    try {
      const unitDocRef = doc(db, "units", unitId);
      await updateDoc(unitDocRef, {
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      if (newStatus === 'warning' || newStatus === 'urgent') {
        const { createAlertMessage } = await import('@/utils/unitStatusUtils');
        const alertMessage = createAlertMessage(unitName, volume, newStatus);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: unitId,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['filter-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Status updated",
        description: `${unitName} filter status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating filter status:', error);
    }
  };

  return { 
    processedUnits,
    updateUVCStatus 
  };
}
