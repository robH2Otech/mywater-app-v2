
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { UnitData } from "@/types/analytics";
import { ReportMetrics } from "./types";
import { drawTableManually } from "./tableUtils";

/**
 * Adds unit information section to the PDF
 */
export const addUnitInfoSection = (
  doc: jsPDF,
  unit: UnitData,
  startY: number
): number => {
  console.log("Adding unit information...");
  doc.setFontSize(14);
  doc.text("Unit Information", 14, startY);
  doc.setFontSize(10);
  
  const unitInfo = [
    ["Name", unit.name || "N/A"],
    ["Location", unit.location || "N/A"],
    ["Status", unit.status || "N/A"],
    ["Total Capacity", `${unit.total_volume || 0} m³`]
  ];
  
  // First try with autoTable
  console.log("Creating unit info table...");
  try {
    doc.autoTable({
      startY: startY + 5,
      head: [["Property", "Value"]],
      body: unitInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    console.log("Unit info table created successfully");
    return doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 120;
  } catch (tableError) {
    // Fallback to manual table drawing
    console.error("Error creating unit info table with autoTable:", tableError);
    console.log("Falling back to manual table drawing...");
    
    const unitInfoHeaders = ["Property", "Value"];
    return drawTableManually(doc, unitInfo, unitInfoHeaders, startY + 5, "Unit Information");
  }
};

/**
 * Adds performance metrics section to the PDF
 */
export const addPerformanceMetricsSection = (
  doc: jsPDF,
  metrics: ReportMetrics,
  startY: number
): number => {
  console.log("Adding performance metrics...");
  doc.setFontSize(14);
  doc.text("Performance Metrics", 14, startY);
  
  const performanceMetrics = [
    ["Total Volume Processed", `${metrics.totalVolume.toFixed(2)} m³`],
    ["Average Daily Volume", `${metrics.avgVolume.toFixed(2)} m³`],
    ["Maximum Daily Volume", `${metrics.maxVolume.toFixed(2)} m³`],
    ["Average Temperature", `${metrics.avgTemperature.toFixed(2)} °C`],
    ["Total UVC Hours", `${metrics.totalUvcHours.toFixed(2)} hours`]
  ];
  
  console.log("Creating performance metrics table...");
  try {
    doc.autoTable({
      startY: startY + 5,
      head: [["Metric", "Value"]],
      body: performanceMetrics,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    console.log("Performance metrics table created successfully");
    return doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 200;
  } catch (tableError) {
    // Fallback to manual table drawing
    console.error("Error creating performance metrics table:", tableError);
    const metricsHeaders = ["Metric", "Value"];
    return drawTableManually(doc, performanceMetrics, metricsHeaders, startY + 5, "Performance Metrics");
  }
};

/**
 * Adds daily data table to the PDF
 */
export const addDailyMeasurementsSection = (
  doc: jsPDF,
  metrics: ReportMetrics,
  startY: number,
  reportType: string,
  unitName: string
): number => {
  console.log("Adding daily measurements...");
  doc.setFontSize(14);
  doc.text("Daily Measurements", 14, startY);
  
  const dailyData = metrics.dailyData.map(day => [
    new Date(day.date).toLocaleDateString(),
    `${day.volume.toFixed(2)} m³`,
    `${day.avgTemperature.toFixed(2)} °C`,
    `${day.uvcHours.toFixed(2)} hours`
  ]);
  
  console.log("Creating daily measurements table...");
  try {
    doc.autoTable({
      startY: startY + 5,
      head: [["Date", "Volume", "Avg. Temperature", "UVC Hours"]],
      body: dailyData,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] },
      didDrawPage: (data) => {
        // Add header to each page
        doc.setFontSize(8);
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(`${reportType.toUpperCase()} REPORT - ${unitName || ""}`, pageWidth / 2, 10, { align: "center" });
      }
    });
    console.log("Daily measurements table created successfully");
    return doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 280;
  } catch (tableError) {
    // Fallback to manual table drawing
    console.error("Error creating daily measurements table:", tableError);
    const dailyHeaders = ["Date", "Volume", "Avg. Temperature", "UVC Hours"];
    return drawTableManually(doc, dailyData, dailyHeaders, startY + 5, "Daily Measurements");
  }
};

/**
 * Adds maintenance information section to the PDF
 */
export const addMaintenanceSection = (
  doc: jsPDF,
  unit: UnitData,
  startY: number
): number => {
  console.log("Adding maintenance information...");
  doc.setFontSize(14);
  doc.text("Maintenance Information", 14, startY);
  
  const maintenanceInfo = [
    ["Last Maintenance", unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : "N/A"],
    ["Next Maintenance", unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : "N/A"]
  ];
  
  console.log("Creating maintenance info table...");
  try {
    doc.autoTable({
      startY: startY + 5,
      head: [["Maintenance", "Date"]],
      body: maintenanceInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    console.log("Maintenance info table created successfully");
    return doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 320;
  } catch (tableError) {
    // Fallback to manual table drawing
    console.error("Error creating maintenance info table:", tableError);
    const maintenanceHeaders = ["Maintenance", "Date"];
    return drawTableManually(doc, maintenanceInfo, maintenanceHeaders, startY + 5, "Maintenance Information");
  }
};

/**
 * Adds contact information section to the PDF if available
 */
export const addContactSection = (
  doc: jsPDF,
  unit: UnitData,
  startY: number
): number => {
  if (!unit.contact_name && !unit.contact_email && !unit.contact_phone) {
    return startY; // Skip if no contact info
  }
  
  console.log("Adding contact information...");
  doc.setFontSize(14);
  doc.text("Contact Information", 14, startY);
  
  const contactInfo = [
    ["Name", unit.contact_name || "N/A"],
    ["Email", unit.contact_email || "N/A"],
    ["Phone", unit.contact_phone || "N/A"]
  ];
  
  console.log("Creating contact info table...");
  try {
    doc.autoTable({
      startY: startY + 5,
      head: [["Contact", "Details"]],
      body: contactInfo,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 0] }
    });
    console.log("Contact info table created successfully");
    return doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 350;
  } catch (tableError) {
    // Fallback to manual table drawing
    console.error("Error creating contact info table:", tableError);
    const contactHeaders = ["Contact", "Details"];
    return drawTableManually(doc, contactInfo, contactHeaders, startY + 5, "Contact Information");
  }
};
