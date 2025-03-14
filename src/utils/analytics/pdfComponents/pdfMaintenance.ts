
import { jsPDF } from "jspdf";
import { UnitData } from "@/types/analytics";

/**
 * Add maintenance information section to PDF document
 */
export function pdfAddMaintenance(doc: jsPDF, unit: UnitData, yPos: number): number {
  doc.setFontSize(14);
  doc.text("Maintenance Information", 14, yPos + 10);
  
  const maintenanceInfo = [
    ["Last Maintenance", unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : "N/A"],
    ["Next Maintenance", unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : "N/A"]
  ];
  
  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    startY: yPos + 15,
    head: [["Maintenance", "Date"]],
    body: maintenanceInfo,
    theme: 'grid',
    headStyles: { fillColor: [0, 150, 0] }
  });
  
  return doc.lastAutoTable?.finalY || (yPos + 15);
}
