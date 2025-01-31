import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AddFilterDialog } from "@/components/filters/AddFilterDialog";
import { FilterDetailsDialog } from "@/components/filters/FilterDetailsDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { FiltersList } from "@/components/filters/FiltersList";

export const Filters = () => {
  const { toast } = useToast();
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<any>(null);

  const { data: units = [], isLoading, error } = useQuery({
    queryKey: ["filter-units"],
    queryFn: async () => {
      console.log("Fetching filter units data...");
      const { data, error } = await supabase
        .from("units")
        .select("*, filters(*)");
      
      if (error) {
        console.error("Error fetching filter units:", error);
        toast({
          title: "Error fetching units",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      console.log("Filter units data:", data);
      return data;
    },
  });

  if (error) {
    console.error("Error in Filters component:", error);
    return <div>Error loading filters. Please try again.</div>;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Filter Maintenance"
          description="Track and manage filter maintenance schedules"
          onAddClick={() => setIsAddFilterOpen(true)}
          addButtonText="Add Filter"
        />
        
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
    </Layout>
  );
};