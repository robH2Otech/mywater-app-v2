
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { use1oTLocation } from "@/hooks/locations/use1oTLocation";
import { useCloudLocationUpdate } from "@/hooks/locations/useCloudLocationUpdate";
import { UnitLocationDisplay } from "@/components/locations/UnitLocationDisplay";
import { LocationData } from "@/utils/locations/locationData";
import { UnitLocationHeader } from "@/components/locations/UnitLocationHeader";
import { UnitLocationInfo } from "@/components/locations/UnitLocationInfo";
import { NoLocationData } from "@/components/locations/NoLocationData";
import { toast } from "sonner";

export function UnitLocationPage() {
  const { iccid } = useParams<{ iccid: string }>();
  const navigate = useNavigate();
  
  const [unitName, setUnitName] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [unitFetchError, setUnitFetchError] = useState<string | null>(null);
  const [unitFetched, setUnitFetched] = useState<boolean>(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  
  // Use our custom hooks
  const { isLoading: isLoadingLocation, locationData: freshLocationData, fetchLocationData } = use1oTLocation();
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
          console.log("No exact ICCID match found, trying partial match");
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
            
            // Use existing location data if available
            if (unitData.lastKnownLatitude && unitData.lastKnownLongitude) {
              setLocationData({
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
          
          // Use existing location data if available
          if (unitData.lastKnownLatitude && unitData.lastKnownLongitude) {
            setLocationData({
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
  
  // Fetch fresh location data when unit is identified only if no stored data
  useEffect(() => {
    if (iccid && unitFetched && !locationData) {
      // Add slight delay to prevent race conditions
      const timer = setTimeout(() => {
        console.log("Fetching fresh location data for:", iccid);
        fetchLocationData(iccid);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [iccid, unitFetched, locationData, fetchLocationData]);
  
  // Update state when fresh location data is received
  useEffect(() => {
    if (freshLocationData) {
      setLocationData(freshLocationData);
    }
  }, [freshLocationData]);
  
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
      toast.info("Requesting location update...");
      // Use real cloud function update
      const updatedLocation = await updateUnitLocation(unitId, iccid);
      if (updatedLocation) {
        setLocationData(updatedLocation);
      }
    } else if (iccid) {
      const data = await fetchLocationData(iccid);
      if (data) {
        setLocationData(data);
      }
    }
  };
  
  const displayName = unitName || iccid || "Unknown Unit";
  const displayError = unitFetchError;
  const isUpdatingLocation = isLoadingLocation || isUpdating;
  
  return (
    <div className="container mx-auto p-4 space-y-6 animate-fadeIn">
      <UnitLocationHeader displayName={displayName} onBack={handleBack} />
      
      {isUpdatingLocation && !locationData ? (
        <LoadingSkeleton />
      ) : displayError && !locationData ? (
        <UnitLocationInfo 
          displayError={displayError}
          onRetryFetch={handleRetryFetch}
          onBack={handleBack}
          unitId={unitId}
        />
      ) : locationData ? (
        <UnitLocationDisplay 
          locationData={locationData}
          onRefresh={handleRetryFetch}
          isLoading={isUpdatingLocation}
        />
      ) : (
        <NoLocationData onBack={handleBack} unitId={unitId} />
      )}
    </div>
  );
}
