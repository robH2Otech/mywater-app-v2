
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UVCDetailsDialog } from "@/components/uvc/UVCDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UVCList } from "@/components/uvc/UVCList";
import { collection, getDocs, doc, updateDoc, addDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";

interface UnitWithUVC extends UnitData {
  uvc_hours?: number;
  uvc_installation_date?: string;
  uvc_status?: 'active' | 'warning' | 'urgent';
  is_uvc_accumulated?: boolean;
}

export const UVC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUnit, setSelectedUnit] = useState<UnitWithUVC | null>(null);

  const { data: units = [], isLoading, error } = useQuery({
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

  const handleSaveUVCDetails = async (updatedData: any) => {
    if (!selectedUnit) return;
    
    try {
      // Convert hours to numeric value and determine new status
      const numericHours = typeof updatedData.uvc_hours === 'string' ? 
        parseFloat(updatedData.uvc_hours) : updatedData.uvc_hours;
      
      console.log(`Saving UVC hours for ${selectedUnit.id}: ${numericHours}`);
      
      const newStatus = determineUVCStatus(numericHours);
      const oldStatus = selectedUnit.uvc_status;
      
      // Prepare data for Firestore update
      const updateData: any = {
        uvc_hours: numericHours,
        uvc_status: newStatus,
        // Mark this unit as having manually accumulated UVC hours
        is_uvc_accumulated: true,
        updated_at: new Date().toISOString()
      };
      
      // Add installation date if provided
      if (updatedData.uvc_installation_date) {
        updateData.uvc_installation_date = updatedData.uvc_installation_date.toISOString();
      }
      
      console.log("Updating unit with data:", updateData);
      
      // Update the unit document in Firestore
      const unitDocRef = doc(db, "units", selectedUnit.id);
      await updateDoc(unitDocRef, updateData);
      
      // Create alert if status changed to warning or urgent
      if ((newStatus === 'warning' || newStatus === 'urgent') && newStatus !== oldStatus) {
        const alertMessage = createUVCAlertMessage(selectedUnit.name || '', numericHours, newStatus);
        
        // Create new alert
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: selectedUnit.id,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["unit", selectedUnit.id] });
      await queryClient.invalidateQueries({ queryKey: ["alerts"] });
      
      toast({
        title: "UVC details updated",
        description: `Updated UVC details for ${selectedUnit.name}`,
      });
      
      // Close dialog
      setSelectedUnit(null);
    } catch (error) {
      console.error("Error updating UVC details:", error);
      toast({
        title: "Error updating UVC details",
        description: "Failed to update UVC details",
        variant: "destructive",
      });
    }
  };

  if (error) {
    console.error("Error in UVC component:", error);
    return <div>Error loading UVC data. Please try again.</div>;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="UVC Maintenance"
        description="Track and manage UVC bulb lifetime and maintenance schedules"
      />
      
      <UVCList
        units={units}
        onUVCClick={setSelectedUnit}
      />

      <UVCDetailsDialog
        open={!!selectedUnit}
        onOpenChange={(open) => !open && setSelectedUnit(null)}
        unit={selectedUnit}
        onSave={handleSaveUVCDetails}
      />
    </div>
  );
};
