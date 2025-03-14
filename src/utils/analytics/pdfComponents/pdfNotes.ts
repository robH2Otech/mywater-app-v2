
import { jsPDF } from "jspdf";
import { UnitData } from "@/types/analytics";

/**
 * Add notes section to PDF document (if available)
 */
export function pdfAddNotes(doc: jsPDF, unit: UnitData, yPos: number): number {
  if (!unit.notes) {
    return yPos; // Skip if no notes
  }
  
  doc.setFontSize(14);
  doc.text("Notes", 14, yPos + 10);
  doc.setFontSize(10);
  doc.text(unit.notes, 14, yPos + 20);
  
  return yPos + 30; // Approximate position after notes
}
