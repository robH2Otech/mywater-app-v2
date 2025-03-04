
import { UnitData } from "@/types/analytics";

export function generateReportContent(unitData: UnitData, reportType: string): string {
  const timestamp = new Date().toLocaleString();
  return `${reportType.toUpperCase()} REPORT
Generated: ${timestamp}

Unit Information:
Name: ${unitData.name || 'N/A'}
Location: ${unitData.location || 'N/A'}
Status: ${unitData.status || 'N/A'}
Total Volume: ${unitData.total_volume || 0} units

Last Maintenance: ${unitData.last_maintenance ? new Date(unitData.last_maintenance).toLocaleDateString() : 'N/A'}
Next Maintenance: ${unitData.next_maintenance ? new Date(unitData.next_maintenance).toLocaleDateString() : 'N/A'}

Contact Information:
Name: ${unitData.contact_name || 'N/A'}
Email: ${unitData.contact_email || 'N/A'}
Phone: ${unitData.contact_phone || 'N/A'}

Notes:
${unitData.notes || 'No additional notes'}`;
}
