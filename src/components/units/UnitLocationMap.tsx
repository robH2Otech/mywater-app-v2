
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UnitLocationMapProps {
  latitude: number;
  longitude: number;
  radius: number;
}

export function UnitLocationMap({ latitude, longitude, radius }: UnitLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      // Get Mapbox token from environment variable
      const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
      
      if (!mapboxToken) {
        throw new Error("Mapbox token not configured");
      }
      
      // Initialize the map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Dark theme to match app style
        center: [longitude, latitude],
        zoom: calculateZoom(radius),
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add a marker at the unit location
        marker.current = new mapboxgl.Marker({
          color: '#2563eb', // Blue color
        })
          .setLngLat([longitude, latitude])
          .addTo(map.current);
        
        // Add a source and layer for the accuracy circle
        map.current.addSource('unit-radius', {
          type: 'geojson',
          data: createGeoJSONCircle([longitude, latitude], radius)
        });
        
        map.current.addLayer({
          id: 'unit-radius-fill',
          type: 'fill',
          source: 'unit-radius',
          paint: {
            'fill-color': '#2563eb',
            'fill-opacity': 0.1,
          }
        });
        
        map.current.addLayer({
          id: 'unit-radius-line',
          type: 'line',
          source: 'unit-radius',
          paint: {
            'line-color': '#2563eb',
            'line-width': 2,
            'line-opacity': 0.6,
          }
        });
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(error instanceof Error ? error.message : "Failed to load map");
    }
    
    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude, radius]);
  
  // Calculate appropriate zoom level based on radius
  const calculateZoom = (radiusInMeters: number): number => {
    // Rough calculation to determine zoom level
    if (radiusInMeters > 10000) return 8;
    if (radiusInMeters > 5000) return 9;
    if (radiusInMeters > 1000) return 10;
    if (radiusInMeters > 500) return 12;
    if (radiusInMeters > 100) return 14;
    return 15;
  };
  
  // Create a GeoJSON circle
  const createGeoJSONCircle = (center: [number, number], radiusInMeters: number) => {
    const points = 64;
    const km = radiusInMeters / 1000;
    const distanceX = km / (111.320 * Math.cos(center[1] * Math.PI / 180));
    const distanceY = km / 110.574;
    
    const coordinates = [];
    
    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      
      coordinates.push([
        center[0] + x,
        center[1] + y
      ]);
    }
    
    // Close the circle
    coordinates.push(coordinates[0]);
    
    return {
      type: "Feature" as const,  // Fix: Use "Feature" as a const to satisfy TypeScript
      geometry: {
        type: "Polygon" as const,  // Fix: Use "Polygon" as a const to satisfy TypeScript
        coordinates: [coordinates]
      },
      properties: {}
    };
  };
  
  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertDescription>
            {mapError}. Please check if Mapbox token is properly configured.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="h-full w-full" />
      <div className="absolute bottom-2 right-2 bg-spotify-darker p-2 rounded text-xs text-gray-400">
        Accuracy radius: {radius}m
      </div>
    </div>
  );
}
