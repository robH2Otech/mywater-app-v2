
import { useState, useCallback } from "react";
import { SupportRequest } from "@/types/supportRequests";
import { fetchSupportRequests } from "@/services/requestService";
import { useToast } from "@/hooks/use-toast";

export function useRequestFilter() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequestsData = useCallback(async (count?: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching requests with filter: ${activeFilter}, count: ${count || 5}`);
      const requestsData = await fetchSupportRequests(activeFilter, count || 5);
      
      if (requestsData.length === 0) {
        console.log("No requests found for the current filter");
      } else {
        console.log(`Successfully fetched ${requestsData.length} requests`);
      }
      
      setRequests(requestsData);
      setError(null);
    } catch (error) {
      console.error("Error fetching support requests:", error);
      setError("Failed to load support requests");
      toast({
        title: "Error",
        description: "Failed to load support requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, toast]);

  const handleFilterChange = (filter: string) => {
    console.log(`Changing filter from ${activeFilter} to ${filter}`);
    setActiveFilter(filter);
  };

  return {
    activeFilter,
    requests,
    isLoading,
    error,
    setActiveFilter: handleFilterChange,
    fetchRequests: fetchRequestsData
  };
}
