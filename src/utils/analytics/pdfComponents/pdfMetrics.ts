
import { jsPDF } from "jspdf";

/**
 * Add performance metrics section to PDF document
 */
export function pdfAddMetrics(doc: jsPDF, metrics: any, yPos: number): number {
  doc.setFontSize(14);
  doc.text("Performance Metrics", 14, yPos + 10);
  
  const performanceMetrics = [
    ["Total Volume Processed", `${metrics.totalVolume.toFixed(2)} units`],
    ["Average Daily Volume", `${metrics.avgVolume.toFixed(2)} units`],
    ["Maximum Daily Volume", `${metrics.maxVolume.toFixed(2)} units`],
    ["Average Temperature", `${metrics.avgTemperature.toFixed(2)} °C`],
    ["Total UVC Hours", `${metrics.totalUvcHours.toFixed(2)} hours`]
  ];
  
  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    startY: yPos + 15,
    head: [["Metric", "Value"]],
    body: performanceMetrics,
    theme: 'grid',
    headStyles: { fillColor: [0, 150, 0] }
  });
  
  return doc.lastAutoTable?.finalY || (yPos + 15);
}
