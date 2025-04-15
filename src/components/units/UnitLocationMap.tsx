
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UnitLocationMapProps {
  latitude: number;
  longitude: number;
  radius: number;
}

export function UnitLocationMap({ latitude, longitude, radius }: UnitLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const circle = useRef<L.Circle | null>(null);
  const marker = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Initialize the map if it hasn't been initialized yet
      if (!map.current) {
        map.current = L.map(mapContainer.current).setView([latitude, longitude], calculateZoom(radius));

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map.current);

        // Create marker and circle
        marker.current = L.marker([latitude, longitude]).addTo(map.current);
        circle.current = L.circle([latitude, longitude], {
          radius: radius,
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map.current);
      } else {
        // Update marker and circle positions
        marker.current?.setLatLng([latitude, longitude]);
        circle.current?.setLatLng([latitude, longitude]).setRadius(radius);
        map.current.setView([latitude, longitude], calculateZoom(radius));
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, radius]);

  // Calculate appropriate zoom level based on radius
  const calculateZoom = (radiusInMeters: number): number => {
    if (radiusInMeters > 10000) return 8;
    if (radiusInMeters > 5000) return 9;
    if (radiusInMeters > 1000) return 10;
    if (radiusInMeters > 500) return 12;
    if (radiusInMeters > 100) return 14;
    return 15;
  };

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="h-full w-full" />
      <div className="absolute bottom-2 right-2 bg-spotify-darker p-2 rounded text-xs text-gray-400">
        Accuracy radius: {radius}m
      </div>
    </div>
  );
}
