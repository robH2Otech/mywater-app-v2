
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

interface UnitWithLocation {
  id: string;
  name: string;
  iccid: string | null;
  site_name?: string;
  customer_name?: string;
}

export function LocationsPage() {
  const [units, setUnits] = useState<UnitWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUnitsWithICCID() {
      setIsLoading(true);
      try {
        const unitsCollection = collection(db, "units");
        const snapshot = await getDocs(unitsCollection);
        
        const unitsWithLocation = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || "Unnamed Unit",
              iccid: data.iccid || null,
              site_name: data.site_name,
              customer_name: data.customer_name
            };
          })
          .filter(unit => unit.iccid); // Only include units with ICCID
        
        setUnits(unitsWithLocation);
      } catch (err) {
        console.error("Error fetching units:", err);
        setError("Failed to load units. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUnitsWithICCID();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fadeIn">
      <PageHeader 
        title="Unit Locations" 
        description="View geographic locations of all connected units"
        icon={MapPin}
      />
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Card className="bg-spotify-darker border-red-500/20">
          <CardContent className="p-6">
            <div className="text-red-400">{error}</div>
          </CardContent>
        </Card>
      ) : units.length === 0 ? (
        <Card className="bg-spotify-darker">
          <CardContent className="p-6 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Units with Location Data</h3>
            <p className="text-gray-400 mb-4">
              There are no units with ICCID identifiers available for location tracking.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <Card key={unit.id} className="bg-spotify-darker hover:bg-spotify-dark transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{unit.name}</h3>
                    {unit.site_name && <p className="text-gray-300 text-sm">{unit.site_name}</p>}
                    {unit.customer_name && <p className="text-gray-400 text-xs mt-1">Customer: {unit.customer_name}</p>}
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
