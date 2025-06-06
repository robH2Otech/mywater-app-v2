
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { FilterData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { useDataFiltering } from "@/utils/auth/dataFiltering";
import { fetchWithRetry } from "@/utils/dashboard/fetchRetryUtil";

export function useIndexFiltersData(claimsInitialized: boolean) {
  const { company, userRole } = useAuth();
  const { isGlobalAccess } = useDataFiltering();

  return useQuery({
    queryKey: ["index-filters-needing-change", company, userRole, claimsInitialized],
    queryFn: async () => {
      return fetchWithRetry(async () => {
        console.log("🔧 Index: Fetching filters data...");
        const filtersCollection = collection(db, "filters");
        const filtersQuery = query(filtersCollection);
        
        const filtersSnapshot = await getDocs(filtersQuery);
        const allFilters = filtersSnapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            unit_id: data.unit_id,
            installation_date: data.installation_date,
            last_change: data.last_change,
            next_change: data.next_change,
            volume_processed: data.volume_processed,
            contact_name: data.contact_name,
            email: data.email,
            phone: data.phone,
            notes: data.notes,
            created_at: data.created_at,
            updated_at: data.updated_at,
            status: data.status,
            company: data.company || company
          } as FilterData & { status: string };
        });
        
        // Filter for filters needing attention
        let filteredFilters;
        if (isGlobalAccess || userRole === 'superadmin') {
          filteredFilters = allFilters.filter(filter => 
            filter.status === "warning" || filter.status === "critical"
          );
        } else {
          const filterCompany = company || 'X-WATER';
          filteredFilters = allFilters.filter(filter => 
            (filter.status === "warning" || filter.status === "critical") &&
            (!filter.company || filter.company === filterCompany)
          );
        }
        
        console.log(`🔧 Index: Successfully fetched ${filteredFilters.length} filters needing change`);
        return filteredFilters;
      });
    },
    enabled: true,
    retry: false,
    staleTime: 30000,
  });
}
