
import { useQuery } from "@tanstack/react-query";
import { UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { secureDataFetch } from "@/utils/firebase/secureDataFetcher";

export function useUnits() {
  const { company, userRole } = useAuth();

  return useQuery({
    queryKey: ["units", company, userRole],
    queryFn: async () => {
      console.log("📋 useUnits: Fetching units data securely...");
      const units = await secureDataFetch<UnitData>({
        userRole,
        company,
        collectionName: "units",
        orderByField: "name"
      });
      
      console.log(`📋 useUnits: Fetched ${units.length} units for company: ${company}, role: ${userRole}`);
      return units;
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });
}
