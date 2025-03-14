
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ReportData, UnitData } from "@/types/analytics";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportVisual } from "./ReportVisual";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { calculateMetricsFromMeasurements } from "@/utils/reportGenerator";
import { generateReportPDF } from "@/utils/analytics/pdfGenerator";
import { getDateRangeForReportType } from "@/utils/reportGenerator";

interface ReportsListProps {
  reports: ReportData[];
}

export function ReportsList({ reports }: ReportsListProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [unitData, setUnitData] = useState<UnitData | null>(null);
  const [reportMetrics, setReportMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadReport = async (report: ReportData) => {
    try {
      setIsLoading(true);
      // Ensure we have unit data
      if (!unitData && report.unit_id) {
        const unitDocRef = doc(db, "units", report.unit_id);
        const unitSnapshot = await getDoc(unitDocRef);
        
        if (unitSnapshot.exists()) {
          const fetchedUnitData: UnitData = {
            id: unitSnapshot.id,
            ...unitSnapshot.data() as any
          };
          setUnitData(fetchedUnitData);
        } else {
          throw new Error("Unit data not found");
        }
      }
      
      // Generate PDF with the report data
      const { startDate, endDate } = getDateRangeForReportType(report.report_type);
      
      // Use stored metrics if available, otherwise calculate them
      const metrics = report.metrics || calculateMetricsFromMeasurements(report.measurements || []);
      
      // Generate and download PDF
      generateReportPDF(
        unitData || { id: report.unit_id, name: report.unit_name || "Unknown Unit" },
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
      setIsLoading(false);
    }
  };

  const handleViewReport = async (report: ReportData) => {
    setIsLoading(true);
    try {
      console.log("Opening report for viewing:", report);
      setSelectedReport(report);
      
      // Fetch unit data if not already available
      if (!report.unit_id) {
        throw new Error("Report missing unit ID");
      }
      
      // Fetch unit data
      const unitDocRef = doc(db, "units", report.unit_id);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (unitSnapshot.exists()) {
        const unitDataObj: UnitData = {
          id: unitSnapshot.id,
          ...unitSnapshot.data() as any
        };
        console.log("Fetched unit data:", unitDataObj);
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
      } else {
        console.error("Unit data not found for unit ID:", report.unit_id);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unit data not found",
        });
      }
    } catch (error) {
      console.error("Error loading report details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load report details",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (reports.length === 0) {
    return (
      <Card className="p-6 mt-8 bg-spotify-darker">
        <div className="text-center text-gray-400">
          <p>No reports generated yet. Select a unit and report type, then click "Generate Report".</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Generated Reports</h2>
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="p-4 bg-spotify-darker">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="bg-spotify-accent p-2 rounded-md">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                      {report.unit_name ? ` - ${report.unit_name}` : ''}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Generated on {new Date(report.created_at).toLocaleString()}
                    </p>
                    <div className="mt-2 text-sm text-gray-300 line-clamp-2 whitespace-pre-wrap">
                      {report.content?.substring(0, 100)}...
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewReport(report)}
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport(report)}
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </Card>
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
