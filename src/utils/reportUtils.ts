
import { ReportData } from "@/types/analytics";
import { generatePDF } from "@/utils/pdfGenerator";
import { getDateRangeForReportType } from "@/utils/reportGenerator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { toast } from "@/components/ui/use-toast";

export function getReportTitle(reportType: string): string {
  if (!reportType) return "Report";
  
  return reportType.charAt(0).toUpperCase() + reportType.slice(1) + " Report";
}

export async function downloadReportAsTxt(report: ReportData): Promise<void> {
  // Legacy function maintained for compatibility
  try {
    await downloadReportAsPdf(report);
  } catch (error) {
    console.error("Error in legacy download function:", error);
    throw error;
  }
}

export async function downloadReportAsPdf(report: ReportData): Promise<void> {
  try {
    console.log("Starting PDF download for report:", report.id);
    
    // Get unit data
    const unitDocRef = doc(db, "units", report.unit_id);
    const unitSnapshot = await getDoc(unitDocRef);
    
    if (!unitSnapshot.exists()) {
      console.error("Unit data not found for:", report.unit_id);
      throw new Error("Unit data not found");
    }
    
    const unitData = {
      id: unitSnapshot.id,
      name: unitSnapshot.data().name || "Unknown Unit",
      ...unitSnapshot.data()
    };
    
    console.log("Unit data retrieved:", unitData.name);
    
    // Get date range
    const { startDate, endDate } = getDateRangeForReportType(report.report_type);
    
    // Generate PDF and get blob
    const pdfBlob = await generatePDF(
      unitData, 
      report.report_type, 
      report.metrics || {}, 
      startDate, 
      endDate
    );
    
    // Create a download link and trigger download
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(pdfBlob);
    downloadLink.href = url;
    downloadLink.download = `${unitData.name}_${report.report_type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      console.log("PDF download complete");
    }, 100);
    
    toast({
      title: "Success",
      description: "PDF downloaded successfully",
    });
    
  } catch (error) {
    console.error("Error downloading report:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to download report as PDF",
    });
    throw error;
  }
}
