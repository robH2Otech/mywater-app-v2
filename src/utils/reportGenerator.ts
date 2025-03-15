
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
    const measurements = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Ensure we convert Firestore timestamp to a format we can serialize
      let timestamp;
      if (data.timestamp instanceof Timestamp) {
        timestamp = data.timestamp.toDate().toISOString();
      } else if (typeof data.timestamp === 'string') {
        timestamp = data.timestamp;
      } else {
        timestamp = new Date().toISOString(); // Fallback
      }
      
      return {
        id: doc.id,
        ...data,
        timestamp
      };
    });
    
    console.log(`Retrieved ${measurements.length} measurements for report`);
    return measurements;
  } catch (error) {
    console.error("Error fetching measurements for report:", error);
    throw error;
  }
};

// Calculate aggregated metrics from measurements
export const calculateMetricsFromMeasurements = (measurements: any[]) => {
  if (!measurements || !measurements.length) {
    console.log("No measurements provided to calculate metrics");
    return {
      totalVolume: 0,
      avgVolume: 0,
      maxVolume: 0,
      avgTemperature: 0,
      totalUvcHours: 0,
      dailyData: []
    };
  }
  
  console.log(`Calculating metrics from ${measurements.length} measurements`);
  
  let totalVolume = 0;
  let totalTemperature = 0;
  let maxVolume = 0;
  let totalUvcHours = 0;
  
  // Create daily aggregations for charts
  const dailyMap = new Map();
  
  measurements.forEach(measurement => {
    const volume = typeof measurement.volume === 'number' ? measurement.volume : 0;
    const temperature = typeof measurement.temperature === 'number' ? measurement.temperature : 0;
    const uvcHours = typeof measurement.uvc_hours === 'number' ? measurement.uvc_hours : 0;
    
    totalVolume += volume;
    totalTemperature += temperature;
    totalUvcHours += uvcHours;
    
    if (volume > maxVolume) {
      maxVolume = volume;
    }
    
    // Group by day for chart data
    if (measurement.timestamp) {
      let day;
      try {
        // Safely extract the date portion
        if (typeof measurement.timestamp === 'string') {
          day = measurement.timestamp.split('T')[0];
        } else if (measurement.timestamp instanceof Date) {
          day = format(measurement.timestamp, 'yyyy-MM-dd');
        } else {
          console.warn("Unexpected timestamp format:", measurement.timestamp);
          day = format(new Date(), 'yyyy-MM-dd');
        }
        
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
        dayData.volume += volume;
        dayData.temperature += temperature;
        dayData.uvcHours += uvcHours;
        dayData.count += 1;
      } catch (error) {
        console.error("Error processing measurement day:", error, measurement);
      }
    }
  });
  
  // Calculate averages for each day
  const dailyData = Array.from(dailyMap.values()).map(day => ({
    date: day.date,
    volume: day.volume,
    avgVolume: day.count > 0 ? day.volume / day.count : 0,
    avgTemperature: day.count > 0 ? day.temperature / day.count : 0,
    uvcHours: day.uvcHours
  }));
  
  // Sort by date
  dailyData.sort((a, b) => a.date.localeCompare(b.date));
  
  const measCount = measurements.length || 1; // Avoid division by zero
  
  return {
    totalVolume,
    avgVolume: totalVolume / measCount,
    maxVolume,
    avgTemperature: totalTemperature / measCount,
    totalUvcHours,
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
Total Volume: ${unitData.total_volume || 0} m³

Performance Metrics:
Total Volume Processed: ${metrics.totalVolume.toFixed(2)} m³
Average Daily Volume: ${metrics.avgVolume.toFixed(2)} m³
Maximum Daily Volume: ${metrics.maxVolume.toFixed(2)} m³
Average Temperature: ${metrics.avgTemperature.toFixed(2)} °C
Total UVC Hours: ${metrics.totalUvcHours.toFixed(2)} hours

Last Maintenance: ${unitData.last_maintenance ? new Date(unitData.last_maintenance).toLocaleDateString() : 'N/A'}
Next Maintenance: ${unitData.next_maintenance ? new Date(unitData.next_maintenance).toLocaleDateString() : 'N/A'}

Contact Information:
Name: ${unitData.contact_name || 'N/A'}
Email: ${unitData.contact_email || 'N/A'}
Phone: ${unitData.contact_phone || 'N/A'}

Notes:
${unitData.notes || 'No additional notes'}`;
}
