
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";
import { UnitData } from "@/types/analytics";
import { formatDateRange } from "./dateRangeUtils";
import { pdfAddHeader } from "./pdfComponents/pdfHeader";
import { pdfAddUnitInfo } from "./pdfComponents/pdfUnitInfo";
import { pdfAddMetrics } from "./pdfComponents/pdfMetrics";
import { pdfAddMeasurements } from "./pdfComponents/pdfMeasurements";
import { pdfAddMaintenance } from "./pdfComponents/pdfMaintenance";
import { pdfAddContacts } from "./pdfComponents/pdfContacts";
import { pdfAddNotes } from "./pdfComponents/pdfNotes";
import { pdfAddFooter } from "./pdfComponents/pdfFooter";

/**
 * Main function to generate PDF report
 */
export function generateReportPDF(unit: UnitData, reportType: string, metrics: any, startDate: Date, endDate: Date) {
  try {
    console.log("Generating PDF for report:", reportType);
    
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add report sections
    let yPos = pdfAddHeader(doc, unit, reportType, startDate, endDate);
    yPos = pdfAddUnitInfo(doc, unit, yPos);
    yPos = pdfAddMetrics(doc, metrics, yPos);
    yPos = pdfAddMeasurements(doc, metrics, yPos);
    yPos = pdfAddMaintenance(doc, unit, yPos);
    yPos = pdfAddContacts(doc, unit, yPos);
    yPos = pdfAddNotes(doc, unit, yPos);
    
    // Add footer
    pdfAddFooter(doc);
    
    // Save the PDF
    console.log("Saving PDF...");
    doc.save(`${reportType}-report-${unit.name || 'unit'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    console.log("PDF generated successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
