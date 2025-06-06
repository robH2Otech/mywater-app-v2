
import { useState } from "react";
import { UVCCard } from "./UVCCard";
import { UVCDetailsDialog } from "./UVCDetailsDialog";
import { useUVCStatusMutation } from "@/hooks/uvc/useUVCStatusMutation";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/usePermissions";
import { RoleBasedAccess, ReadOnlyForUsers } from "@/components/auth/RoleBasedAccess";

interface UVCListProps {
  units: any[];
  onUVCClick: (unit: any) => void;
}

export function UVCList({ units, onUVCClick }: UVCListProps) {
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const uvcMutation = useUVCStatusMutation();
  const queryClient = useQueryClient();
  const { filterDataByCompany, canUpdate, isReadOnlyMode } = usePermissions();

  // Filter units based on user's company access
  const filteredUnits = filterDataByCompany(units);

  console.log("UVCList - Units with UVC data:", filteredUnits.map(u => 
    `${u.id}: ${u.name}, UVC Hours: ${u.uvc_hours}, Status: ${u.uvc_status}, Is Accumulated: ${u.is_uvc_accumulated}`
  ));

  const handleEditClick = (e: React.MouseEvent, unit: any) => {
    e.stopPropagation();
    
    // Only allow editing if user has update permissions
    if (!canUpdate()) {
      console.log("User does not have permission to edit UVC units");
      return;
    }
    
    console.log("Edit UVC unit:", unit);
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedData: any) => {
    try {
      setIsSaving(true);
      
      const numericHours = typeof updatedData.uvc_hours === 'string' 
        ? parseFloat(updatedData.uvc_hours) 
        : updatedData.uvc_hours;
      
      await uvcMutation.mutateAsync({
        unitId: selectedUnit.id,
        uvcHours: numericHours,
        unitName: selectedUnit.name || '',
        installationDate: updatedData.uvc_installation_date
      });
      
      // Force refresh all related data
      await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
      await queryClient.invalidateQueries({ queryKey: ["units"] });
      await queryClient.invalidateQueries({ queryKey: ["unit", selectedUnit.id] });
      await queryClient.invalidateQueries({ queryKey: ["measurements"] });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating UVC info:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // If there are no UVC units to display after filtering
  if (filteredUnits.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold mb-2">No UVC Units Available</h3>
        <p className="text-gray-400">
          {units.length === 0 
            ? "There are no UVC units in the system. Add UVC units from the Water Units page."
            : "You don't have access to any UVC units in your company."
          }
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUnits.map((unit) => (
          <ReadOnlyForUsers
            key={unit.id}
            readOnlyContent={
              <UVCCard 
                id={unit.id}
                name={unit.name || ""}
                uvc_hours={unit.uvc_hours}
                uvc_status={unit.uvc_status}
                uvc_installation_date={unit.uvc_installation_date}
                location={unit.location}
                unit_type={unit.unit_type}
                onClick={() => onUVCClick(unit)}
                onEditClick={() => {}} // No edit for read-only users
                readOnly={true}
              />
            }
          >
            <UVCCard 
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
          </ReadOnlyForUsers>
        ))}
      </div>

      <RoleBasedAccess allowedRoles={['superadmin', 'admin', 'technician']}>
        <UVCDetailsDialog
          unit={selectedUnit}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </RoleBasedAccess>
    </>
  );
}
