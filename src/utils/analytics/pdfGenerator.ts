
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";
import { UnitData } from "@/types/analytics";
import { formatDateRange } from "./dateRangeUtils";

export function generateReportPDF(unit: UnitData, reportType: string, metrics: any, startDate: Date, endDate: Date) {
  try {
    console.log("Generating PDF for report:", reportType);
    
    // Create a new jsPDF instance
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(0, 128, 0);
    doc.text("MYWATER Technologies", pageWidth / 2, 20, { align: "center" });
    
    // Add report title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${reportType.toUpperCase()} REPORT: ${unit.name || ""}`, pageWidth / 2, 30, { align: "center" });
    
    // Add date range
    doc.setFontSize(12);
    doc.text(
      `Period: ${formatDateRange(startDate, endDate)}`,
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
      ["Total Capacity", `${unit.total_volume || 0} units`]
    ];
    
    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: 55,
      head: [["Property", "Value"]],
      body: unitInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    let lastY = doc.lastAutoTable?.finalY || 55;
    
    // Add performance metrics section
    doc.setFontSize(14);
    doc.text("Performance Metrics", 14, lastY + 10);
    
    const performanceMetrics = [
      ["Total Volume Processed", `${metrics.totalVolume.toFixed(2)} units`],
      ["Average Daily Volume", `${metrics.avgVolume.toFixed(2)} units`],
      ["Maximum Daily Volume", `${metrics.maxVolume.toFixed(2)} units`],
      ["Average Temperature", `${metrics.avgTemperature.toFixed(2)} °C`],
      ["Total UVC Hours", `${metrics.totalUvcHours.toFixed(2)} hours`]
    ];
    
    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: lastY + 15,
      head: [["Metric", "Value"]],
      body: performanceMetrics,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    lastY = doc.lastAutoTable?.finalY || (lastY + 15);
    
    // Add daily data table
    doc.setFontSize(14);
    doc.text("Daily Measurements", 14, lastY + 10);
    
    const dailyData = metrics.dailyData.map((day: any) => [
      typeof day.date === 'string' ? format(new Date(day.date), 'MMM dd, yyyy') : day.date,
      `${day.volume.toFixed(2)} units`,
      `${day.avgTemperature.toFixed(2)} °C`,
      `${day.uvcHours.toFixed(2)} hours`
    ]);
    
    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: lastY + 15,
      head: [["Date", "Volume", "Avg. Temperature", "UVC Hours"]],
      body: dailyData,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    lastY = doc.lastAutoTable?.finalY || (lastY + 15);
    
    // Add maintenance information
    doc.setFontSize(14);
    doc.text("Maintenance Information", 14, lastY + 10);
    
    const maintenanceInfo = [
      ["Last Maintenance", unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : "N/A"],
      ["Next Maintenance", unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : "N/A"]
    ];
    
    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      startY: lastY + 15,
      head: [["Maintenance", "Date"]],
      body: maintenanceInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    
    lastY = doc.lastAutoTable?.finalY || (lastY + 15);
    
    // Add contact information
    if (unit.contact_name || unit.contact_email || unit.contact_phone) {
      doc.setFontSize(14);
      doc.text("Contact Information", 14, lastY + 10);
      
      const contactInfo = [
        ["Name", unit.contact_name || "N/A"],
        ["Email", unit.contact_email || "N/A"],
        ["Phone", unit.contact_phone || "N/A"]
      ];
      
      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        startY: lastY + 15,
        head: [["Contact", "Details"]],
        body: contactInfo,
        theme: 'grid',
        headStyles: { fillColor: [0, 150, 0] }
      });
      
      lastY = doc.lastAutoTable?.finalY || (lastY + 15);
    }
    
    // Add notes if available
    if (unit.notes) {
      doc.setFontSize(14);
      doc.text("Notes", 14, lastY + 10);
      doc.setFontSize(10);
      doc.text(unit.notes, 14, lastY + 20);
    }
    
    // Add footer with generation date
    const generatedDate = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.text(`Generated on: ${generatedDate}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    
    // Save the PDF
    console.log("Saving PDF...");
    doc.save(`${reportType}-report-${unit.name || 'unit'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    console.log("PDF generated successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
