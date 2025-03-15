
import { UnitData } from "@/types/analytics";
import { getDateRangeForReportType } from "./dateRanges";
import { calculateMetricsFromMeasurements } from "./metrics";
import { format } from "date-fns";

// Generate plain text report content (used for the current simple reports)
export function generateReportContent(unitData: UnitData, reportType: string, measurements: any[] = []): string {
  const timestamp = new Date().toLocaleString();
  const { startDate, endDate } = getDateRangeForReportType(reportType);
  const metrics = calculateMetricsFromMeasurements(measurements);
  
  return `${reportType.toUpperCase()} REPORT
Generated: ${timestamp}
Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}

Unit Information:
Name: ${unitData.name || 'N/A'}
Location: ${unitData.location || 'N/A'}
Status: ${unitData.status || 'N/A'}
Total Volume: ${unitData.total_volume || 0} m³

Performance Metrics:
Total Volume Processed: ${metrics.totalVolume.toFixed(2)} m³
Average Daily Volume: ${metrics.avgVolume.toFixed(2)} m³
Maximum Daily Volume: ${metrics.maxVolume.toFixed(2)} m³
Average Temperature: ${metrics.avgTemperature.toFixed(2)} °C
Total UVC Hours: ${metrics.totalUvcHours.toFixed(2)} hours

Last Maintenance: ${unitData.last_maintenance ? new Date(unitData.last_maintenance).toLocaleDateString() : 'N/A'}
Next Maintenance: ${unitData.next_maintenance ? new Date(unitData.next_maintenance).toLocaleDateString() : 'N/A'}

Contact Information:
Name: ${unitData.contact_name || 'N/A'}
Email: ${unitData.contact_email || 'N/A'}
Phone: ${unitData.contact_phone || 'N/A'}

Notes:
${unitData.notes || 'No additional notes'}`;
}
