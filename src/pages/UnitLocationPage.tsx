
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UnitLocationMap } from "@/components/units/UnitLocationMap";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { use1oTLocation, LocationData } from "@/hooks/locations/use1oTLocation";
import { toast } from "sonner";

export function UnitLocationPage() {
  const { iccid } = useParams<{ iccid: string }>();
  const navigate = useNavigate();
  
  const [unitName, setUnitName] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [unitFetchError, setUnitFetchError] = useState<string | null>(null);
  const [unitFetched, setUnitFetched] = useState<boolean>(false);
  
  // Use our custom hook for location data
  const { isLoading, error, locationData, fetchLocationData } = use1oTLocation();
  
  // Fetch unit details from Firestore
  useEffect(() => {
    async function fetchUnitDetails() {
      if (!iccid) {
        setUnitFetchError("No ICCID provided");
        return;
      }
      
      try {
        console.log(`Fetching unit details for ICCID: ${iccid}`);
        const unitsRef = collection(db, "units");
        const q = query(unitsRef, where("iccid", "==", iccid), limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // Try a more flexible search approach by using array-contains or startsWith
          console.log("No exact match found, trying flexible search");
          const allUnitsRef = collection(db, "units");
          const allUnitsSnapshot = await getDocs(allUnitsRef);
          
          // Search for units with ICCID that includes our search ICCID or vice versa
          const matchingUnit = allUnitsSnapshot.docs.find(doc => {
            const unitData = doc.data();
            const unitIccid = unitData.iccid;
            if (!unitIccid) return false;
            
            return unitIccid.includes(iccid) || iccid.includes(unitIccid);
          });
          
          if (matchingUnit) {
            const unitData = matchingUnit.data();
            setUnitName(unitData.name || "Unnamed Unit");
            setUnitId(matchingUnit.id);
            console.log(`Found unit with similar ICCID: ${unitData.name} (${matchingUnit.id})`);
            setUnitFetched(true);
            return;
          }
          
          console.log("No matching unit found in Firestore");
          setUnitFetchError("Unit not found with the provided ICCID");
        } else {
          const unitDoc = snapshot.docs[0];
          const unitData = unitDoc.data();
          setUnitName(unitData.name || "Unnamed Unit");
          setUnitId(unitDoc.id);
          console.log(`Found unit: ${unitData.name} (${unitDoc.id})`);
          setUnitFetched(true);
        }
      } catch (err) {
        console.error("Error fetching unit details:", err);
        setUnitFetchError("Failed to fetch unit details");
      }
    }
    
    fetchUnitDetails();
  }, [iccid]);
  
  // Fetch location data when ICCID is available and unit is fetched
  useEffect(() => {
    if (iccid && unitFetched) {
      console.log("Unit fetched, requesting location data");
      // Add a small delay to ensure UI is rendered first
      setTimeout(() => {
        fetchLocationData(iccid);
      }, 300);
    } else if (iccid && !unitFetched && !unitFetchError) {
      // If we couldn't find the unit but have an ICCID, try to fetch location anyway
      console.log("Unit not found but trying location data fetch with ICCID");
      setTimeout(() => {
        fetchLocationData(iccid);
      }, 300);
    }
  }, [iccid, unitFetched, unitFetchError, fetchLocationData]);
  
  // Handle navigation back to appropriate location
  const handleBack = () => {
    if (unitId) {
      navigate(`/units/${unitId}`);
    } else {
      navigate("/locations");
    }
  };
  
  // Handle retrying location fetch
  const handleRetryFetch = () => {
    if (iccid) {
      toast.info("Retrying location data fetch...");
      fetchLocationData(iccid);
    }
  };
  
  const displayName = unitName || iccid || "Unknown Unit";
  const displayError = unitFetchError || error;
  
  return (
    <div className="container mx-auto p-4 space-y-6 animate-fadeIn">
      <PageHeader 
        title="Unit Location" 
        description={`Location data for unit: ${displayName}`}
        icon={MapPin}
      >
        <Button 
          onClick={handleBack} 
          variant="outline"
          className="text-white bg-spotify-accent hover:bg-spotify-accent-hover"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </PageHeader>
      
      {isLoading || (!unitFetched && !unitFetchError) ? (
        <LoadingSkeleton />
      ) : displayError && !locationData ? (
        <Card className="bg-spotify-darker border-red-500/20">
          <CardContent className="p-6">
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/30 text-red-200">
              <AlertDescription className="text-red-200">
                {displayError}
              </AlertDescription>
            </Alert>
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleRetryFetch}
                className="bg-spotify-accent hover:bg-spotify-accent-hover flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Button 
                onClick={handleBack} 
                variant="outline"
                className="border-spotify-accent text-spotify-accent hover:bg-spotify-accent/10"
              >
                Return to {unitId ? "Unit Details" : "Locations"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : locationData ? (
        <div className="space-y-6">
          <Card className="bg-spotify-darker">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-spotify-accent/20 border border-spotify-accent/20">
                  <h3 className="text-sm font-medium text-gray-400">Latitude</h3>
                  <p className="text-xl font-bold text-white mt-1">{locationData.latitude.toFixed(6)}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-spotify-accent/20 border border-spotify-accent/20">
                  <h3 className="text-sm font-medium text-gray-400">Longitude</h3>
                  <p className="text-xl font-bold text-white mt-1">{locationData.longitude.toFixed(6)}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-spotify-accent/20 border border-spotify-accent/20">
                  <h3 className="text-sm font-medium text-gray-400">Accuracy Radius</h3>
                  <p className="text-xl font-bold text-white mt-1">{locationData.radius} meters</p>
                </div>
              </div>
              
              {locationData.lastCountry && locationData.lastOperator && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-lg bg-spotify-accent/10 border border-spotify-accent/10">
                    <h3 className="text-sm font-medium text-gray-400">Country</h3>
                    <p className="text-md font-medium text-white mt-1">{locationData.lastCountry}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-spotify-accent/10 border border-spotify-accent/10">
                    <h3 className="text-sm font-medium text-gray-400">Network Operator</h3>
                    <p className="text-md font-medium text-white mt-1">{locationData.lastOperator}</p>
                  </div>
                </div>
              )}
              
              {locationData.timestamp && (
                <p className="text-xs text-gray-400">
                  Location data captured at: {new Date(locationData.timestamp).toLocaleString()}
                </p>
              )}
              
              <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-md">
                <p className="text-sm text-gray-300">
                  <strong>Note:</strong> Location is approximate, based on cell tower information.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleRetryFetch}
                  variant="outline" 
                  className="flex items-center gap-2 border-spotify-accent text-spotify-accent hover:bg-spotify-accent/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Location
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="h-[60vh] relative rounded-lg overflow-hidden">
            <UnitLocationMap 
              latitude={locationData.latitude} 
              longitude={locationData.longitude} 
              radius={locationData.radius} 
            />
          </div>
        </div>
      ) : (
        <Card className="bg-spotify-darker border-yellow-500/20">
          <CardContent className="p-6">
            <p className="text-yellow-300">No location data available for this unit.</p>
            <Button 
              onClick={handleBack} 
              className="mt-4 bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              Return to {unitId ? "Unit Details" : "Locations"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
