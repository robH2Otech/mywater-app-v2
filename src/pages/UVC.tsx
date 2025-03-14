
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UVCDetailsDialog } from "@/components/uvc/UVCDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UVCList } from "@/components/uvc/UVCList";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";
import { determineUnitStatus } from "@/utils/unitStatusUtils";

interface UnitWithUVC extends UnitData {
  uvc_hours?: number;
  uvc_installation_date?: string;
  uvc_status?: 'active' | 'warning' | 'urgent';
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
        // Get units
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        const unitsData = unitsSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Ensure total_volume is a number
          let totalVolume = data.total_volume;
          if (typeof totalVolume === 'string') {
            totalVolume = parseFloat(totalVolume);
          } else if (totalVolume === undefined || totalVolume === null) {
            totalVolume = 0;
          }
          
          // Get UVC hours from the unit data if available
          const uvcHours = typeof data.uvc_hours === 'string' 
            ? parseFloat(data.uvc_hours) 
            : (data.uvc_hours || 0);
          
          // Calculate the correct status based on UVC hours
          const uvcStatus = determineUVCStatus(uvcHours);
          
          // Calculate the correct filter status based on volume
          const filterStatus = determineUnitStatus(totalVolume);
          
          return {
            id: doc.id,
            ...data,
            // Always use calculated statuses
            status: filterStatus,
            uvc_status: uvcStatus,
            // Ensure UVC hours is a number
            uvc_hours: uvcHours,
            // Ensure total_volume is a number
            total_volume: totalVolume
          };
        }) as UnitWithUVC[];
        
        console.log("UVC units data:", unitsData);
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
      
      const newStatus = determineUVCStatus(numericHours);
      const oldStatus = selectedUnit.uvc_status;
      
      // Prepare data for Firestore update
      const updateData: any = {
        uvc_hours: numericHours,
        uvc_status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      // Add installation date if provided
      if (updatedData.uvc_installation_date) {
        updateData.uvc_installation_date = updatedData.uvc_installation_date.toISOString();
      }
      
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
