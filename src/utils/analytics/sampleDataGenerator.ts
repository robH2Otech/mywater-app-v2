
/**
 * Generate sample report data when no real data exists
 */
export function generateSampleReportData(startDate: Date, endDate: Date) {
  const sampleData = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Generate random volume between 500 and 2000
    const volume = Math.floor(Math.random() * 1500) + 500;
    
    // Generate random temperature between 18 and 28
    const temperature = Math.floor(Math.random() * 10) + 18;
    
    // Generate random UVC hours between 1 and 8
    const uvcHours = Math.random() * 7 + 1;
    
    sampleData.push({
      timestamp: currentDate.toISOString(),
      volume: volume,
      temperature: temperature,
      uvc_hours: uvcHours
    });
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return sampleData;
}
