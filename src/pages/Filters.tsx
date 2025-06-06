
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddFilterDialog } from "@/components/filters/AddFilterDialog";
import { FilterDetailsDialog } from "@/components/filters/FilterDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { FiltersList } from "@/components/filters/FiltersList";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

const Filters = () => {
  const { toast } = useToast();
  const { company, userRole } = useAuth();
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<any>(null);

  const { data: units = [], isLoading, error } = useQuery({
    queryKey: ["filter-units", company, userRole],
    queryFn: async () => {
      console.log("Filters: Fetching units data...");
      try {
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        
        const allUnits = unitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UnitData[];
        
        // Simple filtering like other pages
        const isSuperAdmin = userRole === 'superadmin';
        if (isSuperAdmin) {
          return allUnits;
        } else {
          const filterCompany = company || 'X-WATER';
          return allUnits.filter(unit => 
            !unit.company || unit.company === filterCompany
          );
        }
      } catch (error) {
        console.error("Filters: Error fetching units:", error);
        toast({
          title: "Error",
          description: "Failed to fetch water units",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!userRole && !!company,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Filter Maintenance"
          description="Track and manage filter maintenance schedules"
          onAddClick={() => setIsAddFilterOpen(true)}
          addButtonText="Add Filter"
        />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Filter Maintenance"
          description="Track and manage filter maintenance schedules"
          onAddClick={() => setIsAddFilterOpen(true)}
          addButtonText="Add Filter"
        />
        <div className="bg-red-900/20 border-red-800 p-6 rounded-lg">
          <div className="text-center text-red-400 py-8">
            Error loading filter data. Please try refreshing the page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn p-2 md:p-0">
      <PageHeader
        title="Filter Maintenance"
        description="Track and manage filter maintenance schedules"
        onAddClick={() => setIsAddFilterOpen(true)}
        addButtonText="Add Filter"
      />
      
      {units.length === 0 ? (
        <div className="bg-spotify-darker border-spotify-accent p-6 rounded-lg">
          <div className="text-center text-gray-400 py-8">
            No filter units found. Click "Add Filter" to create one.
          </div>
        </div>
      ) : (
        <FiltersList
          units={units}
          onFilterClick={setSelectedFilter}
        />
      )}

      <AddFilterDialog 
        open={isAddFilterOpen} 
        onOpenChange={setIsAddFilterOpen} 
      />

      <FilterDetailsDialog
        open={!!selectedFilter}
        onOpenChange={(open) => !open && setSelectedFilter(null)}
        filter={selectedFilter}
      />
    </div>
  );
};

export default Filters;
