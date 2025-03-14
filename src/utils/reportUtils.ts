
import { ReportData } from "@/types/analytics";
import { generatePDF } from "@/utils/pdfGenerator";
import { getDateRangeForReportType } from "@/utils/reportGenerator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { toast } from "@/hooks/use-toast";

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
    
    // Use metrics from report if available, otherwise use empty default metrics
    const metrics = report.metrics || {
      totalVolume: 0,
      avgVolume: 0,
      maxVolume: 0,
      avgTemperature: 0,
      totalUvcHours: 0,
      dailyData: []
    };
    
    // Generate PDF and get blob
    console.log("Calling generatePDF function");
    const pdfBlob = await generatePDF(
      unitData, 
      report.report_type, 
      metrics, 
      startDate, 
      endDate
    );
    
    if (!pdfBlob) {
      console.error("PDF generation failed - blob is null or undefined");
      throw new Error("Failed to generate PDF blob");
    }
    
    console.log("PDF Blob created, size:", pdfBlob.size, "bytes");
    
    // Create a blob URL and use it to trigger download
    const fileName = `${unitData.name}_${report.report_type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log("Prepared filename:", fileName);
    
    // Create a download link
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    
    // Trigger the download
    console.log("Triggering download...");
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log("Download initiated successfully");
    
    toast({
      title: "Success",
      description: "Report download started",
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
