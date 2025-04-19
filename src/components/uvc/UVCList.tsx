
import { useState } from "react";
import { UVCCard } from "./UVCCard";
import { UVCDetailsDialog } from "./UVCDetailsDialog";
import { useUVCStatusMutation } from "@/hooks/uvc/useUVCStatusMutation";

interface UVCListProps {
  units: any[];
  onUVCClick: (unit: any) => void;
}

export function UVCList({ units, onUVCClick }: UVCListProps) {
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const uvcMutation = useUVCStatusMutation();

  console.log("UVCList - Units:", units.map(u => 
    `${u.id}: ${u.name}, UVC Hours: ${u.uvc_hours}, Status: ${u.uvc_status}`
  ));

  const handleEditClick = (e: React.MouseEvent, unit: any) => {
    e.stopPropagation();
    console.log("Edit UVC unit:", unit);
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedData: any) => {
    try {
      setIsSaving(true);
      
      // Get the numeric hours from the form
      const numericHours = typeof updatedData.uvc_hours === 'string' 
        ? parseFloat(updatedData.uvc_hours) 
        : updatedData.uvc_hours;
      
      // Use the mutation to update the UVC hours
      await uvcMutation.mutateAsync({
        unitId: selectedUnit.id,
        uvcHours: numericHours,
        unitName: selectedUnit.name || '',
        installationDate: updatedData.uvc_installation_date
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating UVC info:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // If there are no UVC units to display
  if (units.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold mb-2">No UVC Units Available</h3>
        <p className="text-gray-400">There are no UVC units in the system. Add UVC units from the Water Units page.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {units.map((unit) => (
          <UVCCard 
            key={unit.id}
            id={unit.id}
            name={unit.name || ""}
            uvc_hours={unit.uvc_hours}
            uvc_status={unit.uvc_status}
            uvc_installation_date={unit.uvc_installation_date}
            location={unit.location}
            unit_type={unit.unit_type}
            onClick={() => onUVCClick(unit)}
            onEditClick={(e) => handleEditClick(e, unit)}
          />
        ))}
      </div>

      <UVCDetailsDialog
        unit={selectedUnit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </>
  );
}
