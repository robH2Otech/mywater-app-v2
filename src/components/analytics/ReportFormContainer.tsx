
import { ReactNode } from "react";
import { UnitSelector } from "@/components/analytics/UnitSelector";
import { ReportTypeSelector } from "@/components/analytics/ReportTypeSelector";

interface ReportFormContainerProps {
  selectedUnit: string;
  onUnitChange: (unitId: string) => void;
  reportType: string;
  onReportTypeChange: (type: string) => void;
  children?: ReactNode;
}

export function ReportFormContainer({
  selectedUnit,
  onUnitChange,
  reportType,
  onReportTypeChange,
  children,
}: ReportFormContainerProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <UnitSelector value={selectedUnit} onChange={onUnitChange} />
        <ReportTypeSelector value={reportType} onChange={onReportTypeChange} />
      </div>
      {children}
    </div>
  );
}
