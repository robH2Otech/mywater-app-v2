
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus, createUVCAlertMessage } from "@/utils/uvcStatusUtils";
import { UVCDetailsDialog } from "./UVCDetailsDialog";
import { UVCCard } from "./UVCCard";
import { useUVCStatus } from "@/hooks/useUVCStatus";

interface UVCListProps {
  units: any[];
  onUVCClick: (unit: any) => void;
}

export function UVCList({ units, onUVCClick }: UVCListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { processedUnits } = useUVCStatus(units);

  console.log("UVCList - Processed Units:", processedUnits.map(u => 
    `${u.id}: ${u.name}, UVC Hours: ${u.uvc_hours}, is_accumulated: ${u.is_uvc_accumulated}`
  ));

  const handleEditClick = (e: React.MouseEvent, unit: any) => {
    e.stopPropagation();
    console.log("Edit UVC unit:", unit);
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedData: any) => {
    try {
      // Get the numeric hours from the form - this is now the TOTAL accumulated hours
      const numericHours = typeof updatedData.uvc_hours === 'string' 
        ? parseFloat(updatedData.uvc_hours) 
        : updatedData.uvc_hours;
      
      console.log(`Setting UVC hours for ${selectedUnit.id} to ${numericHours} (accumulated total)`);
      
      // Determine the new UVC status based on total hours
      const newStatus = determineUVCStatus(numericHours);
      
      // Update Firestore with the new total hours and mark as accumulated
      const unitDocRef = doc(db, "units", selectedUnit.id);
      await updateDoc(unitDocRef, {
        uvc_hours: numericHours,
        uvc_installation_date: updatedData.uvc_installation_date,
        uvc_status: newStatus,
        // Mark this unit as using accumulated hours
        is_uvc_accumulated: true,
        updated_at: new Date().toISOString()
      });

      // Create alert if status is warning or urgent
      if (newStatus === 'warning' || newStatus === 'urgent') {
        const alertMessage = createUVCAlertMessage(selectedUnit.name, numericHours, newStatus);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: selectedUnit.id,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Invalidate relevant queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['unit', selectedUnit.id] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Success",
        description: "UVC information has been updated successfully",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating UVC info:', error);
      toast({
        title: "Error",
        description: "Failed to update UVC information",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processedUnits.map((unit) => (
          <UVCCard 
            key={unit.id}
            unit={unit}
            onEditClick={handleEditClick}
            onCardClick={onUVCClick}
          />
        ))}
      </div>

      <UVCDetailsDialog
        unit={selectedUnit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />
    </>
  );
}
