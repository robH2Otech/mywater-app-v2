
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { use1oTLocation } from "@/hooks/locations/use1oTLocation";
import { useCloudLocationUpdate } from "@/hooks/locations/useCloudLocationUpdate";
import { UnitLocationDisplay } from "@/components/locations/UnitLocationDisplay";
import { LocationData } from "@/utils/locations/locationData";

export function UnitLocationPage() {
  const { iccid } = useParams<{ iccid: string }>();
  const navigate = useNavigate();
  
  const [unitName, setUnitName] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [unitFetchError, setUnitFetchError] = useState<string | null>(null);
  const [unitFetched, setUnitFetched] = useState<boolean>(false);
  const [storedLocationData, setStoredLocationData] = useState<LocationData | null>(null);
  
  // Use our custom hooks
  const { isLoading: isLoadingLocation, error: locationError, locationData, fetchLocationData } = use1oTLocation();
  const { isUpdating, updateUnitLocation } = useCloudLocationUpdate();
  
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
          // Try a more flexible search approach
          const allUnitsRef = collection(db, "units");
          const allUnitsSnapshot = await getDocs(allUnitsRef);
          
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
            setUnitFetched(true);
            
            // Check for existing location data
            if (unitData.lastKnownLatitude && unitData.lastKnownLongitude) {
              setStoredLocationData({
                latitude: unitData.lastKnownLatitude,
                longitude: unitData.lastKnownLongitude,
                radius: unitData.lastKnownRadius || 500,
                lastCountry: unitData.lastKnownCountry,
                lastOperator: unitData.lastKnownOperator,
                timestamp: unitData.locationLastFetchedAt ? 
                  new Date(unitData.locationLastFetchedAt.toDate()).toISOString() : 
                  new Date().toISOString()
              });
            }
          } else {
            setUnitFetchError("Unit not found with the provided ICCID");
          }
        } else {
          const unitDoc = snapshot.docs[0];
          const unitData = unitDoc.data();
          setUnitName(unitData.name || "Unnamed Unit");
          setUnitId(unitDoc.id);
          setUnitFetched(true);
          
          // Check for existing location data
          if (unitData.lastKnownLatitude && unitData.lastKnownLongitude) {
            setStoredLocationData({
              latitude: unitData.lastKnownLatitude,
              longitude: unitData.lastKnownLongitude,
              radius: unitData.lastKnownRadius || 500,
              lastCountry: unitData.lastKnownCountry,
              lastOperator: unitData.lastKnownOperator,
              timestamp: unitData.locationLastFetchedAt ? 
                new Date(unitData.locationLastFetchedAt.toDate()).toISOString() : 
                new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.error("Error fetching unit details:", err);
        setUnitFetchError("Failed to fetch unit details");
      }
    }
    
    fetchUnitDetails();
  }, [iccid]);
  
  // Fetch location data when unit is identified only if no stored data
  useEffect(() => {
    if (iccid && unitFetched && !storedLocationData) {
      setTimeout(() => {
        fetchLocationData(iccid);
      }, 300);
    } else if (iccid && !unitFetched && !unitFetchError && !storedLocationData) {
      setTimeout(() => {
        fetchLocationData(iccid);
      }, 300);
    }
  }, [iccid, unitFetched, unitFetchError, storedLocationData, fetchLocationData]);
  
  // Navigation handler
  const handleBack = () => {
    if (unitId) {
      navigate(`/units/${unitId}`);
    } else {
      navigate("/locations");
    }
  };
  
  // Update location handler
  const handleRetryFetch = async () => {
    if (unitId && iccid) {
      // Use cloud function if available
      const updatedLocation = await updateUnitLocation(unitId, iccid);
      if (updatedLocation) {
        setStoredLocationData(updatedLocation);
        return;
      }
      // Fall back to client-side fetching
      const data = await fetchLocationData(iccid);
      if (data) {
        setStoredLocationData(data);
      }
    } else if (iccid) {
      // Just use client-side fetching
      const data = await fetchLocationData(iccid);
      if (data) {
        setStoredLocationData(data);
      }
    }
  };
  
  const displayName = unitName || iccid || "Unknown Unit";
  const displayError = unitFetchError || locationError;
  const isUpdatingLocation = isLoadingLocation || isUpdating;
  
  // Determine which location data to display
  const displayLocationData = storedLocationData || locationData;
  
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
      
      {isUpdatingLocation || (!unitFetched && !unitFetchError && !displayLocationData) ? (
        <LoadingSkeleton />
      ) : displayError && !displayLocationData ? (
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
      ) : displayLocationData ? (
        <>
          <UnitLocationDisplay 
            locationData={displayLocationData}
            onRefresh={handleRetryFetch}
            isLoading={isUpdatingLocation}
          />
          {storedLocationData && (
            <Card className="bg-spotify-darker">
              <CardContent className="p-4 text-sm text-gray-400 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-spotify-accent" />
                Location data is stored for 24 hours and then automatically refreshed.
              </CardContent>
            </Card>
          )}
        </>
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
