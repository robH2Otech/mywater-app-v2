import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ReportData, UnitData } from "@/types/analytics";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportVisual } from "./ReportVisual";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { calculateMetricsFromMeasurements } from "@/utils/reportGenerator";
import { generatePDF } from "@/utils/pdfGenerator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReportsListProps {
  reports: ReportData[];
  onDeleteReport?: (reportId: string) => void;
  isDeletingReport?: boolean;
}

export function ReportsList({ reports, onDeleteReport, isDeletingReport = false }: ReportsListProps) {
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [unitData, setUnitData] = useState<UnitData | null>(null);
  const [reportMetrics, setReportMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const handleDownloadReport = async (report: ReportData) => {
    try {
      console.log("Starting download for report:", report.id);
      setIsLoading(true);
      
      // Fetch unit data
      const unitDocRef = doc(db, "units", report.unit_id);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (!unitSnapshot.exists()) {
        throw new Error("Unit data not found");
      }
      
      const unitDataObj = {
        id: unitSnapshot.id,
        ...unitSnapshot.data()
      } as UnitData;
      
      // Calculate metrics from measurements
      const measurements = report.measurements || [];
      const metrics = calculateMetricsFromMeasurements(measurements);
      
      // Generate PDF using the utility function with a unique filename
      const fileName = `${report.report_type}-report-${unitDataObj.name || 'unit'}-${new Date().toISOString().slice(0,10)}.pdf`;
      await generatePDF(report, unitDataObj, metrics, fileName);
      
      toast({
        title: "Success",
        description: "PDF report generated successfully",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewReport = async (report: ReportData) => {
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
        } as UnitData;
        setUnitData(unitDataObj);
        
        // Calculate metrics from measurements
        const measurements = report.measurements || [];
        const metrics = calculateMetricsFromMeasurements(measurements);
        setReportMetrics(metrics);
        
        setIsPreviewDialogOpen(true);
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

  const handleDeleteClick = (reportId: string) => {
    setReportToDelete(reportId);
  };

  const confirmDelete = () => {
    if (reportToDelete && onDeleteReport) {
      onDeleteReport(reportToDelete);
      setReportToDelete(null);
    }
  };

  const cancelDelete = () => {
    setReportToDelete(null);
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
                    {report.content.replace(/units/g, 'm³')}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewReport(report)}
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport(report)}
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(report.id)}
                    disabled={isLoading || isDeletingReport}
                    className="flex items-center text-red-500 hover:text-red-700 hover:bg-red-100/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-spotify-dark">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          
          {selectedReport && unitData && reportMetrics ? (
            <ReportVisual 
              unit={unitData} 
              reportType={selectedReport.report_type} 
              metrics={reportMetrics} 
              reportId={selectedReport.id}
            />
          ) : (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green"></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent className="bg-spotify-dark border-spotify-accent">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} className="bg-spotify-darker text-white border-spotify-accent hover:bg-spotify-darker/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeletingReport}
            >
              {isDeletingReport ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
