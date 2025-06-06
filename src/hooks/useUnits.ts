
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function useUnits() {
  const { company, userRole } = useAuth();
  const isSuperAdmin = userRole === 'superadmin';

  return useQuery({
    queryKey: ["units", company, userRole],
    queryFn: async () => {
      console.log("📋 useUnits: Fetching units data...");
      const unitsCollection = collection(db, "units");
      const unitsQuery = query(unitsCollection, orderBy("name"));
      
      const unitsSnapshot = await getDocs(unitsQuery);
      
      const allUnits = unitsSnapshot.docs.map(doc => {
        const data = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          name: data.name,
          status: data.status,
          location: data.location,
          total_volume: data.total_volume,
          last_maintenance: data.last_maintenance,
          next_maintenance: data.next_maintenance,
          setup_date: data.setup_date,
          uvc_hours: data.uvc_hours,
          uvc_status: data.uvc_status,
          uvc_installation_date: data.uvc_installation_date,
          is_uvc_accumulated: data.is_uvc_accumulated,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          notes: data.notes,
          created_at: data.created_at,
          updated_at: data.updated_at,
          eid: data.eid,
          iccid: data.iccid,
          unit_type: data.unit_type,
          company: data.company || company
        } as UnitData;
      });
      
      let filteredUnits;
      if (isSuperAdmin) {
        filteredUnits = allUnits;
      } else {
        const filterCompany = company || 'X-WATER';
        filteredUnits = allUnits.filter(unit => 
          !unit.company || unit.company === filterCompany
        );
      }
      
      console.log(`📋 useUnits: Fetched ${filteredUnits.length} units for company: ${company}, role: ${userRole}`);
      return filteredUnits;
    },
    enabled: !!userRole && !!company,
    retry: 1,
    staleTime: 30000,
  });
}
