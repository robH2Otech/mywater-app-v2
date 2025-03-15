
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { UnitData, ReportData } from "@/types/analytics";
import { format } from "date-fns";
import { calculateMetricsFromMeasurements } from "./reportGenerator";
import { toast } from "@/components/ui/use-toast";

// Add type declaration for jsPDF with autoTable method
interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
  lastAutoTable: {
    finalY: number;
  };
}

/**
 * Generates and downloads a PDF report with visual elements
 */
export const generateVisualPDF = async (
  unit: UnitData,
  reportType: string,
  metrics: any,
  fileName?: string
): Promise<boolean> => {
  try {
    console.log("Generating visual PDF report");
    const { startDate, endDate } = getDateRangeForReportType(reportType);
    
    // Create a new jsPDF instance
    const pdfDoc = new jsPDF() as JsPDFWithAutoTable;
    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    
    // Add company logo/header
    pdfDoc.setFontSize(20);
    pdfDoc.setTextColor(0, 128, 0);
    pdfDoc.text("MYWATER Technologies", pageWidth / 2, 20, { align: "center" });
    
    // Add report title
    pdfDoc.setFontSize(16);
    pdfDoc.setTextColor(0, 0, 0);
    pdfDoc.text(`${reportType.toUpperCase()} REPORT: ${unit.name || ""}`, pageWidth / 2, 30, { align: "center" });
    
    // Add date range
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
    pdfDoc.setFontSize(10);
    
    const unitInfo = [
      ["Name", unit.name || "N/A"],
      ["Location", unit.location || "N/A"],
      ["Status", unit.status || "N/A"],
      ["Total Capacity", `${unit.total_volume || 0} m³`]
    ];
    
    pdfDoc.autoTable({
      startY: 55,
      head: [["Property", "Value"]],
      body: unitInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add performance metrics section
    let startY = pdfDoc.lastAutoTable.finalY + 10;
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
    startY = pdfDoc.lastAutoTable.finalY + 10;
    pdfDoc.setFontSize(14);
    pdfDoc.text("Daily Measurements", 14, startY);
    
    const dailyData = metrics.dailyData.map(day => [
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
    
    // Add maintenance information
    startY = pdfDoc.lastAutoTable.finalY + 10;
    pdfDoc.setFontSize(14);
    pdfDoc.text("Maintenance Information", 14, startY);
    
    const maintenanceInfo = [
      ["Last Maintenance", unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : "N/A"],
      ["Next Maintenance", unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : "N/A"]
    ];
    
    pdfDoc.autoTable({
      startY: startY + 5,
      head: [["Maintenance", "Date"]],
      body: maintenanceInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add contact information
    if (unit.contact_name || unit.contact_email || unit.contact_phone) {
      startY = pdfDoc.lastAutoTable.finalY + 10;
      pdfDoc.setFontSize(14);
      pdfDoc.text("Contact Information", 14, startY);
      
      const contactInfo = [
        ["Name", unit.contact_name || "N/A"],
        ["Email", unit.contact_email || "N/A"],
        ["Phone", unit.contact_phone || "N/A"]
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
    if (unit.notes) {
      startY = pdfDoc.lastAutoTable.finalY + 10;
      pdfDoc.setFontSize(14);
      pdfDoc.text("Notes", 14, startY);
      pdfDoc.setFontSize(10);
      pdfDoc.text(unit.notes, 14, startY + 10);
    }
    
    // Add footer with generation date
    const generatedDate = new Date().toLocaleString();
    pdfDoc.setFontSize(8);
    pdfDoc.text(`Generated on: ${generatedDate}`, pageWidth - 15, pdfDoc.internal.pageSize.getHeight() - 10, { align: "right" });
    
    // Generate the PDF as a blob and download it
    const pdfBlob = pdfDoc.output('blob');
    const defaultFileName = `${reportType}-report-${unit.name ? unit.name.replace(/\s+/g, '-').toLowerCase() : 'unit'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    // Create URL object from the blob
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    // Create and trigger download link
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = fileName || defaultFileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    }, 100);
    
    console.log("PDF generated and download triggered successfully");
    return true;
  } catch (error) {
    console.error("Error generating visual PDF:", error);
    return false;
  }
};

/**
 * Generates and downloads a text-based PDF report
 */
export const generateTextPDF = async (
  report: ReportData,
  unitData: UnitData
): Promise<boolean> => {
  try {
    console.log("Starting text-based PDF download for report:", report.id);
    
    // Create PDF document
    const pdfDoc = new jsPDF() as JsPDFWithAutoTable;
    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    
    // Add company logo/header
    pdfDoc.setFontSize(20);
    pdfDoc.setTextColor(0, 128, 0);
    pdfDoc.text("MYWATER Technologies", pageWidth / 2, 20, { align: "center" });
    
    // Add report title
    pdfDoc.setFontSize(16);
    pdfDoc.setTextColor(0, 0, 0);
    pdfDoc.text(`${report.report_type.toUpperCase()} REPORT: ${unitData.name || ""}`, pageWidth / 2, 30, { align: "center" });
    
    // Add generation date
    pdfDoc.setFontSize(12);
    pdfDoc.text(`Generated on: ${new Date(report.created_at).toLocaleDateString()}`, pageWidth / 2, 40, { align: "center" });
    
    // Add report content
    pdfDoc.setFontSize(10);
    pdfDoc.text("Report Summary:", 14, 50);
    
    // Format report content for PDF - replace units with m³
    const formattedContent = report.content.replace(/units/g, 'm³');
    
    // Split the content by line and add to PDF
    const contentLines = formattedContent.split('\n');
    let yPos = 55;
    const lineHeight = 5;
    
    contentLines.forEach(line => {
      pdfDoc.text(line, 14, yPos);
      yPos += lineHeight;
    });
    
    // Generate the PDF as a blob and download it
    const pdfBlob = pdfDoc.output('blob');
    const fileName = `${report.report_type}-report-${unitData.name ? unitData.name.replace(/\s+/g, '-').toLowerCase() : 'unit'}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Create URL object from the blob
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    // Create and trigger download link
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    }, 100);
    
    return true;
  } catch (error) {
    console.error("Error downloading text report:", error);
    return false;
  }
};

// Helper function to get date range based on report type - copied from reportGenerator.ts
const getDateRangeForReportType = (reportType: string): { startDate: Date, endDate: Date } => {
  const endDate = new Date();
  let startDate = new Date();
  
  switch(reportType) {
    case 'daily':
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 1);
      break;
    case 'weekly':
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'monthly':
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 30);
      break;
    case 'yearly':
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 365);
      break;
    default:
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 7); // Default to weekly
  }
  
  return { startDate, endDate };
};
