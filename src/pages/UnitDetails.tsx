
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useFilterStatus } from "@/components/filters/FilterStatusUtils";
import { UnitMeasurements } from "@/components/units/UnitMeasurements";
import { UnitDetailsCard } from "@/components/units/UnitDetailsCard";
import { UnitDetailsHeader } from "@/components/units/UnitDetailsHeader";
import { useUnitDetails } from "@/hooks/units/useUnitDetails";

export const UnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const { syncUnitMeasurements } = useFilterStatus();

  const { data: unit, isLoading } = useUnitDetails(id);

  const handleSync = async () => {
    if (!id) return;
    
    setIsSyncing(true);
    try {
      await syncUnitMeasurements(id);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-[400px] bg-spotify-darker rounded-lg" />;
  }

  if (!unit) {
    return <div>Unit not found</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fadeIn space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent p-6">
        <UnitDetailsHeader 
          title="Water Unit Details"
          isSyncing={isSyncing}
          onSync={handleSync}
          onBack={() => navigate("/units")}
        />
        <UnitDetailsCard unit={unit} />
      </Card>

      {id && <UnitMeasurements unitId={id} />}
    </div>
  );
};
