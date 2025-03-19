
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnitCard } from "@/components/units/UnitCard";
import { AddUnitDialog } from "@/components/units/AddUnitDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";

export const Units = () => {
  const { toast } = useToast();
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  
  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      try {
        const unitsCollection = collection(db, "units");
        const unitsQuery = query(unitsCollection, orderBy("created_at", "desc"));
        const unitsSnapshot = await getDocs(unitsQuery);
        
        return unitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UnitData[];
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
  });

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn p-2 md:p-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Water Units</h1>
          <p className="text-sm md:text-base text-gray-400">Manage and monitor your water treatment units</p>
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
