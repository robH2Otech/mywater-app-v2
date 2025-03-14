
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportData } from "@/types/analytics";
import { ReportVisual } from "./ReportVisual";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { toast } from "@/hooks/use-toast";
import { calculateMetricsFromMeasurements } from "@/utils/reportGenerator";
import { getReportTitle } from "@/utils/reportUtils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generatePDF } from "@/utils/pdfGenerator";
import { getDateRangeForReportType } from "@/utils/reportGenerator";

interface ReportDetailDialogProps {
  report: ReportData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDetailDialog({ report, open, onOpenChange }: ReportDetailDialogProps) {
  const [unitData, setUnitData] = useState<any>(null);
  const [reportMetrics, setReportMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function loadReportDetails() {
      if (!open || !report) return;
      
      setIsLoading(true);
      try {
        // Fetch unit data
        const unitDocRef = doc(db, "units", report.unit_id);
        const unitSnapshot = await getDoc(unitDocRef);
        
        if (unitSnapshot.exists()) {
          const unitDataObj = {
            id: unitSnapshot.id,
            name: unitSnapshot.data().name || 'Unknown Unit',
            ...unitSnapshot.data()
          };
          setUnitData(unitDataObj);
          
          // Use pre-calculated metrics if available, otherwise calculate from measurements
          if (report.metrics) {
            setReportMetrics(report.metrics);
          } else {
            // Calculate metrics from measurements
            const measurements = report.measurements || [];
            const metrics = calculateMetricsFromMeasurements(measurements);
            setReportMetrics(metrics);
          }
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
    }

    loadReportDetails();
  }, [open, report]);

  const handleDownloadPDF = async () => {
    if (!unitData || !reportMetrics || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const { startDate, endDate } = getDateRangeForReportType(report.report_type);
      
      console.log("Generating detailed PDF from dialog view");
      const pdfBlob = await generatePDF(
        unitData,
        report.report_type,
        reportMetrics,
        startDate,
        endDate
      );
      
      if (!pdfBlob) {
        throw new Error("Failed to generate PDF blob");
      }
      
      console.log("PDF Blob created, size:", pdfBlob.size, "bytes");
      
      // Create filename
      const fileName = `${unitData.name}_${report.report_type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create URL for download using a simpler approach
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download PDF. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] overflow-y-auto bg-spotify-dark">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>
            {unitData?.name || "Unit"} - {getReportTitle(report?.report_type)}
          </DialogTitle>
          <Button
            onClick={handleDownloadPDF}
            disabled={isLoading || isDownloading || !unitData}
            className="bg-spotify-green hover:bg-spotify-green/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download PDF"}
          </Button>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green"></div>
          </div>
        ) : unitData && reportMetrics ? (
          <ReportVisual 
            unit={unitData} 
            reportType={report.report_type} 
            metrics={reportMetrics} 
          />
        ) : (
          <div className="p-4 text-center text-red-400">
            Unable to load report details. Please try again.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
