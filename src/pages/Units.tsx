import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UnitCard } from "@/components/units/UnitCard";
import { AddUnitDialog } from "@/components/units/AddUnitDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const Units = () => {
  const { toast } = useToast();
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  
  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching units:", error);
        toast({
          title: "Error",
          description: "Failed to fetch water units",
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Water Units</h1>
          <p className="text-gray-400">Manage and monitor your water treatment units</p>
        </div>
        <Button 
          onClick={() => setIsAddUnitOpen(true)}
          className="bg-spotify-green hover:bg-spotify-green/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[200px] bg-spotify-darker animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              id={unit.id}
              name={unit.name}
              status={unit.status}
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
};