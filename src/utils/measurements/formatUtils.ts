
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

/**
 * Parse a timestamp string to a Date object
 * Handles Firestore timestamp format: "March 13, 2025 at 11:34:56 AM UTC+1"
 */
export const parseTimestamp = (timestamp: string): Date => {
  if (!timestamp) {
    throw new Error("Invalid timestamp: empty string");
  }
  
  // Check if it's already in our expected format with "at" separator
  if (typeof timestamp === 'string' && timestamp.includes(" at ")) {
    try {
      // For strings like "March 13, 2025 at 11:34:56 AM UTC+1"
      // Convert to a standard format that the Date constructor can handle
      return new Date(timestamp.replace(' at ', ' '));
    } catch (err) {
      console.error("Error parsing formatted timestamp:", err, timestamp);
      throw new Error(`Failed to parse timestamp: ${timestamp}`);
    }
  }
  
  // Try with standard date parsing as a fallback
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date from string: ${timestamp}`);
    }
    return date;
  } catch (err) {
    console.error("Error parsing timestamp:", err, timestamp);
    throw new Error(`Failed to parse timestamp: ${timestamp}`);
  }
};

/**
 * Format a number to have exactly 1 decimal place
 */
export const formatDecimal = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "0.0";
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return "0.0";
  
  return numValue.toFixed(1);
};

/**
 * Format a number with commas for thousands and no decimals
 */
export const formatThousands = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "0";
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return "0";
  
  return Math.round(numValue).toLocaleString('en-US');
};

/**
 * Convert cubic meters to liters
 * 1 cubic meter = 1000 liters
 */
export const cubicMetersToLiters = (cubicMeters: number | string | null | undefined): number => {
  if (cubicMeters === null || cubicMeters === undefined) return 0;
  
  const numValue = typeof cubicMeters === 'string' ? parseFloat(cubicMeters) : cubicMeters;
  
  if (isNaN(numValue)) return 0;
  
  return numValue * 1000;
};

/**
 * Convert liters to cubic meters
 * 1000 liters = 1 cubic meter
 */
export const litersToCubicMeters = (liters: number | string | null | undefined): number => {
  if (liters === null || liters === undefined) return 0;
  
  const numValue = typeof liters === 'string' ? parseFloat(liters) : liters;
  
  if (isNaN(numValue)) return 0;
  
  return numValue / 1000;
};

/**
 * Calculate the hourly volume change between two measurements
 * Returns volume difference in liters
 */
export const calculateHourlyVolume = (
  currentVolume: number | string | null | undefined, 
  previousVolume: number | string | null | undefined
): number => {
  const current = typeof currentVolume === 'string' ? parseFloat(currentVolume) : (currentVolume || 0);
  const previous = typeof previousVolume === 'string' ? parseFloat(previousVolume) : (previousVolume || 0);
  
  if (isNaN(current) || isNaN(previous)) return 0;
  
  // Calculate difference in cubic meters
  const diffInCubicMeters = Math.max(0, current - previous);
  
  // Convert to liters
  return diffInCubicMeters * 1000;
};

/**
 * Safely parse and format a timestamp from any format to our standard format
 * Returns the formatted string or "Invalid date" if parsing fails
 */
export const safeFormatTimestamp = (timestamp: any): string => {
  try {
    if (!timestamp) {
      return "Invalid date";
    }
    
    // If it's already a properly formatted string in our expected format
    if (typeof timestamp === 'string' && timestamp.includes(" at ")) {
      // Verify that it can be parsed as a valid date
      try {
        const parsedDate = parseTimestamp(timestamp);
        if (isNaN(parsedDate.getTime())) {
          console.error("Invalid date from formatted string:", timestamp);
          return "Invalid date";
        }
        return timestamp; // Return as is if it's valid
      } catch (e) {
        console.error("Error validating formatted timestamp:", e, timestamp);
        return "Invalid date";
      }
    }
    
    // If it's a Firestore timestamp object
    if (timestamp && typeof timestamp === 'object') {
      if ('seconds' in timestamp && 'nanoseconds' in timestamp) {
        const date = new Date(timestamp.seconds * 1000);
        return formatTimestamp(date);
      }
      
      // If it's a Date object
      if (timestamp instanceof Date) {
        return formatTimestamp(timestamp);
      }
      
      // If it has a toDate() method (Firestore Timestamp)
      if (typeof timestamp.toDate === 'function') {
        try {
          const date = timestamp.toDate();
          return formatTimestamp(date);
        } catch (e) {
          console.error("Error calling toDate():", e, timestamp);
          return "Invalid date";
        }
      }
    }
    
    // Try to parse as a regular date
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error("Invalid date from timestamp:", timestamp);
        return "Invalid date";
      }
      return formatTimestamp(date);
    } catch (error) {
      console.error("Error formatting timestamp:", error, "Original value:", timestamp);
      return "Invalid date";
    }
  } catch (error) {
    console.error("Unexpected error in safeFormatTimestamp:", error, "Original value:", timestamp);
    return "Invalid date";
  }
};
