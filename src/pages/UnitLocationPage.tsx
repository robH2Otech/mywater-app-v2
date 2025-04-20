
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
import { findUnitIdByIccid } from "@/utils/locations/verifyLocationUpdates";
import { toast } from "sonner";

export function UnitLocationPage() {
  const { iccid } = useParams<{ iccid: string }>();
  const navigate = useNavigate();
  
  console.log(`UnitLocationPage loaded with ICCID param: ${iccid}`);
  
  const [unitName, setUnitName] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [unitFetchError, setUnitFetchError] = useState<string | null>(null);
  const [unitFetched, setUnitFetched] = useState<boolean>(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    console.log(`[UnitLocation] ${message}`);
    setLogMessages(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };
  
  // Use our custom hooks
  const { isLoading: isLoadingLocation, locationData: freshLocationData, fetchLocationData, error: locationError } = use1oTLocation();
  const { isUpdating, updateUnitLocation } = useCloudLocationUpdate();
  
  // Fetch unit details from Firestore
  useEffect(() => {
    async function fetchUnitDetails() {
      if (!iccid) {
        setUnitFetchError("No ICCID provided");
        addLog("Error: No ICCID provided");
        return;
      }
      
      try {
        const normalizedIccid = iccid.replace(/\s+/g, '').trim();
        addLog(`Fetching unit details for normalized ICCID: ${normalizedIccid}`);
        
        // First, try to find unit ID from ICCID
        const foundUnitId = await findUnitIdByIccid(normalizedIccid);
        
        if (foundUnitId) {
          addLog(`Found unit ID: ${foundUnitId}`);
          // Fetch complete unit data
          const unitDoc = await getDoc(doc(db, "units", foundUnitId));
          
          if (unitDoc.exists()) {
            const unitData = unitDoc.data();
            setUnitName(unitData.name || "Unnamed Unit");
            setUnitId(foundUnitId);
            setUnitFetched(true);
            
            addLog(`Unit data retrieved: name=${unitData.name}, has location data: ${!!(unitData.lastKnownLatitude && unitData.lastKnownLongitude)}`);
            
            // Use existing location data if available
            if (unitData.lastKnownLatitude && unitData.lastKnownLongitude) {
              addLog(`Setting location data from unit document: ${unitData.lastKnownLatitude}, ${unitData.lastKnownLongitude}`);
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
            setUnitFetchError("Unit document not found");
            addLog("Error: Unit document not found");
          }
        } else {
          // If unit ID not found, try standard query approach
          addLog("Unit ID not found directly, trying query approach");
          const unitsRef = collection(db, "units");
          const q = query(unitsRef, where("iccid", "==", normalizedIccid), limit(1));
          const snapshot = await getDocs(q);
          
          if (snapshot.empty) {
            // Try a more flexible search approach
            addLog("No exact ICCID match found, trying partial match");
            const allUnitsRef = collection(db, "units");
            const allUnitsSnapshot = await getDocs(allUnitsRef);
            
            const matchingUnit = allUnitsSnapshot.docs.find(doc => {
              const unitData = doc.data();
              const unitIccid = unitData.iccid;
              if (!unitIccid) return false;
              
              return unitIccid.includes(normalizedIccid) || normalizedIccid.includes(unitIccid);
            });
            
            if (matchingUnit) {
              const unitData = matchingUnit.data();
              setUnitName(unitData.name || "Unnamed Unit");
              setUnitId(matchingUnit.id);
              setUnitFetched(true);
              addLog(`Found unit with partial ICCID match: ${matchingUnit.id}, ${unitData.name}`);
              
              // Use existing location data if available
              if (unitData.lastKnownLatitude && unitData.lastKnownLongitude) {
                addLog(`Setting location data from partial match: ${unitData.lastKnownLatitude}, ${unitData.lastKnownLongitude}`);
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
              addLog(`Error: No unit found with ICCID ${normalizedIccid} (either exact or partial match)`);
            }
          } else {
            const unitDoc = snapshot.docs[0];
            const unitData = unitDoc.data();
            setUnitName(unitData.name || "Unnamed Unit");
            setUnitId(unitDoc.id);
            setUnitFetched(true);
            addLog(`Found unit with exact ICCID match: ${unitDoc.id}, ${unitData.name}`);
            
            // Use existing location data if available
            if (unitData.lastKnownLatitude && unitData.lastKnownLongitude) {
              addLog(`Setting location data from exact match: ${unitData.lastKnownLatitude}, ${unitData.lastKnownLongitude}`);
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
        }
      } catch (err) {
        console.error("Error fetching unit details:", err);
        setUnitFetchError("Failed to fetch unit details");
        addLog(`Error fetching unit details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
    
    fetchUnitDetails();
  }, [iccid]);
  
  // Fetch fresh location data when unit is identified
  useEffect(() => {
    if (!iccid || !unitFetched) return;
    
    // Add slight delay to prevent race conditions
    const timer = setTimeout(() => {
      addLog(`Fetching fresh location data for ICCID: ${iccid}, has existing data: ${!!locationData}`);
      
      // Always try to get fresh data from cloud function
      handleRetryFetch();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [iccid, unitFetched, retryCount]);
  
  // Update state when fresh location data is received
  useEffect(() => {
    if (freshLocationData) {
      addLog(`Received fresh location data: ${JSON.stringify(freshLocationData)}`);
      setLocationData(freshLocationData);
    }
  }, [freshLocationData]);
  
  // Update error state when location error occurs
  useEffect(() => {
    if (locationError) {
      addLog(`Location error: ${locationError}`);
      setUnitFetchError(locationError);
    }
  }, [locationError]);
  
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
      addLog(`Manual location update request for unit ${unitId} with ICCID ${iccid}`);
      
      // Use real cloud function update
      const updatedLocation = await updateUnitLocation(unitId, iccid);
      if (updatedLocation) {
        addLog(`Location updated successfully: ${JSON.stringify(updatedLocation)}`);
        setLocationData(updatedLocation);
      } else if (!locationData) {
        // If cloud update failed and we don't have data, try 1oT direct fetch
        addLog(`Cloud update failed, trying direct 1oT fetch for ICCID ${iccid}`);
        const data = await fetchLocationData(iccid);
        if (data) {
          addLog(`Direct fetch successful: ${JSON.stringify(data)}`);
          setLocationData(data);
        } else {
          // If all else fails, increment retry counter to try again
          setRetryCount(prev => prev + 1);
          addLog("All location fetch attempts failed");
        }
      }
    } else if (iccid) {
      addLog(`Direct location fetch for ICCID ${iccid} (no unit ID)`);
      const data = await fetchLocationData(iccid);
      if (data) {
        addLog(`Direct fetch successful with no unit ID: ${JSON.stringify(data)}`);
        setLocationData(data);
      } else {
        // If direct fetch fails, increment retry counter
        setRetryCount(prev => prev + 1);
        addLog("Direct fetch failed with no unit ID");
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
      
      {/* Hidden debug logs for development */}
      {(window.location.hostname.includes('localhost') || window.location.hostname.includes('lovable')) && (
        <div className="mt-8 bg-gray-900 text-xs text-gray-300 p-4 rounded-lg opacity-50 hover:opacity-100 transition-opacity">
          <details>
            <summary className="cursor-pointer">Debug Logs ({logMessages.length})</summary>
            <pre className="mt-2 overflow-auto max-h-60">
              {logMessages.map((log, i) => (
                <div key={i} className="py-1">{log}</div>
              ))}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
