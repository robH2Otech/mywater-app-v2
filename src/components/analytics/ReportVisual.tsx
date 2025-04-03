
import { UnitData } from "@/types/analytics";
import { ReportChart } from "./ReportChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { getDateRangeForReportType } from "@/utils/reportGenerator";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDecimal } from "@/utils/measurements/formatUtils";

// Import our components
import { ReportSummaryCard } from "./reports/ReportSummaryCard";
import { UnitStatusCard } from "./reports/UnitStatusCard";
import { DailyMeasurementsTable } from "./reports/DailyMeasurementsTable";
import { NoDataCard } from "./reports/NoDataCard";

// Import PDF generation utilities from the refactored files
import { generateVisualPDF, generateTabularPDF } from "./pdf/PDFGenerator";

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
  const isMobile = useIsMobile();
  const { startDate, endDate } = getDateRangeForReportType(reportType);
  
  // Ensure all numeric values are properly formatted with 2 decimal places
  const formattedMetrics = {
    ...metrics,
    totalVolume: Number(formatDecimal(metrics.totalVolume)),
    avgVolume: Number(formatDecimal(metrics.avgVolume)),
    maxVolume: Number(formatDecimal(metrics.maxVolume)),
    avgTemperature: Number(formatDecimal(metrics.avgTemperature)),
    totalUvcHours: Number(formatDecimal(metrics.totalUvcHours)),
  };
  
  // Ensure unit data is formatted correctly with 2 decimal places
  const formattedUnit = {
    ...unit,
    total_volume: typeof unit.total_volume === 'number' 
      ? Number(formatDecimal(unit.total_volume)) 
      : Number(formatDecimal(unit.total_volume as string || '0')),
    uvc_hours: typeof unit.uvc_hours === 'number' 
      ? Number(formatDecimal(unit.uvc_hours)) 
      : Number(formatDecimal(unit.uvc_hours as string || '0')),
  };
  
  const handleGenerateVisualPDF = async () => {
    try {
      console.log("Starting visual PDF report generation...");
      
      // Find the report container element
      const reportContainer = document.querySelector('.report-container') as HTMLElement;
      if (!reportContainer) {
        throw new Error("Report container element not found");
      }
      
      await generateVisualPDF(reportContainer, formattedUnit, reportType);
    } catch (error) {
      console.error("Error generating visual PDF:", error);
      
      toast({
        variant: "destructive",
        title: "FAILED TO DOWNLOAD REPORT",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  };
  
  const handleGenerateTabularPDF = () => {
    try {
      generateTabularPDF(formattedUnit, reportType, formattedMetrics, startDate, endDate);
    } catch (error) {
      console.error("Error generating tabular PDF:", error);
      
      toast({
        variant: "destructive",
        title: "FAILED TO DOWNLOAD REPORT",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  };
  
  // If no data available
  if (!metrics.dailyData.length) {
    return <NoDataCard />;
  }
  
  return (
    <div className="space-y-6 report-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold">
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report: {unit.name}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={handleGenerateVisualPDF}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportSummaryCard 
          totalVolume={formattedMetrics.totalVolume}
          avgTemperature={formattedMetrics.avgTemperature}
          totalUvcHours={formattedMetrics.totalUvcHours}
          startDate={startDate}
          endDate={endDate}
        />
        
        <UnitStatusCard unit={formattedUnit} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportChart 
          data={metrics.dailyData} 
          title="Daily Water Volume" 
          type="volume" 
          unit="m³"
        />
        
        <ReportChart 
          data={metrics.dailyData} 
          title="Temperature Trends" 
          type="temperature" 
        />
        
        <ReportChart 
          data={metrics.dailyData} 
          title="UVC Hours" 
          type="uvc" 
        />
      </div>
      
      <DailyMeasurementsTable dailyData={metrics.dailyData} unitType={unit.unit_type} />
    </div>
  );
}

