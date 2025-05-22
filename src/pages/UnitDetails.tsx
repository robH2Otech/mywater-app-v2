
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useFilterStatus } from "@/components/filters/FilterStatusUtils";
import { UnitMeasurements } from "@/components/units/UnitMeasurements";
import { UnitDetailsCard } from "@/components/units/UnitDetailsCard";
import { UnitDetailsHeader } from "@/components/units/UnitDetailsHeader";
import { UnitLocationSection } from "@/components/units/details/UnitLocationSection";
import { UnitError } from "@/components/units/details/UnitError";
import { UnitLoading } from "@/components/units/details/UnitLoading";
import { useUnitDetails } from "@/hooks/units/useUnitDetails";
import { toast } from "sonner";
import { UnitLocationLink } from "@/components/units/UnitLocationLink";

const UnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const { syncUnitMeasurements } = useFilterStatus();
  
  // Extra validation for ID
  const unitId = id ? id.trim() : null;
  const isMyWaterUnit = unitId ? unitId.startsWith("MYWATER_") : false;
  
  console.log(`UnitDetails: Loading unit with ID: "${unitId}", isMyWaterUnit: ${isMyWaterUnit}`);
  
  // Only fetch if we have a valid unitId
  const { 
    data: unit, 
    isLoading, 
    error, 
    refetch 
  } = useUnitDetails(unitId || undefined);
  
  const [retryCount, setRetryCount] = useState(0);

  // Automatic retry for certain errors
  useEffect(() => {
    if (error && retryCount < 2) {
      const timer = setTimeout(() => {
        console.log(`Auto-retrying unit details fetch (${retryCount + 1}/2)...`);
        setRetryCount(prev => prev + 1);
        refetch();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refetch]);

  const handleSync = async () => {
    if (!unitId) {
      toast.error("Cannot sync: Unit ID is missing");
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncUnitMeasurements(unitId);
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

  // Improved error handling with more specific messages
  if (!unitId) {
    return (
      <UnitError 
        error={new Error("Invalid unit ID in URL")} 
        onRetry={() => navigate("/units")} 
        isSyncing={false}
        unitId=""
        isMyWaterUnit={false}
      />
    );
  }
  
  // Show appropriate error message based on unit type
  if (error) {
    return (
      <UnitError 
        error={error} 
        onRetry={handleRetry} 
        isSyncing={isSyncing}
        unitId={unitId}
        isMyWaterUnit={isMyWaterUnit}
      />
    );
  }
  
  if (isLoading) return <UnitLoading isMyWaterUnit={isMyWaterUnit} />;
  if (!unit) return <UnitError error={new Error("Unit not found")} onRetry={handleRetry} isSyncing={isSyncing} unitId={unitId} isMyWaterUnit={isMyWaterUnit} />;

  return (
    <div className="container mx-auto p-3 md:p-6 max-w-4xl animate-fadeIn space-y-4 md:space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent p-4 md:p-6">
        <UnitDetailsHeader 
          title={isMyWaterUnit ? "MYWATER Unit Details" : "Water Unit Details"}
          isSyncing={isSyncing}
          onSync={handleSync}
          onBack={() => navigate("/units")}
          unitId={unitId}
          unitIccid={unit.iccid || ''}
        />
        
        <div className="flex justify-end mb-4">
          <UnitLocationLink unitId={unitId} iccid={unit.iccid} />
        </div>
        
        <UnitLocationSection unit={unit} unitId={unitId} />
        <UnitDetailsCard unit={unit} />
      </Card>

      {unitId && <UnitMeasurements unitId={unitId} />}
    </div>
  );
};

export default UnitDetails;
