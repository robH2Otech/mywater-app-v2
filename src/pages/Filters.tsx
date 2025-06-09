
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddFilterDialog } from "@/components/filters/AddFilterDialog";
import { FilterDetailsDialog } from "@/components/filters/FilterDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { FiltersList } from "@/components/filters/FiltersList";
import { useUnits } from "@/hooks/useUnits";
import { useAuth } from "@/contexts/AuthContext";

const Filters = () => {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<any>(null);

  const { data: units = [], isLoading, error } = useUnits();

  console.log("Filters page - User role:", userRole, "Units count:", units.length);

  if (error) {
    console.error("Filters: Error fetching units:", error);
    toast({
      title: "Error",
      description: "Failed to fetch water units",
      variant: "destructive",
    });
  }

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
        description={`Track and manage filter maintenance schedules${userRole === 'superadmin' ? ' (All Companies)' : ''}`}
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
