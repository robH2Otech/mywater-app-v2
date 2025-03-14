
import { jsPDF } from "jspdf";
import { UnitData } from "@/types/analytics";

/**
 * Add unit information section to PDF document
 */
export function pdfAddUnitInfo(doc: jsPDF, unit: UnitData, yPos: number): number {
  doc.setFontSize(14);
  doc.text("Unit Information", 14, yPos);
  doc.setFontSize(10);
  
  const unitInfo = [
    ["Name", unit.name || "N/A"],
    ["Location", unit.location || "N/A"],
    ["Status", unit.status || "N/A"],
    ["Total Capacity", `${unit.total_volume || 0} units`]
  ];
  
  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    startY: yPos + 5,
    head: [["Property", "Value"]],
    body: unitInfo,
    theme: 'grid',
    headStyles: { fillColor: [0, 150, 0] }
  });
  
  return doc.lastAutoTable?.finalY || (yPos + 5);
}
