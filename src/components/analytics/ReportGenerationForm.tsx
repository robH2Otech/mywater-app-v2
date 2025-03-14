
import { useState } from "react";
import { FormSubmitButton } from "@/components/shared/FormSubmitButton";
import { ReportFormContainer } from "@/components/analytics/ReportFormContainer";
import { handleReportGeneration } from "@/components/analytics/ReportGenerationHandler";

interface ReportGenerationFormProps {
  selectedUnit: string;
  onUnitChange: (unitId: string) => void;
  onReportGenerated: () => void;
}

export function ReportGenerationForm({ 
  selectedUnit, 
  onUnitChange, 
  onReportGenerated 
}: ReportGenerationFormProps) {
  const [reportType, setReportType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    await handleReportGeneration(
      selectedUnit,
      reportType,
      setIsGenerating,
      onReportGenerated
    );
  };

  return (
    <ReportFormContainer
      selectedUnit={selectedUnit}
      onUnitChange={onUnitChange}
      reportType={reportType}
      onReportTypeChange={setReportType}
    >
      <FormSubmitButton
        onClick={handleGenerateReport}
        isLoading={isGenerating}
        disabled={!selectedUnit || !reportType}
        label="Generate Report"
        loadingLabel="Generating..."
      />
    </ReportFormContainer>
  );
}
