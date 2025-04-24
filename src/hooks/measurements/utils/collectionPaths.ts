
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export const MEASUREMENT_PATHS = [
  "units/{unitId}/measurements",
  "units/{unitId}/data",
  "measurements/{unitId}/data",
  "device-data/{unitId}/measurements"
];

export function getMeasurementsCollectionPath(unitId: string): string {
  if (unitId === "MYWATER_003") {
    return "units/MYWATER_003/measurements";
  }
  
  if (unitId.startsWith("MYWATER_")) {
    return `units/${unitId}/data`;
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
