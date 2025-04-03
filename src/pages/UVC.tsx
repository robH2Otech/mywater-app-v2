
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { UVCList } from "@/components/uvc/UVCList";
import { UVCDetailsHandler } from "@/components/uvc/UVCDetailsHandler";
import { useUVCData, UnitWithUVC } from "@/hooks/uvc/useUVCData";

export const UVC = () => {
  const [selectedUnit, setSelectedUnit] = useState<UnitWithUVC | null>(null);
  const { data: units = [], isLoading, error } = useUVCData();

  if (error) {
    console.error("Error in UVC component:", error);
    return <div>Error loading UVC data. Please try again.</div>;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Only show UVC units - filter out DROP and Office units
  const uvcUnits = units.filter(unit => unit.unit_type === 'uvc');

  return (
    <div className="space-y-6">
      <PageHeader
        title="UVC Maintenance"
        description="Track and manage UVC bulb lifetime and maintenance schedules"
      />
      
      <UVCList
        units={uvcUnits}
        onUVCClick={setSelectedUnit}
      />

      <UVCDetailsHandler
        selectedUnit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
      />
    </div>
  );
};
