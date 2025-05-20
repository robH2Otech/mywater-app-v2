
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitLoading } from "@/components/units/details/UnitLoading";
import { UnitError } from "@/components/units/details/UnitError";
import { UnitDetailsHeader } from "@/components/units/UnitDetailsHeader";
import { UnitDetailsCard } from "@/components/units/UnitDetailsCard";
import { UnitLocationSection } from "@/components/units/details/UnitLocationSection";
import { ReportCard } from "@/components/analytics/ReportCard";
import { useReports } from "@/hooks/useReports";
import { UnitData } from "@/types/analytics";
import { UnitMlDetails } from "@/components/units/UnitMlDetails";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUnitMLData } from "@/hooks/ml/useUnitMLData";

const UnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Fetch unit data
  const { data: unit, isLoading, error, refetch } = useQuery({
    queryKey: ["unit", id],
    queryFn: async () => {
      if (!id) throw new Error("Unit ID is required");

      const unitDocRef = doc(db, "units", id);
      const unitSnapshot = await getDoc(unitDocRef);

      if (!unitSnapshot.exists()) {
        throw new Error("Unit not found");
      }

      return {
        id: unitSnapshot.id,
        ...unitSnapshot.data(),
      } as UnitData;
    },
  });
  
  // Fetch reports for this unit
  const { data: reports = [] } = useReports(id || "");
  
  // Handle sync button click
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await refetch();
      toast.success("Unit data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh unit data");
      console.error("Sync error:", error);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate("/units");
  };
  
  // Show loading state
  if (isLoading) {
    return <UnitLoading />;
  }

  // Show error state
  if (error || !unit) {
    return <UnitError error={error as Error} />;
  }

  return (
    <div className="space-y-6 pb-6">
      <UnitDetailsHeader 
        title={unit.name || "Unit Details"} 
        isSyncing={isSyncing} 
        onSync={handleSync} 
        onBack={handleBack}
        unitId={id}
        unitIccid={unit.iccid}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <UnitDetailsCard unit={unit} />
        <div className="xl:col-span-2">
          <UnitMlDetails unit={unit} />
        </div>
      </div>
      
      {/* Display reports if available */}
      {reports.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Reports</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {reports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}
      
      {/* Unit location section */}
      <UnitLocationSection unit={unit} unitId={id || ""} />
    </div>
  );
};

export default UnitDetails;
