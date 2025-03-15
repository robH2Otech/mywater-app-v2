
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";
import { getDateRangeForReportType } from "./dateRanges";
import { format } from "date-fns";

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
