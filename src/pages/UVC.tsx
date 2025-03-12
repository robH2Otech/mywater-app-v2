
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UVCDetailsDialog } from "@/components/uvc/UVCDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UVCList } from "@/components/uvc/UVCList";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";

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
          
          // Get UVC hours from the unit data if available
          const uvcHours = data.uvc_hours || 0;
          
          // Calculate the correct status based on UVC hours
          const calculatedStatus = determineUVCStatus(uvcHours);
          
          return {
            id: doc.id,
            ...data,
            // Use calculated status for UVC
            uvc_status: calculatedStatus,
            uvc_hours: uvcHours,
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
      // Determine new status based on updated hours
      const newStatus = determineUVCStatus(updatedData.uvc_hours);
      
      // Prepare data for Firestore update
      const updateData: any = {
        uvc_hours: updatedData.uvc_hours,
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
      
      // Handle alert creation if needed (reuse the logic in UVCList)
      // This will be handled by the effect in UVCList that monitors status changes
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      
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
