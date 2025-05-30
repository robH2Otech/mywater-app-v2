
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
import { Card } from "@/components/ui/card";
import { AlertCircle, Database } from "lucide-react";

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
      console.log("🔄 Fetching filter units data from Firebase...");
      
      try {
        // Get units from Firebase
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
          const unitType = data.unit_type || 'filter';
          
          // Calculate the correct status based on volume
          const calculatedStatus = determineUnitStatus(totalVolume);
          
          return {
            id: doc.id,
            ...data,
            status: calculatedStatus,
            total_volume: totalVolume,
            unit_type: unitType,
            filters: [] // Will be populated with filters below
          };
        }) as UnitWithFilters[];
        
        // Get filters from Firebase
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
        
        console.log("✅ Successfully fetched", unitsData.length, "units with", filtersData.length, "filters from Firebase");
        
        return unitsData;
      } catch (error) {
        console.error("❌ Error fetching filter units from Firebase:", error);
        throw new Error(`Failed to fetch filter data: ${error}`);
      }
    },
    retry: 2,
    retryDelay: 1000
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
    console.error("💥 Filter units query error:", error);
    return (
      <div className="space-y-6 animate-fadeIn p-2 md:p-0">
        <PageHeader
          title="Filter Maintenance"
          description="Track and manage filter maintenance schedules"
          onAddClick={() => setIsAddFilterOpen(true)}
          addButtonText="Add Filter"
        />
        <Card className="p-6 bg-spotify-darker border-spotify-accent">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Failed to Load Filter Data</p>
              <p className="text-sm text-gray-400">
                Could not connect to Firebase: {error.message}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Please check your Firebase configuration and permissions.
              </p>
            </div>
          </div>
        </Card>
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
        <Card className="p-6 bg-spotify-darker border-spotify-accent">
          <div className="flex items-center space-x-3 text-yellow-400">
            <Database className="h-5 w-5" />
            <div>
              <p className="font-medium">No Filter Units Found</p>
              <p className="text-sm text-gray-400">
                No units with filters found in your Firebase database.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Add some units and filters to get started with maintenance tracking.
              </p>
            </div>
          </div>
        </Card>
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
