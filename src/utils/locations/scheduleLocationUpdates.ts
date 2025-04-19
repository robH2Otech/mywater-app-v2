
import { format } from 'date-fns';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { toast } from 'sonner';

interface ScheduleOptions {
  morningHour?: number; // Default: 6
  eveningHour?: number; // Default: 18
  onUpdate?: () => void;
}

let scheduleTimeout: NodeJS.Timeout | null = null;

/**
 * Schedule location updates to run at specific times
 * By default, updates run at 6:00 AM and 6:00 PM
 */
export const scheduleLocationUpdates = (options: ScheduleOptions = {}) => {
  const { 
    morningHour = 6, 
    eveningHour = 18,
    onUpdate
  } = options;
  
  // Clear any existing schedule
  if (scheduleTimeout) {
    clearTimeout(scheduleTimeout);
  }
  
  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  
  // Schedule morning update (default 6:00 AM)
  const morningUpdate = new Date();
  morningUpdate.setHours(morningHour, 0, 0, 0);
  if (currentHour >= morningHour) morningUpdate.setDate(morningUpdate.getDate() + 1);
  
  // Schedule evening update (default 6:00 PM)
  const eveningUpdate = new Date();
  eveningUpdate.setHours(eveningHour, 0, 0, 0);
  if (currentHour >= eveningHour) eveningUpdate.setDate(eveningUpdate.getDate() + 1);
  
  // Calculate delay to next update time
  const msUntilMorning = morningUpdate.getTime() - now.getTime();
  const msUntilEvening = eveningUpdate.getTime() - now.getTime();
  const msUntilNextUpdate = Math.min(msUntilMorning, msUntilEvening);
  const nextUpdate = new Date(now.getTime() + msUntilNextUpdate);
  
  // Set up scheduler
  scheduleTimeout = setTimeout(async () => {
    try {
      await triggerLocationUpdate();
      if (onUpdate) onUpdate();
      
      // Reschedule for next time
      scheduleLocationUpdates(options);
    } catch (err) {
      console.error("Error in scheduled location update:", err);
      
      // Retry in 1 hour if there's an error
      setTimeout(() => {
        scheduleLocationUpdates(options);
      }, 60 * 60 * 1000);
    }
  }, msUntilNextUpdate);
  
  // Log next update time
  console.log('Next location update scheduled for:', format(nextUpdate, 'MMM d, yyyy HH:mm:ss'));
  
  return {
    nextUpdateTime: nextUpdate,
    cancel: () => {
      if (scheduleTimeout) {
        clearTimeout(scheduleTimeout);
        scheduleTimeout = null;
        return true;
      }
      return false;
    }
  };
};

/**
 * Trigger an immediate update of all locations
 */
export const triggerLocationUpdate = async (): Promise<boolean> => {
  const functions = getFunctions();
  
  try {
    console.log("Triggering location update for all units");
    
    const updateAllLocations = httpsCallable<{}, { success: boolean; updated: number; total: number }>(
      functions, 
      'updateAllLocations'
    );
    
    const result = await updateAllLocations();
    
    if (result.data.success) {
      console.log(`Location update completed. Updated ${result.data.updated}/${result.data.total} units`);
      toast.success(`Updated locations for ${result.data.updated} units`);
      return true;
    } else {
      console.error("Location update failed");
      return false;
    }
  } catch (error) {
    console.error("Error triggering location update:", error);
    return false;
  }
};

/**
 * Initialize location updates scheduler on app startup
 */
export const initializeLocationScheduler = (options: ScheduleOptions = {}) => {
  // Start the scheduler when the app initializes
  const scheduler = scheduleLocationUpdates(options);
  
  // Return controls for the scheduler
  return {
    getNextUpdateTime: () => scheduler.nextUpdateTime,
    cancelSchedule: scheduler.cancel
  };
};
