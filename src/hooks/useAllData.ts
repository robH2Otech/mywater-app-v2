
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";

export function useAllUnits() {
  return useQuery({
    queryKey: ["all-units"],
    queryFn: async () => {
      console.log("Fetching ALL units with no filtering");
      
      const unitsCollection = collection(db, "units");
      const unitsQuery = query(unitsCollection, orderBy("name"));
      const unitsSnapshot = await getDocs(unitsQuery);
      
      const units = unitsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        status: doc.data().status,
        location: doc.data().location,
        company: doc.data().company,
        total_volume: doc.data().total_volume,
        last_maintenance: doc.data().last_maintenance,
        unit_type: doc.data().unit_type
      })) as UnitData[];
      
      console.log(`Fetched ${units.length} units (ALL DATA, NO FILTERING)`);
      return units;
    },
  });
}

export function useAllAlerts() {
  return useQuery({
    queryKey: ["all-alerts"],
    queryFn: async () => {
      console.log("Fetching ALL alerts with no filtering");
      
      const alertsCollection = collection(db, "alerts");
      const alertsSnapshot = await getDocs(alertsCollection);
      
      const alerts = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Fetched ${alerts.length} alerts (ALL DATA, NO FILTERING)`);
      return alerts;
    },
  });
}

export function useAllFilters() {
  return useQuery({
    queryKey: ["all-filters"],
    queryFn: async () => {
      console.log("Fetching ALL filters with no filtering");
      
      const filtersCollection = collection(db, "filters");
      const filtersSnapshot = await getDocs(filtersCollection);
      
      const filters = filtersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Fetched ${filters.length} filters (ALL DATA, NO FILTERING)`);
      return filters;
    },
  });
}
