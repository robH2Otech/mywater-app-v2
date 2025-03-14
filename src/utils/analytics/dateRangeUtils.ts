
import { subDays, format } from "date-fns";

/**
 * Function to get date range based on report type
 */
export const getDateRangeForReportType = (reportType: string): { startDate: Date, endDate: Date } => {
  const endDate = new Date();
  let startDate = new Date();
  
  switch(reportType) {
    case 'daily':
      startDate = subDays(endDate, 1);
      break;
    case 'weekly':
      startDate = subDays(endDate, 7);
      break;
    case 'monthly':
      startDate = subDays(endDate, 30);
      break;
    case 'yearly':
      startDate = subDays(endDate, 365);
      break;
    default:
      startDate = subDays(endDate, 7); // Default to weekly
  }
  
  return { startDate, endDate };
};

/**
 * Formats a date range into a readable string
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  return `${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`;
};
