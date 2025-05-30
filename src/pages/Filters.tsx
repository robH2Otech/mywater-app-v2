
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
import { AlertCircle } from "lucide-react";

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
      console.log("Fetching filter units data...");
      
      // Create mock data for testing
      const mockUnitsWithFilters: UnitWithFilters[] = [
        {
          id: "unit-1",
          name: "Water Filter Unit A",
          location: "Building A - Floor 1",
          status: "active",
          total_volume: 1250.5,
          unit_type: "filter",
          setup_date: "2024-01-15",
          last_maintenance: "2024-11-01",
          filters: [
            {
              id: "filter-1",
              unit_id: "unit-1",
              installation_date: "2024-01-15",
              last_change: "2024-10-01",
              next_change: "2025-01-01",
              volume_processed: 950
            },
            {
              id: "filter-2",
              unit_id: "unit-1",
              installation_date: "2024-01-15",
              last_change: "2024-09-15",
              next_change: "2024-12-15",
              volume_processed: 780
            }
          ]
        },
        {
          id: "unit-2",
          name: "Water Filter Unit B",
          location: "Building B - Floor 2",
          status: "active",
          total_volume: 890.3,
          unit_type: "filter",
          setup_date: "2024-02-20",
          last_maintenance: "2024-10-15",
          filters: [
            {
              id: "filter-3",
              unit_id: "unit-2",
              installation_date: "2024-02-20",
              last_change: "2024-11-01",
              next_change: "2025-02-01",
              volume_processed: 650
            }
          ]
        }
      ];

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
          const unitType = data.unit_type || 'filter';
          
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
        
        console.log("Filter units data:", unitsData);
        
        // If no real data, return mock data
        if (unitsData.length === 0) {
          console.log("No units found in Firebase, using mock data");
          return mockUnitsWithFilters;
        }
        
        return unitsData;
      } catch (error) {
        console.error("Error fetching filter units:", error);
        console.log("Using mock data due to Firebase error");
        return mockUnitsWithFilters;
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
      
      {error && (
        <Card className="p-6 bg-spotify-darker border-spotify-accent">
          <div className="flex items-center space-x-3 text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Connection Issue</p>
              <p className="text-sm text-gray-400">Using sample filter data. Some features may be limited.</p>
            </div>
          </div>
        </Card>
      )}
      
      <FiltersList
        units={units}
        onFilterClick={setSelectedFilter}
      />

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
