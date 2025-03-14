
import { jsPDF } from "jspdf";

/**
 * Add footer to PDF document
 */
export function pdfAddFooter(doc: jsPDF): void {
  const generatedDate = new Date().toLocaleString();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(8);
  doc.text(`Generated on: ${generatedDate}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: "right" });
}
