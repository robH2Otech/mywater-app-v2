
import { ReportData } from "@/types/analytics";

export function getReportTitle(reportType: string): string {
  if (!reportType) return "Report";
  
  return reportType.charAt(0).toUpperCase() + reportType.slice(1) + " Report";
}

export async function downloadReportAsTxt(report: ReportData): Promise<void> {
  if (!report || !report.content) {
    throw new Error("Report content is empty");
  }
  
  // Create a Blob from the content
  const blob = new Blob([report.content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.report_type}-report-${report.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
