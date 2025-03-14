
import { ReportData } from "@/types/analytics";
import { generatePDF } from "@/utils/pdfGenerator";
import { getDateRangeForReportType } from "@/utils/reportGenerator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export function getReportTitle(reportType: string): string {
  if (!reportType) return "Report";
  
  return reportType.charAt(0).toUpperCase() + reportType.slice(1) + " Report";
}

export async function downloadReportAsTxt(report: ReportData): Promise<void> {
  try {
    // Get unit data
    const unitDocRef = doc(db, "units", report.unit_id);
    const unitSnapshot = await getDoc(unitDocRef);
    
    if (!unitSnapshot.exists()) {
      throw new Error("Unit data not found");
    }
    
    const unitData = {
      id: unitSnapshot.id,
      name: unitSnapshot.data().name || "Unknown Unit",
      ...unitSnapshot.data()
    };
    
    // Get date range
    const { startDate, endDate } = getDateRangeForReportType(report.report_type);
    
    // Generate PDF directly instead of TXT
    await generatePDF(
      unitData, 
      report.report_type, 
      report.metrics || {}, 
      startDate, 
      endDate
    );
    
  } catch (error) {
    console.error("Error downloading report:", error);
    throw error;
  }
}
