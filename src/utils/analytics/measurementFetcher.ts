
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { format } from "date-fns";
import { getDateRangeForReportType } from "./dateRangeUtils";
import { generateSampleReportData } from "./sampleDataGenerator";

/**
 * Function to fetch measurements for a unit within a date range
 */
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
    
    // Create sample data if no real measurements exist (for testing/demo)
    if (measurements.length === 0) {
      const sampleData = generateSampleReportData(startDate, endDate);
      console.log("Generated sample data:", sampleData.length);
      return sampleData;
    }
    
    return measurements;
  } catch (error) {
    console.error("Error fetching measurements for report:", error);
    // Generate sample data as fallback in case of error
    const { startDate, endDate } = getDateRangeForReportType(reportType);
    return generateSampleReportData(startDate, endDate);
  }
};
