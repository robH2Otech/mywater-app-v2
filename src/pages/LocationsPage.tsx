
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { MapPin, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Input } from "@/components/ui/input";

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
        
        console.log("All units:", allUnits);
        
        // Filter units with ICCID, but log those without for debugging
        const unitsWithLocation = allUnits.filter(unit => {
          if (!unit.iccid) {
            console.log(`Unit without ICCID: ${unit.name} (${unit.id})`);
            return false;
          }
          return true;
        });
        
        console.log("Units with ICCID:", unitsWithLocation);
        setUnits(unitsWithLocation);
        setFilteredUnits(unitsWithLocation);
      } catch (err) {
        console.error("Error fetching units:", err);
        setError("Failed to load units. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUnitsWithICCID();
  }, []);

  // Improved search with comprehensive and lenient matching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUnits(units);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    console.log(`Searching for: "${query}"`);
    
    const filtered = units.filter(unit => {
      // Check if unit name contains the query
      const nameMatch = unit.name?.toLowerCase().includes(query);
      // Check if site name contains the query
      const siteMatch = unit.site_name?.toLowerCase().includes(query);
      // Check if customer name contains the query
      const customerMatch = unit.customer_name?.toLowerCase().includes(query);
      // Check if ICCID contains the query
      const iccidMatch = unit.iccid?.toLowerCase().includes(query);
      
      const isMatch = nameMatch || siteMatch || customerMatch || iccidMatch;
      
      // For debugging, log which field matched
      if (isMatch) {
        console.log(`Match found for unit "${unit.name}":`, { 
          nameMatch, siteMatch, customerMatch, iccidMatch 
        });
      }
      
      return isMatch;
    });
    
    console.log("Filtered units:", filtered);
    setFilteredUnits(filtered);
  }, [searchQuery, units]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fadeIn">
      <PageHeader 
        title="Units Location" 
        description="View geographic locations of all connected units"
        icon={MapPin}
      />
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search units by name, site, customer or ICCID..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 bg-spotify-darker text-white border-spotify-accent focus-visible:ring-spotify-accent"
        />
      </div>
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Card className="bg-spotify-darker border-red-500/20">
          <CardContent className="p-6">
            <div className="text-red-400">{error}</div>
          </CardContent>
        </Card>
      ) : filteredUnits.length === 0 ? (
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
                onClick={handleClearSearch} 
                variant="outline" 
                className="bg-spotify-accent hover:bg-spotify-accent-hover text-white"
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => (
            <Card key={unit.id} className="bg-spotify-darker hover:bg-spotify-dark transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{unit.name}</h3>
                    {unit.site_name && <p className="text-gray-300 text-sm">{unit.site_name}</p>}
                    {unit.customer_name && <p className="text-gray-400 text-xs mt-1">Customer: {unit.customer_name}</p>}
                    {unit.iccid && <p className="text-gray-400 text-xs mt-1">ICCID: {unit.iccid}</p>}
                  </div>
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
                <div className="mt-4 flex justify-end">
                  <Link to={`/locations/${unit.iccid}`}>
                    <Button variant="outline" className="bg-spotify-accent hover:bg-spotify-accent-hover text-white">
                      View Location
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
