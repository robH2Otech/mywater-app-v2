
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { UnitData } from "@/types/analytics";
import { toast } from "@/components/ui/use-toast";
import { ReportMetrics } from "./types";
import {
  addUnitInfoSection,
  addPerformanceMetricsSection,
  addDailyMeasurementsSection,
  addMaintenanceSection,
  addContactSection
} from "./sectionGenerators";

/**
 * Generates a tabular PDF report with detailed measurement data
 */
export const generateTabularPDF = (
  unit: UnitData,
  reportType: string,
  metrics: ReportMetrics,
  startDate: Date,
  endDate: Date
): string => {
  try {
    console.log("Starting PDF report generation...");
    console.log("Input data:", { unit, reportType, metrics });
    
    // Create a new jsPDF instance
    console.log("Initializing jsPDF...");
    const doc = new jsPDF();
    console.log("jsPDF initialized successfully");
    
    const pageWidth = doc.internal.pageSize.getWidth();
    console.log("Page width:", pageWidth);
    
    // Add company logo/header
    console.log("Adding company header...");
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 0);
    doc.text("MYWATER Technologies", pageWidth / 2, 20, { align: "center" });
    
    // Add report title
    console.log("Adding report title...");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${reportType.toUpperCase()} REPORT: ${unit.name || ""}`, pageWidth / 2, 30, { align: "center" });
    
    // Add date range
    console.log("Adding date range...");
    doc.setFontSize(12);
    doc.text(
      `Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`,
      pageWidth / 2, 
      40, 
      { align: "center" }
    );
    
    // Add various sections
    let currentY = 50;
    currentY = addUnitInfoSection(doc, unit, currentY);
    currentY = addPerformanceMetricsSection(doc, metrics, currentY);
    currentY = addDailyMeasurementsSection(doc, metrics, currentY, reportType, unit.name || "");
    currentY = addMaintenanceSection(doc, unit, currentY);
    currentY = addContactSection(doc, unit, currentY);
    
    // Add notes if available
    console.log("Adding notes...");
    if (unit.notes) {
      doc.setFontSize(14);
      doc.text("Notes", 14, currentY);
      doc.setFontSize(10);
      
      // Split notes into multiple lines if needed
      const notesLines = doc.splitTextToSize(unit.notes, pageWidth - 28);
      doc.text(notesLines, 14, currentY + 10);
    }
    
    // Add footer with generation date
    console.log("Adding footer...");
    const generatedDate = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.text(`Generated on: ${generatedDate}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    
    // Save the PDF
    console.log("Saving PDF...");
    const filename = `${reportType}-report-${unit.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    try {
      doc.save(filename);
      console.log("PDF saved successfully:", filename);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
      
      return `Successfully generated ${filename}`;
    } catch (saveError) {
      console.error("Error saving PDF:", saveError);
      throw new Error(`Failed to save PDF: ${saveError}`);
    }
  } catch (error) {
    // Log the full error
    console.error("Error generating PDF:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace available"
    });
    
    // Show error toast to the user
    toast({
      variant: "destructive",
      title: "FAILED TO DOWNLOAD REPORT",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
    });
    
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
};
