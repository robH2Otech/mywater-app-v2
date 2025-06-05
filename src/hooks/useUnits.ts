
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
      const unitsCollection = collection(db, "units");
      // Fetch all units and filter client-side for better compatibility
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
          company: data.company || company // Use user's company if unit has no company field
        } as UnitData;
      });
      
      let filteredUnits;
      if (isSuperAdmin) {
        // Superadmin sees all units
        filteredUnits = allUnits;
      } else {
        // Filter by company for other roles - include units with no company field
        filteredUnits = allUnits.filter(unit => 
          !unit.company || unit.company === company
        );
      }
      
      console.log(`📋 useUnits: Fetched ${filteredUnits.length} units for company: ${company}, role: ${userRole}`);
      return filteredUnits;
    },
    enabled: !!userRole && !!company, // Only fetch when user role and company are available
  });
}
