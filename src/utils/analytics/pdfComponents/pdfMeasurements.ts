
import { jsPDF } from "jspdf";
import { format } from "date-fns";

/**
 * Add daily measurements table to PDF document
 */
export function pdfAddMeasurements(doc: jsPDF, metrics: any, yPos: number): number {
  doc.setFontSize(14);
  doc.text("Daily Measurements", 14, yPos + 10);
  
  const dailyData = metrics.dailyData.map((day: any) => [
    typeof day.date === 'string' ? format(new Date(day.date), 'MMM dd, yyyy') : day.date,
    `${day.volume.toFixed(2)} units`,
    `${day.avgTemperature.toFixed(2)} °C`,
    `${day.uvcHours.toFixed(2)} hours`
  ]);
  
  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    startY: yPos + 15,
    head: [["Date", "Volume", "Avg. Temperature", "UVC Hours"]],
    body: dailyData,
    theme: 'grid',
    headStyles: { fillColor: [0, 150, 0] }
  });
  
  return doc.lastAutoTable?.finalY || (yPos + 15);
}
