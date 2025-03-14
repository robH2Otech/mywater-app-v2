
import { useState, useEffect } from "react";
import { FilterDetailsDialog } from "./FilterDetailsDialog";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { FilterCard } from "./FilterCard";
import { useFilterStatus } from "./FilterStatusUtils";

interface FiltersListProps {
  units: any[];
  onFilterClick: (filter: any) => void;
}

export function FiltersList({ units, onFilterClick }: FiltersListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [processedUnits, setProcessedUnits] = useState<any[]>([]);
  const { processUnitsWithStatus } = useFilterStatus();

  // Process units to ensure correct status based on volume
  useEffect(() => {
    const updatedUnits = processUnitsWithStatus(units);
    setProcessedUnits(updatedUnits);
  }, [units]);

  const handleEditClick = (e: React.MouseEvent, unit: any) => {
    e.stopPropagation();
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedData: any) => {
    try {
      const numericVolume = typeof updatedData.total_volume === 'string' 
        ? parseFloat(updatedData.total_volume) 
        : updatedData.total_volume;
        
      const { determineUnitStatus, createAlertMessage } = await import('@/utils/unitStatusUtils');
      
      // Determine status based on volume
      const newStatus = determineUnitStatus(numericVolume);
      
      const unitDocRef = doc(db, "units", selectedUnit.id);
      await updateDoc(unitDocRef, {
        name: updatedData.name,
        location: updatedData.location,
        total_volume: numericVolume,
        status: newStatus,
        contact_name: updatedData.contact_name,
        contact_email: updatedData.contact_email,
        contact_phone: updatedData.contact_phone,
        next_maintenance: updatedData.next_maintenance,
        updated_at: new Date().toISOString()
      });

      // Check if an alert should be created
      if (newStatus === 'warning' || newStatus === 'urgent') {
        const alertMessage = createAlertMessage(updatedData.name, numericVolume, newStatus);
        
        // Add a new alert to the alerts collection
        const { collection, addDoc } = await import('firebase/firestore');
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: selectedUnit.id,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['filter-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Success",
        description: "Filter unit has been updated successfully",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating unit:', error);
      toast({
        title: "Error",
        description: "Failed to update filter unit",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processedUnits.map((unit) => (
          <FilterCard
            key={unit.id}
            unit={unit}
            onEditClick={handleEditClick}
            onClick={() => onFilterClick(unit)}
          />
        ))}
      </div>

      <FilterDetailsDialog
        filter={selectedUnit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />
    </>
  );
}
