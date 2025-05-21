import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useFilterStatus } from "@/components/filters/FilterStatusUtils";
import { UnitMeasurements } from "@/components/units/UnitMeasurements";
import { UnitDetailsCard } from "@/components/units/UnitDetailsCard";
import { UnitDetailsHeader } from "@/components/units/UnitDetailsHeader";
import { UnitLocationSection } from "@/components/units/details/UnitLocationSection";
import { UnitError } from "@/components/units/details/UnitError";
import { UnitLoading } from "@/components/units/details/UnitLoading";
import { useUnitDetails } from "@/hooks/units/useUnitDetails";
import { toast } from "sonner";

const UnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const { syncUnitMeasurements } = useFilterStatus();
  const { data: unit, isLoading, error, refetch } = useUnitDetails(id);

  const handleSync = async () => {
    if (!id) return;
    
    setIsSyncing(true);
    try {
      await syncUnitMeasurements(id);
      toast.success("Measurements synced successfully");
    } catch (err) {
      console.error("Error syncing measurements:", err);
      toast.error("Failed to sync measurements");
    } finally {
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };
  
  const handleRetry = async () => {
    if (isLoading) return;
    
    setIsSyncing(true);
    try {
      await refetch();
      toast.success("Data refreshed successfully");
    } catch (err) {
      console.error("Error refreshing unit data:", err);
      toast.error("Failed to refresh data");
    } finally {
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  const isMyWaterUnit = id ? id.startsWith("MYWATER_") : false;

  // Show appropriate error message based on unit type
  if (error) {
    return (
      <UnitError 
        error={error} 
        onRetry={handleRetry} 
        isSyncing={isSyncing}
        unitId={id || ''}
        isMyWaterUnit={isMyWaterUnit}
      />
    );
  }
  
  if (isLoading) return <UnitLoading isMyWaterUnit={isMyWaterUnit} />;
  if (!unit) return <UnitError error={new Error("Unit not found")} onRetry={handleRetry} isSyncing={isSyncing} unitId={id || ''} isMyWaterUnit={isMyWaterUnit} />;

  return (
    <div className="container mx-auto p-3 md:p-6 max-w-4xl animate-fadeIn space-y-4 md:space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent p-4 md:p-6">
        <UnitDetailsHeader 
          title={isMyWaterUnit ? "MYWATER Unit Details" : "Water Unit Details"}
          isSyncing={isSyncing}
          onSync={handleSync}
          onBack={() => navigate("/units")}
          unitId={id}
          unitIccid={unit.iccid || ''}
        />
        <UnitLocationSection unit={unit} unitId={id || ''} />
        <UnitDetailsCard unit={unit} />
      </Card>

      {id && <UnitMeasurements unitId={id} />}
    </div>
  );
};

export default UnitDetails;
