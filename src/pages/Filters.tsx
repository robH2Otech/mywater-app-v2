
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

interface UnitWithFilters extends UnitData {
  filters: FilterData[];
}

const Filters = () => {
  const { toast } = useToast();
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<any>(null);

  const { data: units = [], isLoading, error } = useQuery({
    queryKey: ["filter-units"],
    queryFn: async () => {
      console.log("Filters: Fetching filter units data...");
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
            // Use calculated status
            status: calculatedStatus,
            // Ensure total_volume is a number
            total_volume: totalVolume,
            // Ensure unit_type is set
            unit_type: unitType,
            filters: [] // Will be populated with filters below
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
        
        console.log("Filters: Filter units data:", unitsData);
        return unitsData;
      } catch (error) {
        console.error("Filters: Error fetching filter units:", error);
        toast({
          title: "Error",
          description: "Failed to fetch water units",
          variant: "destructive",
        });
        throw error;
      }
    },
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
