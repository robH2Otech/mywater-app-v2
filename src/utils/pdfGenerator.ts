
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";
import { UnitData } from "@/types/analytics";
import { getReportTitle } from "@/utils/reportUtils";

// Add type declaration to handle jspdf-autotable extension
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
  autoTable: Function;
}

export async function generatePDF(
  unit: UnitData, 
  reportType: string, 
  metrics: any,
  startDate: Date,
  endDate: Date
): Promise<Blob> {
  try {
    console.log("Generating PDF for:", unit.name, reportType);
    
    // Create a new jsPDF instance
    const doc = new jsPDF() as ExtendedJsPDF;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 0);
    doc.text("MYWATER Technologies", pageWidth / 2, 20, { align: "center" });
    
    // Add report title with unit name
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    const reportTitle = `${unit.name} - ${getReportTitle(reportType)}`;
    doc.text(reportTitle, pageWidth / 2, 30, { align: "center" });
    
    // Add date range
    doc.setFontSize(12);
    doc.text(
      `Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`,
      pageWidth / 2, 
      40, 
      { align: "center" }
    );
    
    // Add unit information section
    doc.setFontSize(14);
    doc.text("Unit Information", 14, 50);
    doc.setFontSize(10);
    
    const unitInfo = [
      ["Name", unit.name || "N/A"],
      ["Location", unit.location || "N/A"],
      ["Status", unit.status || "N/A"],
      ["Total Capacity", `${unit.total_volume || 0} m³`]
    ];
    
    doc.autoTable({
      startY: 55,
      head: [["Property", "Value"]],
      body: unitInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add performance metrics section
    doc.setFontSize(14);
    const finalY1 = doc.lastAutoTable?.finalY || 120;
    doc.text("Performance Metrics", 14, finalY1 + 10);
    
    const performanceMetrics = [
      ["Total Volume Processed", `${metrics.totalVolume?.toFixed(2) || '0.00'} m³`],
      ["Average Daily Volume", `${metrics.avgVolume?.toFixed(2) || '0.00'} m³`],
      ["Maximum Daily Volume", `${metrics.maxVolume?.toFixed(2) || '0.00'} m³`],
      ["Average Temperature", `${metrics.avgTemperature?.toFixed(2) || '0.00'} °C`],
      ["Total UVC Hours", `${metrics.totalUvcHours?.toFixed(2) || '0.00'} hours`]
    ];
    
    doc.autoTable({
      startY: finalY1 + 15,
      head: [["Metric", "Value"]],
      body: performanceMetrics,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add daily data table if available
    if (metrics.dailyData && metrics.dailyData.length > 0) {
      doc.setFontSize(14);
      const finalY2 = doc.lastAutoTable?.finalY || 200;
      doc.text("Daily Measurements", 14, finalY2 + 10);
      
      // Sort data by date (ascending)
      const sortedData = [...(metrics.dailyData || [])].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      const dailyData = sortedData.map(day => [
        new Date(day.date).toLocaleDateString(),
        `${day.volume?.toFixed(2) || '0.00'} m³`,
        `${day.avgTemperature?.toFixed(2) || '0.00'} °C`,
        `${day.uvcHours?.toFixed(2) || '0.00'} hours`
      ]);
      
      doc.autoTable({
        startY: finalY2 + 15,
        head: [["Date", "Volume", "Avg. Temperature", "UVC Hours"]],
        body: dailyData,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
    }
    
    // Add maintenance information
    doc.setFontSize(14);
    const finalY3 = doc.lastAutoTable?.finalY || 280;
    doc.text("Maintenance Information", 14, finalY3 + 10);
    
    const maintenanceInfo = [
      ["Last Maintenance", unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : "N/A"],
      ["Next Maintenance", unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : "N/A"]
    ];
    
    doc.autoTable({
      startY: finalY3 + 15,
      head: [["Maintenance", "Date"]],
      body: maintenanceInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    // Add contact information if available
    if (unit.contact_name || unit.contact_email || unit.contact_phone) {
      doc.setFontSize(14);
      const finalY4 = doc.lastAutoTable?.finalY || 320;
      doc.text("Contact Information", 14, finalY4 + 10);
      
      const contactInfo = [
        ["Name", unit.contact_name || "N/A"],
        ["Email", unit.contact_email || "N/A"],
        ["Phone", unit.contact_phone || "N/A"]
      ];
      
      doc.autoTable({
        startY: finalY4 + 15,
        head: [["Contact", "Details"]],
        body: contactInfo,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
    }
    
    // Add notes if available
    if (unit.notes) {
      doc.setFontSize(14);
      const finalY5 = doc.lastAutoTable?.finalY || 350;
      doc.text("Notes", 14, finalY5 + 10);
      doc.setFontSize(10);
      doc.text(unit.notes, 14, finalY5 + 20);
    }
    
    // Add footer with generation date
    const generatedDate = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.text(`Generated on: ${generatedDate}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    
    // First try to get an arraybuffer, then convert to blob (most reliable cross-browser)
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
    console.log("PDF blob generated successfully:", pdfBlob.size, "bytes, type:", pdfBlob.type);
    
    return pdfBlob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF report");
  }
}
