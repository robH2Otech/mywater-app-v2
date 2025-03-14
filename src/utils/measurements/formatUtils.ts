
// Formatting utilities for measurements

/**
 * Format a date to a consistent string format
 * Returns format like: "March 13, 2025 at 11:34:56 AM UTC+1"
 */
export const formatTimestamp = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  };
  
  return date.toLocaleString('en-US', options);
};
