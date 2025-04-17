
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";

export interface UnitWithUVC {
  id: string;
  name?: string;
  uvc_hours?: number;
  uvc_installation_date?: string;
  uvc_status?: 'active' | 'warning' | 'urgent';
  is_uvc_accumulated?: boolean;
  status?: string;
  total_volume?: number;
  location?: string;
  unit_type?: string;
  latest_measurement?: any;
  [key: string]: any;
}

/**
 * Hook for fetching UVC data with proper synchronization from latest measurements
 */
export function useUVCData() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["uvc-units"],
    queryFn: async () => {
      console.log("Fetching and synchronizing UVC units data...");
      try {
        // Get all units first
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        
        // Process each unit with its latest measurements
        const unitsWithMeasurements = await Promise.all(
          unitsSnapshot.docs.map(async (unitDoc) => {
            const unitData = unitDoc.data() as UnitWithUVC;
            unitData.id = unitDoc.id;
            
            try {
              // Get the latest measurement for this unit
              const measurementsPath = getMeasurementsCollectionPath(unitDoc.id);
              const measurementsCollection = collection(db, measurementsPath);
              const measurementsQuery = query(
                measurementsCollection,
                where("timestamp", "!=", null)
              );
              
              const measurementsSnapshot = await getDocs(measurementsQuery);
              
              if (!measurementsSnapshot.empty) {
                // Sort measurements by timestamp to get the latest
                const measurements = measurementsSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }));
                
                // Sort by timestamp in descending order
                measurements.sort((a, b) => {
                  // Handle potential undefined timestamps safely
                  const getTimestamp = (item: any) => {
                    if (!item || !item.timestamp) return 0;
                    
                    // Handle Firebase timestamp objects
                    if (typeof item.timestamp.toDate === 'function') {
                      return item.timestamp.toDate().getTime();
                    }
                    
                    // Handle string or number timestamps
                    if (typeof item.timestamp === 'string' || typeof item.timestamp === 'number') {
                      return new Date(item.timestamp).getTime();
                    }
                    
                    return 0;
                  };
                  
                  return getTimestamp(b) - getTimestamp(a);
                });
                
                // Get the latest measurement
                const latestMeasurement = measurements[0];
                
                // Store this in the unit data
                unitData.latest_measurement = latestMeasurement;
                
                console.log(`Unit ${unitData.id} latest measurement:`, latestMeasurement);
              } else {
                console.log(`No measurements found for unit ${unitData.id}`);
              }
            } catch (measurementError) {
              console.error(`Error fetching measurements for unit ${unitDoc.id}:`, measurementError);
            }
            
            return unitData;
          })
        );
        
        // Filter only units that have UVC functionality
        const uvcUnits = unitsWithMeasurements.filter(unit => 
          unit.unit_type === 'uvc' || 
          (unit.uvc_hours !== undefined && unit.uvc_hours > 0) ||
          (unit.latest_measurement?.uvc_hours && unit.latest_measurement.uvc_hours > 0)
        );
        
        console.log("UVC units synchronized with measurements:", uvcUnits.length);
        
        return uvcUnits;
      } catch (error) {
        console.error("Error fetching UVC units:", error);
        toast({
          title: "Error fetching units",
          description: "Failed to load UVC units",
          variant: "destructive",
        });
        throw error;
      }
    },
    // Set a shorter staleTime to ensure data is refreshed more frequently
    staleTime: 30 * 1000, // 30 seconds stale time
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
