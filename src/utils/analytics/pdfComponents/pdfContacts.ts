
import { jsPDF } from "jspdf";
import { UnitData } from "@/types/analytics";

/**
 * Add contact information section to PDF document (if available)
 */
export function pdfAddContacts(doc: jsPDF, unit: UnitData, yPos: number): number {
  if (!unit.contact_name && !unit.contact_email && !unit.contact_phone) {
    return yPos; // Skip if no contact info
  }
  
  doc.setFontSize(14);
  doc.text("Contact Information", 14, yPos + 10);
  
  const contactInfo = [
    ["Name", unit.contact_name || "N/A"],
    ["Email", unit.contact_email || "N/A"],
    ["Phone", unit.contact_phone || "N/A"]
  ];
  
  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    startY: yPos + 15,
    head: [["Contact", "Details"]],
    body: contactInfo,
    theme: 'grid',
    headStyles: { fillColor: [0, 150, 0] }
  });
  
  return doc.lastAutoTable?.finalY || (yPos + 15);
}
