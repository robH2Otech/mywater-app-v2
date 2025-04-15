
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UnitLocationMap } from "@/components/units/UnitLocationMap";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { toast } from "sonner";

interface LocationData {
  latitude: number;
  longitude: number;
  radius: number;
  cellId?: string;
  timestamp?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface DiagnosticsResponse {
  location?: {
    lat: number;
    lng: number;
    radius: number;
    cellId: string;
    timestamp: string;
  };
  status?: string;
  message?: string;
}

export function UnitLocationPage() {
  const { iccid } = useParams<{ iccid: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [unitName, setUnitName] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  
  // Fetch unit details from Firestore using the ICCID
  useEffect(() => {
    async function fetchUnitDetails() {
      if (!iccid) return;
      
      try {
        console.log(`Fetching unit details for ICCID: ${iccid}`);
        // Query Firestore to find the unit with matching ICCID
        const unitsRef = db.collection("units");
        const snapshot = await unitsRef.where("iccid", "==", iccid).limit(1).get();
        
        if (snapshot.empty) {
          console.log("No matching unit found in Firestore");
          // No need to set an error, we'll just use the ICCID as the unit name
        } else {
          const unitDoc = snapshot.docs[0];
          const unitData = unitDoc.data();
          setUnitName(unitData.name || "");
          setUnitId(unitDoc.id);
          console.log(`Found unit: ${unitData.name} (${unitDoc.id})`);
        }
      } catch (err) {
        console.error("Error fetching unit details:", err);
        // Don't set an error state here, we'll still try to fetch location
      }
    }
    
    fetchUnitDetails();
  }, [iccid]);
  
  useEffect(() => {
    async function fetchLocation() {
      setIsLoading(true);
      setError(null);
      
      if (!iccid) {
        setError("No ICCID provided");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching location for ICCID: ${iccid}`);
        
        // Step 1: Get auth token
        const username = process.env.REACT_APP_ONE_OT_USERNAME;
        const password = process.env.REACT_APP_ONE_OT_PASSWORD;
        
        if (!username || !password) {
          throw new Error("1oT API credentials not configured");
        }
        
        const authResponse = await fetch("https://terminal.1ot.mobi/webapi/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "password",
            username,
            password,
          }),
        });
        
        if (!authResponse.ok) {
          const errorText = await authResponse.text();
          console.error("Auth response error:", errorText);
          throw new Error(`Authentication failed: ${authResponse.statusText}`);
        }
        
        const authData: AuthResponse = await authResponse.json();
        console.log("Authentication successful");
        
        // Step 2: Get diagnostics with the token
        const diagnosticsResponse = await fetch(
          `https://terminal.1ot.mobi/webapi/diagnostics?iccid=${iccid}`,
          {
            headers: {
              Authorization: `Bearer ${authData.access_token}`,
            },
          }
        );
        
        if (!diagnosticsResponse.ok) {
          const errorText = await diagnosticsResponse.text();
          console.error("Diagnostics response error:", errorText);
          throw new Error(`Failed to get diagnostics: ${diagnosticsResponse.statusText}`);
        }
        
        const diagnosticsData: DiagnosticsResponse = await diagnosticsResponse.json();
        console.log("Diagnostics data:", diagnosticsData);
        
        if (!diagnosticsData.location) {
          throw new Error("Location data not available for this unit");
        }
        
        setLocationData({
          latitude: diagnosticsData.location.lat,
          longitude: diagnosticsData.location.lng,
          radius: diagnosticsData.location.radius,
          cellId: diagnosticsData.location.cellId,
          timestamp: diagnosticsData.location.timestamp,
        });
        
        toast.success("Location data loaded successfully");
        
      } catch (err) {
        console.error("Error fetching location data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        toast.error("Failed to load location data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLocation();
  }, [iccid]);
  
  const handleBack = () => {
    if (unitId) {
      navigate(`/units/${unitId}`);
    } else {
      navigate("/units");
    }
  };
  
  const displayName = unitName || iccid || "Unknown Unit";
  
  return (
    <div className="container mx-auto p-4 space-y-6 animate-fadeIn">
      <PageHeader 
        title="Approximate Unit Location" 
        description={`Location data for unit: ${displayName}`}
        icon={MapPin}
      >
        <Button 
          onClick={handleBack} 
          variant="outline"
          className="text-white bg-spotify-accent hover:bg-spotify-accent-hover"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Unit
        </Button>
      </PageHeader>
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Card className="bg-spotify-darker border-red-500/20">
          <CardContent className="p-6">
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/30 text-red-200">
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleBack} 
              className="mt-4 bg-spotify-accent hover:bg-spotify-accent-hover"
            >
              Return to Unit Details
            </Button>
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
              Return to Unit Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
