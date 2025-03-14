
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { ReportData, UnitData } from "@/types/analytics";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ReportVisual } from "./ReportVisual";
import { ReportEmptyState } from "./ReportEmptyState";
import { ReportListItem } from "./ReportListItem";
import { calculateMetricsFromMeasurements } from "@/utils/reportGenerator";
import { generateReportPDF } from "@/utils/analytics/pdfGenerator";
import { getDateRangeForReportType } from "@/utils/reportGenerator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ReportsListProps {
  reports: ReportData[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ReportsList({ reports, isLoading, onRefresh }: ReportsListProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [unitData, setUnitData] = useState<UnitData | null>(null);
  const [reportMetrics, setReportMetrics] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleDownloadReport = async (report: ReportData) => {
    try {
      setIsActionLoading(true);
      console.log("Downloading report:", report.id);
      
      // Ensure we have unit data
      let unitDataForPdf = await fetchUnitData(report.unit_id);
      
      // Generate PDF with the report data
      const { startDate, endDate } = getDateRangeForReportType(report.report_type);
      
      // Use stored metrics if available, otherwise calculate them
      const metrics = report.metrics || calculateMetricsFromMeasurements(report.measurements || []);
      
      // Generate and download PDF
      generateReportPDF(
        unitDataForPdf,
        report.report_type,
        metrics,
        startDate,
        endDate
      );

      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download report",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleViewReport = async (report: ReportData) => {
    setIsActionLoading(true);
    try {
      console.log("Opening report for viewing:", report);
      setSelectedReport(report);
      
      if (!report.unit_id) {
        throw new Error("Report missing unit ID");
      }
      
      // Fetch unit data
      const unitDataObj = await fetchUnitData(report.unit_id);
      setUnitData(unitDataObj);
      
      // Use stored metrics if available, otherwise calculate from measurements
      let metrics;
      if (report.metrics) {
        metrics = report.metrics;
        console.log("Using stored metrics:", metrics);
      } else {
        // Calculate metrics from measurements
        const measurements = report.measurements || [];
        console.log("Processing measurements:", measurements.length);
        metrics = calculateMetricsFromMeasurements(measurements);
        console.log("Calculated metrics:", metrics);
      }
      
      setReportMetrics(metrics);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Error loading report details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load report details",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Helper function to fetch unit data
  const fetchUnitData = async (unitId: string): Promise<UnitData> => {
    const unitDocRef = doc(db, "units", unitId);
    const unitSnapshot = await getDoc(unitDocRef);
    
    if (unitSnapshot.exists()) {
      return {
        id: unitSnapshot.id,
        ...unitSnapshot.data() as any
      };
    } else {
      console.warn("Unit data not found, using fallback");
      return { 
        id: unitId, 
        name: selectedReport?.unit_name || "Unknown Unit" 
      };
    }
  };

  if (reports.length === 0) {
    return <ReportEmptyState />;
  }

  return (
    <>
      <div className="space-y-4 mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Generated Reports</h2>
          <Button 
            onClick={onRefresh} 
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="grid gap-4">
          {reports.map((report) => (
            <ReportListItem
              key={report.id}
              report={report}
              onView={handleViewReport}
              onDownload={handleDownloadReport}
              isLoading={isActionLoading}
            />
          ))}
        </div>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-spotify-dark">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          
          {selectedReport && unitData && reportMetrics ? (
            <ReportVisual 
              unit={unitData} 
              reportType={selectedReport.report_type} 
              metrics={reportMetrics} 
            />
          ) : (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green"></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
