
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddFilterDialog } from "@/components/filters/AddFilterDialog";
import { FilterDetailsDialog } from "@/components/filters/FilterDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { FiltersList } from "@/components/filters/FiltersList";
import { UnitData } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

const Filters = () => {
  const { toast } = useToast();
  const { company, userRole } = useAuth();
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<any>(null);
  const isSuperAdmin = userRole === 'superadmin';

  const { data: units = [], isLoading, error } = useQuery({
    queryKey: ["filter-units", company, userRole],
    queryFn: async () => {
      console.log("🔧 Filters: Fetching units data...");
      
      try {
        const unitsRef = collection(db, "units");
        
        // Simple query without Firestore filtering
        const snapshot = await getDocs(unitsRef);
        let units = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          } as UnitData;
        });
        
        // Client-side filtering for non-superadmins
        if (!isSuperAdmin && company) {
          const originalLength = units.length;
          units = units.filter(unit => !unit.company || unit.company === company);
          console.log(`🔧 Filters: Filtered from ${originalLength} to ${units.length} units for ${company}`);
        } else if (isSuperAdmin) {
          console.log(`🔧 Filters: Superadmin sees ALL ${units.length} units`);
        }
        
        console.log(`✅ Filters: Successfully fetched ${units.length} units`);
        return units;
      } catch (error) {
        console.error("❌ Filters: Error fetching units:", error);
        toast({
          title: "Error",
          description: "Failed to fetch water units",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!userRole,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Filter Maintenance"
          description={`Track and manage filter maintenance schedules${isSuperAdmin ? ' (ALL COMPANIES)' : (company ? ` for ${company}` : '')}`}
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
          description={`Track and manage filter maintenance schedules${isSuperAdmin ? ' (ALL COMPANIES)' : (company ? ` for ${company}` : '')}`}
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
        description={`Track and manage filter maintenance schedules${isSuperAdmin ? ' (ALL COMPANIES)' : (company ? ` for ${company}` : '')}`}
        onAddClick={() => setIsAddFilterOpen(true)}
        addButtonText="Add Filter"
      />
      
      {units.length === 0 ? (
        <div className="bg-spotify-darker border-spotify-accent p-6 rounded-lg">
          <div className="text-center text-gray-400 py-8">
            {isSuperAdmin ? 'No filter units found in the system.' : 'No filter units found. Click "Add Filter" to create one.'}
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
