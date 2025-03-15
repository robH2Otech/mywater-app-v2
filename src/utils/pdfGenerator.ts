
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";
import { UnitData } from "@/types/analytics";
import { toast } from "@/components/ui/use-toast";

// Add type declaration for jsPDF with autoTable method
interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable: {
    finalY: number;
  };
}

/**
 * Generate and download a PDF report
 */
export const generatePDFReport = (
  unit: UnitData,
  reportType: string,
  metrics: {
    totalVolume: number;
    avgVolume: number;
    maxVolume: number;
    avgTemperature: number;
    totalUvcHours: number;
    dailyData: any[];
  },
  startDate: Date,
  endDate: Date
): void => {
  try {
    console.log("Generating PDF report for unit:", unit.name);
    
    // Create a new jsPDF instance
    const doc = new jsPDF() as JsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 0);
    doc.text("MYWATER Technologies", pageWidth / 2, 20, { align: "center" });
    
    // Add report title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${reportType.toUpperCase()} REPORT: ${unit.name || ""}`, pageWidth / 2, 30, { align: "center" });
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy')}`, pageWidth / 2, 40, { align: "center" });
    
    // Add report summary
    doc.setFontSize(14);
    doc.text("Report Summary", 14, 50);
    doc.setFontSize(10);
    
    const reportSummary = [
      [`Report Type: ${reportType.toUpperCase()}`],
      [`Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`]
    ];
    
    doc.autoTable({
      startY: 55,
      body: reportSummary,
      theme: 'plain',
      styles: { fontSize: 10 }
    });
    
    // Add unit information section
    let startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Unit Information", 14, startY);
    
    const unitInfo = [
      ["Name", unit.name || "N/A"],
      ["Location", unit.location || "N/A"],
      ["Status", unit.status || "N/A"],
      ["Total Capacity", `${unit.total_volume || 0} m³`]
    ];
    
    doc.autoTable({
      startY: startY + 5,
      head: [["Property", "Value"]],
      body: unitInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add performance metrics section
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Performance Metrics", 14, startY);
    
    const performanceMetrics = [
      ["Total Volume Processed", `${metrics.totalVolume.toFixed(2)} m³`],
      ["Average Daily Volume", `${metrics.avgVolume.toFixed(2)} m³`],
      ["Maximum Daily Volume", `${metrics.maxVolume.toFixed(2)} m³`],
      ["Average Temperature", `${metrics.avgTemperature.toFixed(2)} °C`],
      ["Total UVC Hours", `${metrics.totalUvcHours.toFixed(2)} hours`]
    ];
    
    doc.autoTable({
      startY: startY + 5,
      head: [["Metric", "Value"]],
      body: performanceMetrics,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add daily data table if available
    if (metrics.dailyData && metrics.dailyData.length > 0) {
      startY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Daily Measurements", 14, startY);
      
      const dailyData = metrics.dailyData.map(day => [
        new Date(day.date).toLocaleDateString(),
        `${day.volume.toFixed(2)} m³`,
        `${day.avgTemperature.toFixed(2)} °C`,
        `${day.uvcHours.toFixed(2)} hours`
      ]);
      
      doc.autoTable({
        startY: startY + 5,
        head: [["Date", "Volume", "Avg. Temperature", "UVC Hours"]],
        body: dailyData,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
    }
    
    // Add maintenance information
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Maintenance Information", 14, startY);
    
    const maintenanceInfo = [
      ["Last Maintenance", unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : "N/A"],
      ["Next Maintenance", unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : "N/A"]
    ];
    
    doc.autoTable({
      startY: startY + 5,
      head: [["Maintenance", "Date"]],
      body: maintenanceInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add contact information if available
    if (unit.contact_name || unit.contact_email || unit.contact_phone) {
      startY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Contact Information", 14, startY);
      
      const contactInfo = [
        ["Name", unit.contact_name || "N/A"],
        ["Email", unit.contact_email || "N/A"],
        ["Phone", unit.contact_phone || "N/A"]
      ];
      
      doc.autoTable({
        startY: startY + 5,
        head: [["Contact", "Details"]],
        body: contactInfo,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
    }
    
    // Add notes if available
    if (unit.notes) {
      startY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Notes", 14, startY);
      doc.setFontSize(10);
      
      // Split notes into multiple lines if needed
      const textLines = doc.splitTextToSize(unit.notes, pageWidth - 30);
      doc.text(textLines, 14, startY + 5);
    }
    
    // Add footer with generation date
    const generatedDate = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.text(`Generated on: ${generatedDate}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    
    // Generate the PDF as a blob and download it
    const pdfBlob = doc.output('blob');
    const fileName = `${reportType}-report-${unit.name || 'unit'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
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
    
    console.log("PDF generated and download triggered successfully");
    
    toast({
      title: "Success",
      description: "PDF report downloaded successfully",
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to download report. Please try again.",
    });
  }
};

/**
 * Helper function to get date range for a report
 */
export const getReportDateRange = (reportType: string, startDate?: Date, endDate?: Date) => {
  if (startDate && endDate) {
    return { startDate, endDate };
  }
  
  return {
    startDate: new Date(),  // Default to current date
    endDate: new Date()
  };
};
