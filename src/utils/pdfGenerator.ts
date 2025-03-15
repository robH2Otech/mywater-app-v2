
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { ReportData, UnitData } from "@/types/analytics";
import { format } from "date-fns";

// Add type declaration for jsPDF with autoTable method
interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
  lastAutoTable: {
    finalY: number;
  };
}

/**
 * Generates and downloads a PDF report
 */
export const generatePDF = async (
  report: ReportData, 
  unitData: UnitData, 
  metrics: any, 
  fileName: string
) => {
  console.log("Generating PDF for report:", report.id);
  
  try {
    // Create a new jsPDF instance
    const pdfDoc = new jsPDF({ orientation: "portrait" }) as JsPDFWithAutoTable;
    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    
    // Add company logo/header
    pdfDoc.setFontSize(20);
    pdfDoc.setTextColor(0, 128, 0);
    pdfDoc.text("MYWATER Technologies", pageWidth / 2, 20, { align: "center" });
    
    // Add report title
    pdfDoc.setFontSize(16);
    pdfDoc.setTextColor(0, 0, 0);
    pdfDoc.text(`${report.report_type.toUpperCase()} REPORT: ${unitData.name || ""}`, pageWidth / 2, 30, { align: "center" });
    
    // Add date range
    const { startDate, endDate } = getDateRangeFromTimestamp(report.created_at);
    pdfDoc.setFontSize(12);
    pdfDoc.text(
      `Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`,
      pageWidth / 2, 
      40, 
      { align: "center" }
    );
    
    // Add unit information section
    pdfDoc.setFontSize(14);
    pdfDoc.text("Unit Information", 14, 50);
    
    const unitInfo = [
      ["Name", unitData.name || "N/A"],
      ["Location", unitData.location || "N/A"],
      ["Status", unitData.status || "N/A"],
      ["Total Capacity", `${unitData.total_volume || 0} m³`]
    ];
    
    pdfDoc.autoTable({
      startY: 55,
      head: [["Property", "Value"]],
      body: unitInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add performance metrics section
    let startY = pdfDoc.lastAutoTable?.finalY + 10 || 100;
    pdfDoc.setFontSize(14);
    pdfDoc.text("Performance Metrics", 14, startY);
    
    const performanceMetrics = [
      ["Total Volume Processed", `${metrics.totalVolume.toFixed(2)} m³`],
      ["Average Daily Volume", `${metrics.avgVolume.toFixed(2)} m³`],
      ["Maximum Daily Volume", `${metrics.maxVolume.toFixed(2)} m³`],
      ["Average Temperature", `${metrics.avgTemperature.toFixed(2)} °C`],
      ["Total UVC Hours", `${metrics.totalUvcHours.toFixed(2)} hours`]
    ];
    
    pdfDoc.autoTable({
      startY: startY + 5,
      head: [["Metric", "Value"]],
      body: performanceMetrics,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add daily data table
    if (metrics.dailyData && metrics.dailyData.length > 0) {
      startY = pdfDoc.lastAutoTable?.finalY + 10 || 150;
      pdfDoc.setFontSize(14);
      pdfDoc.text("Daily Measurements", 14, startY);
      
      const dailyData = metrics.dailyData.map((day: any) => [
        typeof day.date === 'string' ? new Date(day.date).toLocaleDateString() : 'N/A',
        `${day.volume.toFixed(2)} m³`,
        `${day.avgTemperature.toFixed(2)} °C`,
        `${day.uvcHours.toFixed(2)} hours`
      ]);
      
      pdfDoc.autoTable({
        startY: startY + 5,
        head: [["Date", "Volume", "Avg. Temperature", "UVC Hours"]],
        body: dailyData,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
    }
    
    // Add maintenance information
    startY = pdfDoc.lastAutoTable?.finalY + 10 || 200;
    pdfDoc.setFontSize(14);
    pdfDoc.text("Maintenance Information", 14, startY);
    
    const maintenanceInfo = [
      ["Last Maintenance", unitData.last_maintenance ? new Date(unitData.last_maintenance).toLocaleDateString() : "N/A"],
      ["Next Maintenance", unitData.next_maintenance ? new Date(unitData.next_maintenance).toLocaleDateString() : "N/A"]
    ];
    
    pdfDoc.autoTable({
      startY: startY + 5,
      head: [["Maintenance", "Date"]],
      body: maintenanceInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add contact information
    if (unitData.contact_name || unitData.contact_email || unitData.contact_phone) {
      startY = pdfDoc.lastAutoTable?.finalY + 10 || 250;
      pdfDoc.setFontSize(14);
      pdfDoc.text("Contact Information", 14, startY);
      
      const contactInfo = [
        ["Name", unitData.contact_name || "N/A"],
        ["Email", unitData.contact_email || "N/A"],
        ["Phone", unitData.contact_phone || "N/A"]
      ];
      
      pdfDoc.autoTable({
        startY: startY + 5,
        head: [["Contact", "Details"]],
        body: contactInfo,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
    }
    
    // Add notes if available
    if (unitData.notes) {
      startY = pdfDoc.lastAutoTable?.finalY + 10 || 270;
      pdfDoc.setFontSize(14);
      pdfDoc.text("Notes", 14, startY);
      pdfDoc.setFontSize(10);
      pdfDoc.text(unitData.notes, 14, startY + 10);
    }
    
    // Add footer with generation date
    const generatedDate = new Date().toLocaleString();
    pdfDoc.setFontSize(8);
    pdfDoc.text(`Generated on: ${generatedDate}`, pageWidth - 15, pdfDoc.internal.pageSize.getHeight() - 10, { align: "right" });
    
    // Use the reliable direct save method
    pdfDoc.save(fileName);
    
    console.log("PDF generated and downloaded successfully");
    return true;
  } catch (error) {
    console.error("Error in PDF generation:", error);
    throw error;
  }
};

/**
 * Helper function to get date range from timestamp
 */
function getDateRangeFromTimestamp(timestamp: string): { startDate: Date, endDate: Date } {
  const endDate = new Date(timestamp);
  let startDate = new Date(timestamp);
  
  // Default to 1 day before for daily reports
  startDate.setDate(startDate.getDate() - 1);
  
  return { startDate, endDate };
}
