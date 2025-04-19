
/**
 * Utility functions for working with location data
 */

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat?: number, lng?: number): string => {
  if (lat === undefined || lng === undefined) {
    return 'Not available';
  }
  
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Format last update timestamp
 */
export const formatLastUpdate = (timestamp?: string): string => {
  if (!timestamp) return 'Unknown';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};

/**
 * Calculate how much time has passed since the last update
 */
export const getTimeSinceUpdate = (timestamp?: string): string => {
  if (!timestamp) return 'Unknown';
  
  try {
    const lastUpdate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error calculating time since update:', error);
    return 'Unknown';
  }
};
