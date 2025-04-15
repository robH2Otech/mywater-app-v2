
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "sonner";
import { SearchUnits } from "@/components/locations/SearchUnits";
import { LocationsGrid } from "@/components/locations/LocationsGrid";

interface UnitWithLocation {
  id: string;
  name: string;
  iccid: string | null;
  site_name?: string;
  customer_name?: string;
}

export function LocationsPage() {
  const [units, setUnits] = useState<UnitWithLocation[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<UnitWithLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch units with location data
  useEffect(() => {
    async function fetchUnitsWithICCID() {
      setIsLoading(true);
      try {
        const unitsCollection = collection(db, "units");
        const snapshot = await getDocs(unitsCollection);
        
        console.log("Total units fetched:", snapshot.size);
        
        const allUnits = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Unnamed Unit",
            iccid: data.iccid || null,
            site_name: data.site_name,
            customer_name: data.customer_name
          };
        });
        
        // Filter units with ICCID
        const unitsWithLocation = allUnits.filter(unit => {
          if (!unit.iccid) {
            console.log(`Unit without ICCID: ${unit.name} (${unit.id})`);
            return false;
          }
          return true;
        });
        
        setUnits(unitsWithLocation);
        setFilteredUnits(unitsWithLocation);

        if (unitsWithLocation.length > 0) {
          toast.success(`Found ${unitsWithLocation.length} units with location data`);
        } else {
          toast.info("No units with location data found");
        }
      } catch (err) {
        console.error("Error fetching units:", err);
        setError("Failed to load units. Please try again later.");
        toast.error("Failed to load units data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUnitsWithICCID();
  }, []);

  // Filter units based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUnits(units);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const normalizedQuery = query.replace(/\s+/g, "");
    
    const filtered = units.filter(unit => {
      const nameMatch = unit.name?.toLowerCase().includes(query);
      const normalizedName = unit.name?.toLowerCase().replace(/\s+/g, "");
      const nameMatchNormalized = normalizedName?.includes(normalizedQuery);
      const siteMatch = unit.site_name?.toLowerCase().includes(query);
      const customerMatch = unit.customer_name?.toLowerCase().includes(query);
      const iccidMatch = unit.iccid?.toLowerCase().includes(query);
      
      return nameMatch || nameMatchNormalized || siteMatch || customerMatch || iccidMatch;
    });
    
    setFilteredUnits(filtered);
  }, [searchQuery, units]);
  
  const refreshUnits = async () => {
    toast.info("Refreshing units data...");
    setIsLoading(true);
    setSearchQuery("");
    
    try {
      const unitsCollection = collection(db, "units");
      const snapshot = await getDocs(unitsCollection);
      
      const allUnits = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Unnamed Unit",
          iccid: data.iccid || null,
          site_name: data.site_name,
          customer_name: data.customer_name
        };
      });
      
      const unitsWithLocation = allUnits.filter(unit => !!unit.iccid);
      
      setUnits(unitsWithLocation);
      setFilteredUnits(unitsWithLocation);
      toast.success(`Successfully refreshed ${unitsWithLocation.length} units`);
    } catch (err) {
      console.error("Error refreshing units:", err);
      toast.error("Failed to refresh units data");
    } finally {
      setIsLoading(false);
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <Card className="bg-spotify-darker">
      <CardContent className="p-6 text-center">
        <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">
          {units.length === 0 ? "No Units with Location Data" : "No matching units found"}
        </h3>
        <p className="text-gray-400 mb-4">
          {units.length === 0 
            ? "There are no units with ICCID identifiers available for location tracking."
            : "Try adjusting your search query to find units."}
        </p>
        {searchQuery && (
          <Button 
            onClick={() => setSearchQuery("")} 
            variant="outline" 
            className="bg-spotify-accent hover:bg-spotify-accent-hover text-white"
          >
            Clear Search
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fadeIn">
      <PageHeader 
        title="Units Location" 
        description="View geographic locations of all connected units"
        icon={MapPin}
      >
        <Button 
          onClick={refreshUnits} 
          variant="outline" 
          className="bg-spotify-darker text-white hover:bg-spotify-accent"
          disabled={isLoading}
        >
          Refresh Units
        </Button>
      </PageHeader>
      
      <SearchUnits searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Card className="bg-spotify-darker border-red-500/20">
          <CardContent className="p-6">
            <div className="text-red-400">{error}</div>
            <Button 
              onClick={refreshUnits} 
              className="mt-4 bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredUnits.length === 0 ? (
        renderEmptyState()
      ) : (
        <LocationsGrid units={filteredUnits} />
      )}
    </div>
  );
}
