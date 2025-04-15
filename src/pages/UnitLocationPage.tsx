
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UnitLocationMap } from "@/components/units/UnitLocationMap";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";

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
  const [unitName, setUnitName] = useState<string>(iccid || "");
  
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
        // Step 1: Get auth token
        const authResponse = await fetch("https://terminal.1ot.mobi/webapi/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "password",
            username: process.env.REACT_APP_ONE_OT_USERNAME || "",
            password: process.env.REACT_APP_ONE_OT_PASSWORD || "",
          }),
        });
        
        if (!authResponse.ok) {
          throw new Error(`Authentication failed: ${authResponse.statusText}`);
        }
        
        const authData: AuthResponse = await authResponse.json();
        
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
          throw new Error(`Failed to get diagnostics: ${diagnosticsResponse.statusText}`);
        }
        
        const diagnosticsData: DiagnosticsResponse = await diagnosticsResponse.json();
        
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
        
        // Try to fetch unit name from the database
        try {
          // This is a placeholder - in a real implementation, you'd fetch the unit name
          // from your database using the ICCID
          // Example: const unitData = await db.collection('units').where('iccid', '==', iccid).get();
          // setUnitName(unitData.name || iccid);
        } catch (unitError) {
          console.error("Failed to fetch unit name:", unitError);
          // Fall back to using ICCID
        }
        
      } catch (err) {
        console.error("Error fetching location data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLocation();
  }, [iccid]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6 animate-fadeIn">
      <PageHeader 
        title="Approximate Unit Location" 
        description={unitName ? `Location data for unit: ${unitName}` : "Location based on cell tower information"}
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
