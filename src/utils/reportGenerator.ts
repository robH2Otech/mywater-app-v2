
import { UnitData } from "@/types/analytics";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { subDays, format, parseISO } from "date-fns";

// Function to get date range based on report type
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

// Function to fetch measurements for a unit within a date range
export const fetchMeasurementsForReport = async (unitId: string, reportType: string) => {
  try {
    const { startDate, endDate } = getDateRangeForReportType(reportType);
    const measurementsPath = getMeasurementsCollectionPath(unitId);
    
    console.log(`Fetching measurements for unit ${unitId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const q = query(
      collection(db, measurementsPath),
      where("timestamp", ">=", startTimestamp),
      where("timestamp", "<=", endTimestamp),
      orderBy("timestamp", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    const measurements = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to string for easier processing
      timestamp: doc.data().timestamp instanceof Timestamp 
        ? doc.data().timestamp.toDate().toISOString() 
        : doc.data().timestamp
    }));
    
    console.log(`Retrieved ${measurements.length} measurements for report`);
    
    // Process measurements to ensure consistent numeric formatting
    measurements.forEach(measurement => {
      // Ensure volume is a number with 2 decimal places
      if (measurement.volume !== undefined) {
        measurement.volume = typeof measurement.volume === 'number' 
          ? Number(measurement.volume.toFixed(2))
          : Number(parseFloat(measurement.volume || '0').toFixed(2));
      }
      
      // Ensure temperature is a number with 1 decimal place
      if (measurement.temperature !== undefined) {
        measurement.temperature = typeof measurement.temperature === 'number'
          ? Number(measurement.temperature.toFixed(1))
          : Number(parseFloat(measurement.temperature || '0').toFixed(1));
      }
      
      // Ensure uvc_hours is a number with 1 decimal place
      if (measurement.uvc_hours !== undefined) {
        measurement.uvc_hours = typeof measurement.uvc_hours === 'number'
          ? Number(measurement.uvc_hours.toFixed(1))
          : Number(parseFloat(measurement.uvc_hours || '0').toFixed(1));
      }
    });
    
    return measurements;
  } catch (error) {
    console.error("Error fetching measurements for report:", error);
    throw error;
  }
};

// Calculate aggregated metrics from measurements
export const calculateMetricsFromMeasurements = (measurements: any[]) => {
  if (!measurements.length) {
    return {
      totalVolume: 0,
      avgVolume: 0,
      maxVolume: 0,
      avgTemperature: 0,
      totalUvcHours: 0,
      dailyData: []
    };
  }
  
  // Get the latest volume from the most recent measurement
  const sortedMeasurements = [...measurements].sort((a, b) => {
    const dateA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : a.timestamp;
    const dateB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : b.timestamp;
    return dateB.getTime() - dateA.getTime();
  });
  
  const latestMeasurement = sortedMeasurements[0];
  const latestVolume = latestMeasurement?.volume || 0;
  const latestUvcHours = latestMeasurement?.uvc_hours || 0;
  
  console.log(`Latest measurement for report - Volume: ${latestVolume}, UVC Hours: ${latestUvcHours}`);
  
  let totalTemperature = 0;
  let maxVolume = 0;
  
  // Create daily aggregations for charts
  const dailyMap = new Map();
  
  measurements.forEach(measurement => {
    const volume = typeof measurement.volume === 'number' ? measurement.volume : 0;
    const temperature = typeof measurement.temperature === 'number' ? measurement.temperature : 0;
    const uvcHours = typeof measurement.uvc_hours === 'number' ? measurement.uvc_hours : 0;
    
    totalTemperature += temperature;
    
    if (volume > maxVolume) {
      maxVolume = volume;
    }
    
    // Group by day for chart data
    if (measurement.timestamp) {
      const day = typeof measurement.timestamp === 'string' 
        ? measurement.timestamp.split('T')[0] 
        : format(measurement.timestamp, 'yyyy-MM-dd');
        
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { 
          date: day, 
          volume: 0, 
          temperature: 0,
          uvcHours: 0,
          count: 0 
        });
      }
      
      const dayData = dailyMap.get(day);
      dayData.volume = volume; // Use the exact volume from measurement, not cumulative
      dayData.temperature += temperature;
      dayData.uvcHours = uvcHours; // Use exact UVC hours, not cumulative
      dayData.count += 1;
    }
  });
  
  // Calculate averages for each day
  const dailyData = Array.from(dailyMap.values()).map(day => ({
    date: day.date,
    volume: Number(day.volume.toFixed(2)),
    avgVolume: Number((day.volume / day.count).toFixed(2)),
    avgTemperature: Number((day.temperature / day.count).toFixed(1)),
    uvcHours: Number(day.uvcHours.toFixed(1))
  }));
  
  // Sort by date
  dailyData.sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    totalVolume: latestVolume, // Use latest volume instead of accumulated
    avgVolume: Number((latestVolume / measurements.length).toFixed(2)),
    maxVolume: Number(maxVolume.toFixed(2)),
    avgTemperature: Number((totalTemperature / measurements.length).toFixed(1)),
    totalUvcHours: latestUvcHours, // Use latest UVC hours instead of accumulated
    dailyData
  };
};

// Generate plain text report content (used for the current simple reports)
export function generateReportContent(unitData: UnitData, reportType: string, measurements: any[] = []): string {
  const timestamp = new Date().toLocaleString();
  const { startDate, endDate } = getDateRangeForReportType(reportType);
  const metrics = calculateMetricsFromMeasurements(measurements);
  
  return `${reportType.toUpperCase()} REPORT
Generated: ${timestamp}
Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}

Unit Information:
Name: ${unitData.name || 'N/A'}
Location: ${unitData.location || 'N/A'}
Status: ${unitData.status || 'N/A'}
Total Volume: ${metrics.totalVolume.toFixed(2)} m³

Performance Metrics:
Total Volume Processed: ${metrics.totalVolume.toFixed(2)} m³
Average Daily Volume: ${metrics.avgVolume.toFixed(2)} m³
Maximum Daily Volume: ${metrics.maxVolume.toFixed(2)} m³
Average Temperature: ${metrics.avgTemperature.toFixed(1)} °C
Total UVC Hours: ${metrics.totalUvcHours.toFixed(1)} hours

Last Maintenance: ${unitData.last_maintenance ? new Date(unitData.last_maintenance).toLocaleDateString() : 'N/A'}
Next Maintenance: ${unitData.next_maintenance ? new Date(unitData.next_maintenance).toLocaleDateString() : 'N/A'}

Contact Information:
Name: ${unitData.contact_name || 'N/A'}
Email: ${unitData.contact_email || 'N/A'}
Phone: ${unitData.contact_phone || 'N/A'}

Notes:
${unitData.notes || 'No additional notes'}`;
}
