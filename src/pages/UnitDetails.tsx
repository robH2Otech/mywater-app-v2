import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitLoading } from "@/components/units/UnitLoading";
import { UnitError } from "@/components/units/UnitError";
import { UnitDetailsHeader } from "@/components/units/UnitDetailsHeader";
import { UnitDetailsCard } from "@/components/units/UnitDetailsCard";
import { UnitLocationSection } from "@/components/units/UnitLocationSection";
import { ReportCard } from "@/components/analytics/ReportCard";
import { useReports } from "@/hooks/useReports";
import { UnitData } from "@/types/analytics";
import { UnitMlDetails } from "@/components/units/UnitMlDetails";

const UnitDetails = () => {
  const { id } = useParams();
  const { data: unit, isLoading, error } = useQuery({
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
  
  const { data: reports = [] } = useReports(id || "");

  if (isLoading) {
    return <UnitLoading />;
  }

  if (error || !unit) {
    return <UnitError id={id} error={error} />;
  }

  return (
    <div className="space-y-6 pb-6">
      <UnitDetailsHeader unit={unit} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <UnitDetailsCard unit={unit} className="xl:col-span-1" />
        <UnitMlDetails unit={unit} className="xl:col-span-2" />
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
      <UnitLocationSection unitId={id} />
    </div>
  );
};

export default UnitDetails;
