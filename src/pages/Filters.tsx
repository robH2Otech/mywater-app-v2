
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddFilterDialog } from "@/components/filters/AddFilterDialog";
import { FilterDetailsDialog } from "@/components/filters/FilterDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { FiltersList } from "@/components/filters/FiltersList";
import { useAuth } from "@/contexts/AuthContext";
import { useSimpleUnits } from "@/hooks/useSimpleUnits";

const Filters = () => {
  const { toast } = useToast();
  const { company, userRole } = useAuth();
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<any>(null);
  const isSuperAdmin = userRole === 'superadmin';

  const { data: units = [], isLoading, error } = useSimpleUnits();

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
    console.error("❌ Filters: Error loading units:", error);
    toast({
      title: "Error",
      description: "Failed to fetch water units",
      variant: "destructive",
    });
    
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
