
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { ReportData, UnitData } from "@/types/analytics";
import { calculateMetricsFromMeasurements } from "@/utils/reportGenerator";
import { generatePDF } from "@/utils/pdfGenerator";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export function useReportOperations() {
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
      
      // Clean up unit name for filename and use ISO date format
      const sanitizedUnitName = unitDataObj.name?.replace(/\s+/g, '-').toLowerCase() || 'unit';
      const fileName = `${report.report_type}-report-${sanitizedUnitName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Generate and download the PDF
      await generatePDF(report, unitDataObj, metrics, fileName);
      
      toast({
        title: "Success",
        description: "PDF report downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download PDF. Please try again.",
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

  return {
    isPreviewDialogOpen,
    setIsPreviewDialogOpen,
    selectedReport,
    unitData,
    reportMetrics,
    isLoading,
    reportToDelete,
    setReportToDelete,
    handleDownloadReport,
    handlePreviewReport
  };
}
