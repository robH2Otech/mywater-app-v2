
import { jsPDF } from "jspdf";
import { UnitData } from "@/types/analytics";
import { formatDateRange } from "../dateRangeUtils";

/**
 * Add header section to PDF document
 */
export function pdfAddHeader(doc: jsPDF, unit: UnitData, reportType: string, startDate: Date, endDate: Date): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add company logo/header
  doc.setFontSize(20);
  doc.setTextColor(0, 128, 0);
  doc.text("MYWATER Technologies", pageWidth / 2, 20, { align: "center" });
  
  // Add report title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${reportType.toUpperCase()} REPORT: ${unit.name || ""}`, pageWidth / 2, 30, { align: "center" });
  
  // Add date range
  doc.setFontSize(12);
  doc.text(
    `Period: ${formatDateRange(startDate, endDate)}`,
    pageWidth / 2, 
    40, 
    { align: "center" }
  );
  
  return 50; // Return y-position after header
}
