
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { LocationsHeader } from "@/components/locations/LocationsHeader";
import { SearchUnits } from "@/components/locations/SearchUnits";
import { LocationsGrid } from "@/components/locations/LocationsGrid";
import { EmptyLocations } from "@/components/locations/EmptyLocations";
import { useLocationsData } from "@/hooks/locations/useLocationsData";

const LocationsPage = () => {
  const {
    units,
    filteredUnits,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    refreshUnits
  } = useLocationsData();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6 animate-fadeIn">
        <LocationsHeader onRefresh={refreshUnits} isLoading={isLoading} />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 space-y-6 animate-fadeIn">
        <LocationsHeader onRefresh={refreshUnits} isLoading={isLoading} />
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fadeIn">
      <LocationsHeader onRefresh={refreshUnits} isLoading={isLoading} />
      <SearchUnits searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {filteredUnits.length === 0 ? (
        <EmptyLocations 
          totalUnits={units.length} 
          searchQuery={searchQuery} 
          onClearSearch={() => setSearchQuery("")} 
        />
      ) : (
        <LocationsGrid units={filteredUnits} />
      )}
    </div>
  );
};

export default LocationsPage;
