
import { addDays, differenceInDays, format } from "date-fns";

/**
 * Generate sample report data for testing/demonstration
 */
export function generateSampleReportData(startDate: Date, endDate: Date) {
  const dayCount = differenceInDays(endDate, startDate) + 1;
  const sampleData = [];
  
  console.log(`Generating ${dayCount} days of sample data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
  
  // Base values
  const baseVolume = 50 + Math.random() * 50; // Between 50-100
  const baseTemperature = 20 + Math.random() * 10; // Between 20-30
  const baseUvcHours = 2 + Math.random() * 3; // Between 2-5
  
  // Generate a data point for each day in the range
  for (let i = 0; i < dayCount; i++) {
    const currentDate = addDays(startDate, i);
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    
    // Add some random variations
    const volume = baseVolume + (Math.random() * 20 - 10); // +/- 10
    const temperature = baseTemperature + (Math.random() * 4 - 2); // +/- 2
    const uvcHours = baseUvcHours + (Math.random() * 2 - 1); // +/- 1
    
    // Create 3 data points per day to simulate multiple readings
    for (let j = 0; j < 3; j++) {
      const hour = 8 + j * 4; // 8am, 12pm, 4pm
      const timestamp = `${formattedDate}T${hour.toString().padStart(2, '0')}:00:00.000Z`;
      
      // Small variations for each reading within the day
      const hourlyVariation = (Math.random() * 2) - 1; // +/- 1
      
      sampleData.push({
        id: `sample-${formattedDate}-${j}`,
        timestamp,
        volume: volume + hourlyVariation,
        temperature: temperature + (hourlyVariation / 2),
        uvc_hours: (uvcHours + (hourlyVariation / 3)) / 3, // Divide by 3 as we have 3 readings per day
        cumulative_volume: 0 // Will be calculated in processing
      });
    }
  }
  
  // Sort by timestamp and add cumulative volume
  sampleData.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  
  let cumulativeVolume = 0;
  sampleData.forEach(item => {
    cumulativeVolume += item.volume;
    item.cumulative_volume = cumulativeVolume;
  });
  
  console.log(`Generated ${sampleData.length} sample data points`);
  return sampleData;
}
