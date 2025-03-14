
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

  // Fix the issue with unit details not loading
  const { data: unit, isLoading, error } = useUnitDetails(id);

  const handleSync = async () => {
    if (!id) return;
    
    setIsSyncing(true);
    try {
      await syncUnitMeasurements(id);
    } finally {
      setIsSyncing(false);
    }
  };

  // Add proper error handling to explain the issue
  if (error) {
    console.error("Error loading unit details:", error);
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="bg-spotify-darker border-spotify-accent p-6">
          <div className="text-red-400 p-4">
            <h2 className="text-xl font-semibold mb-2">Error loading unit details</h2>
            <p>{error.message || "An unknown error occurred"}</p>
            <button 
              onClick={() => navigate("/units")} 
              className="mt-4 bg-spotify-accent px-4 py-2 rounded hover:bg-spotify-accent-hover"
            >
              Back to Units
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="bg-spotify-darker border-spotify-accent p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-spotify-accent rounded w-1/3"></div>
            <div className="h-32 bg-spotify-accent rounded"></div>
            <div className="h-64 bg-spotify-accent rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="bg-spotify-darker border-spotify-accent p-6">
          <div className="text-center p-4">
            <h2 className="text-xl font-semibold mb-2">Unit not found</h2>
            <p>The requested water unit could not be found.</p>
            <button 
              onClick={() => navigate("/units")} 
              className="mt-4 bg-spotify-accent px-4 py-2 rounded hover:bg-spotify-accent-hover"
            >
              Back to Units
            </button>
          </div>
        </Card>
      </div>
    );
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
