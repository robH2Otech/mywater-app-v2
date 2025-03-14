
import { UnitData } from "@/types/analytics";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getDateRangeForReportType } from "@/utils/reportGenerator";
import { generateReportPDF } from "@/utils/analytics/pdfGenerator";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { ReportChartsSection } from "./ReportChartsSection";
import { ReportMeasurementsTable } from "./ReportMeasurementsTable";
import { ReportNoData } from "./ReportNoData";
import { formatDateRange } from "@/utils/reportGenerator";

interface ReportVisualProps {
  unit: UnitData;
  reportType: string;
  metrics: {
    totalVolume: number;
    avgVolume: number;
    maxVolume: number;
    avgTemperature: number;
    totalUvcHours: number;
    dailyData: any[];
  };
}

export function ReportVisual({ unit, reportType, metrics }: ReportVisualProps) {
  const { startDate, endDate } = getDateRangeForReportType(reportType);
  
  const handleGeneratePDF = () => {
    console.log("Generating PDF with data:", { unit, reportType, metrics });
    generateReportPDF(unit, reportType, metrics, startDate, endDate);
  };
  
  // If no data available
  if (!metrics || !metrics.dailyData || metrics.dailyData.length === 0) {
    return <ReportNoData />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report: {unit.name}
          </h2>
          <p className="text-sm text-gray-400">
            {formatDateRange(startDate, endDate)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGeneratePDF}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <ReportSummaryCards 
        unit={unit} 
        metrics={metrics} 
        startDate={startDate} 
        endDate={endDate} 
      />
      
      <ReportChartsSection dailyData={metrics.dailyData} />
      
      <ReportMeasurementsTable dailyData={metrics.dailyData} />
    </div>
  );
}
