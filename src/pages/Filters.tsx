
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
import { UnitData, FilterData } from "@/types/analytics";
import { determineUnitStatus } from "@/utils/unitStatusUtils";
import { useAuth } from "@/contexts/AuthContext";

interface UnitWithFilters extends UnitData {
  filters: FilterData[];
}

const Filters = () => {
  const { toast } = useToast();
  const { userRole, isLoading: authLoading, firebaseUser } = useAuth();
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<any>(null);

  const { data: units = [], isLoading, error } = useQuery({
    queryKey: ["filter-units"],
    queryFn: async () => {
      console.log("Filters: Fetching filter units data...");
      console.log("Filters: Current user:", firebaseUser?.email);
      
      try {
        // Get units
        const unitsCollection = collection(db, "units");
        const unitsSnapshot = await getDocs(unitsCollection);
        const unitsData = unitsSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Ensure total_volume is a number
          let totalVolume = data.total_volume;
          if (typeof totalVolume === 'string') {
            totalVolume = parseFloat(totalVolume);
          } else if (totalVolume === undefined || totalVolume === null) {
            totalVolume = 0;
          }
          
          // Ensure unit_type is set
          const unitType = data.unit_type || 'uvc';
          
          // Calculate the correct status based on volume
          const calculatedStatus = determineUnitStatus(totalVolume);
          
          return {
            id: doc.id,
            ...data,
            status: calculatedStatus,
            total_volume: totalVolume,
            unit_type: unitType,
            filters: []
          };
        }) as UnitWithFilters[];
        
        // Get filters
        const filtersCollection = collection(db, "filters");
        const filtersSnapshot = await getDocs(filtersCollection);
        const filtersData = filtersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FilterData[];
        
        // Associate filters with units
        for (const filter of filtersData) {
          const unitIndex = unitsData.findIndex(unit => unit.id === filter.unit_id);
          if (unitIndex >= 0) {
            unitsData[unitIndex].filters.push(filter);
          }
        }
        
        console.log("Filters: Filter units data fetched successfully:", unitsData.length, "units");
        return unitsData;
      } catch (error) {
        console.error("Filters: Error fetching filter units:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        // More helpful error handling
        if (errorMessage.includes("permission") || errorMessage.includes("Missing or insufficient permissions")) {
          toast({
            title: "Authentication Issue",
            description: "Please ensure you are logged in and have proper permissions. Try refreshing the page.",
            variant: "destructive",
          });
          
          // Return empty array to prevent complete failure
          return [];
        }
        
        toast({
          title: "Error fetching filters",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Return empty array to prevent complete failure
        return [];
      }
    },
    enabled: true, // Always enable, don't wait for specific auth state
    retry: (failureCount, error) => {
      console.log("Filters: Retry attempt:", failureCount, "Error:", error);
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  if (isLoading || authLoading) {
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
            {error && (
              <div className="mt-2 text-yellow-400 text-sm">
                Note: There was an issue accessing the filters database. Please ensure you are properly authenticated.
              </div>
            )}
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
