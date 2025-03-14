
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
  if (timestamp.includes(" at ")) {
    try {
      // Extract date parts
      const [datePart, timePart] = timestamp.split(" at ");
      const timezonePart = timePart.split(" ").slice(-1)[0];
      const timeWithoutZone = timePart.split(" ").slice(0, -1).join(" ");
      
      // Reconstruct in a format that Date constructor can parse
      const dateString = `${datePart} ${timeWithoutZone} ${timezonePart}`;
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date parsed from: ${timestamp}`);
      }
      
      return date;
    } catch (err) {
      console.error("Error parsing formatted timestamp:", err);
      throw new Error(`Failed to parse timestamp: ${timestamp}`);
    }
  }
  
  // If it's a standard date string or timestamp
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date from string: ${timestamp}`);
    }
    return date;
  } catch (err) {
    console.error("Error parsing timestamp:", err);
    throw new Error(`Failed to parse timestamp: ${timestamp}`);
  }
};

/**
 * Safely parse and format a timestamp from any format to our standard format
 * Returns the formatted string or "Invalid date" if parsing fails
 */
export const safeFormatTimestamp = (timestamp: string | Date): string => {
  try {
    if (!timestamp) {
      return "Invalid date";
    }
    
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return formatTimestamp(timestamp);
    }
    
    // If it's already in our expected format
    if (typeof timestamp === 'string' && timestamp.includes(" at ")) {
      // Validate it's actually a valid date in this format
      try {
        const date = parseTimestamp(timestamp);
        if (isNaN(date.getTime())) {
          return "Invalid date";
        }
        return timestamp; // Return as is if valid
      } catch (e) {
        return "Invalid date";
      }
    }
    
    // Try to parse and format
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return formatTimestamp(date);
  } catch (error) {
    console.error("Error formatting timestamp:", error, "Original value:", timestamp);
    return "Invalid date";
  }
};
