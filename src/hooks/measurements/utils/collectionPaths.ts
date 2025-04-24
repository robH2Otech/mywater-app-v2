
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export const MEASUREMENT_PATHS = [
  "units/{unitId}/measurements",
  "units/{unitId}/data",
  "measurements/{unitId}/data",
  "device-data/{unitId}/measurements"
];

export function getMeasurementsCollectionPath(unitId: string): string {
  // For all MYWATER units, use the same collection path pattern
  if (unitId.startsWith("MYWATER_")) {
    return `units/${unitId}/measurements`;
  }
  
  // Logic for other unit types
  if (unitId.includes("UVC")) {
    return `units/${unitId}/measurements`;
  }
  
  return `units/${unitId}/measurements`;
}

export async function tryCollectionPath(path: string, count: number = 24) {
  const measurementsQuery = query(
    collection(db, path),
    orderBy("timestamp", "desc"),
    limit(count)
  );
  
  return await getDocs(measurementsQuery);
}
