import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ReportData } from "@/types/analytics";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportVisual } from "./ReportVisual";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { calculateMetricsFromMeasurements } from "@/utils/reportGenerator";

interface ReportsListProps {
  reports: ReportData[];
}

export function ReportsList({ reports }: ReportsListProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [unitData, setUnitData] = useState<any>(null);
  const [reportMetrics, setReportMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadReport = async (reportId: string, content: string) => {
    try {
      console.log("Starting download for report:", reportId);
      
      // Create a Blob from the content
      const blob = new Blob([content], { type: 'text/plain' });
      
      // Create URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `report-${reportId}.txt`;
      
      // Append to body, click, and clean up
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
        console.log("Download link cleanup completed");
      }, 100);

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
    }
  };

  const handleViewReport = async (report: ReportData) => {
    setIsLoading(true);
    try {
      console.log("Loading report details for:", report.id);
      setSelectedReport(report);
      
      // Fetch unit data
      const unitDocRef = doc(db, "units", report.unit_id);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (unitSnapshot.exists()) {
        const unitDataObj = {
          id: unitSnapshot.id,
          ...unitSnapshot.data()
        };
        setUnitData(unitDataObj);
        
        // Calculate metrics from measurements
        const measurements = report.measurements || [];
        const metrics = calculateMetricsFromMeasurements(measurements);
        setReportMetrics(metrics);
        
        setIsViewDialogOpen(true);
      } else {
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
    return null;
  }

  return (
    <>
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Generated Reports</h2>
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="p-4 bg-spotify-darker">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white">
                    {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Generated on {new Date(report.created_at).toLocaleString()}
                  </p>
                  <div className="mt-2 text-sm text-gray-300 line-clamp-3 whitespace-pre-wrap">
                    {report.content}
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
                    onClick={() => handleDownloadReport(report.id, report.content)}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
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
