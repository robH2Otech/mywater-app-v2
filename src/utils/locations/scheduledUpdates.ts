
import { fetchAndStoreLocationData } from './locationDataFetcher';

export const scheduleLocationUpdates = () => {
  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  
  // Schedule first update
  const morningUpdate = new Date();
  morningUpdate.setHours(6, 0, 0, 0);
  if (currentHour >= 6) morningUpdate.setDate(morningUpdate.getDate() + 1);
  
  // Schedule second update
  const eveningUpdate = new Date();
  eveningUpdate.setHours(18, 0, 0, 0);
  if (currentHour >= 18) eveningUpdate.setDate(eveningUpdate.getDate() + 1);
  
  // Calculate delays
  const msUntilMorning = morningUpdate.getTime() - now.getTime();
  const msUntilEvening = eveningUpdate.getTime() - now.getTime();
  
  // Set up schedulers
  setTimeout(async () => {
    await fetchAndStoreLocationData();
    // Reschedule for next day
    scheduleLocationUpdates();
  }, Math.min(msUntilMorning, msUntilEvening));
  
  // Log next update time
  const nextUpdate = new Date(now.getTime() + Math.min(msUntilMorning, msUntilEvening));
  console.log('Next location update scheduled for:', nextUpdate.toLocaleString());
};
