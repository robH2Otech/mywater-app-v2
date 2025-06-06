
import { useQuery } from "@tanstack/react-query";
import { Plus, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnitCard } from "@/components/units/UnitCard";
import { AddUnitDialog } from "@/components/units/AddUnitDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

const Units = () => {
  const { toast } = useToast();
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const { company, userRole } = useAuth();
  const isSuperAdmin = userRole === 'superadmin';
  
  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units", company, userRole],
    queryFn: async () => {
      try {
        const unitsCollection = collection(db, "units");
        const unitsQuery = query(unitsCollection, orderBy("created_at", "desc"));
        
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
        
        // Filter client-side for better compatibility
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
        
        return filteredUnits;
      } catch (error) {
        console.error("Error fetching units:", error);
        toast({
          title: "Error",
          description: "Failed to fetch water units",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!userRole && !!company,
  });

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn p-2 md:p-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Water Units</h1>
          <p className="text-sm md:text-base text-gray-400">
            Manage and monitor your water treatment units
            {company && ` for ${company}`}
          </p>
        </div>
        <Button 
          onClick={() => setIsAddUnitOpen(true)}
          className="bg-mywater-blue hover:bg-mywater-blue/90 w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[180px] bg-spotify-darker animate-pulse rounded-lg" />
          ))}
        </div>
      ) : units.length === 0 ? (
        <div className="text-center py-12">
          <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Units Found</h3>
          <p className="text-gray-400 mb-4">
            {company ? `No water units found for ${company}` : 'No water units found'}
          </p>
          <Button 
            onClick={() => setIsAddUnitOpen(true)}
            className="bg-mywater-blue hover:bg-mywater-blue/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Unit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              id={unit.id}
              name={unit.name}
              status={unit.status || "active"}
              location={unit.location}
              total_volume={unit.total_volume}
              last_maintenance={unit.last_maintenance}
              unit_type={unit.unit_type}
            />
          ))}
        </div>
      )}

      <AddUnitDialog 
        open={isAddUnitOpen} 
        onOpenChange={setIsAddUnitOpen} 
      />
    </div>
  );
}

export default Units;
