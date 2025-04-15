
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

    // Helper function for debug logging
    const logMapInfo = (message: string) => {
      console.log(`[Map] ${message} - coords: ${latitude.toFixed(4)},${longitude.toFixed(4)}, radius: ${radius}m`);
    };

    try {
      // Clean up previous map instance if it exists
      if (map.current) {
        logMapInfo("Removing existing map");
        map.current.remove();
        map.current = null;
      }
      
      // Ensure we have valid coordinates
      if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
        throw new Error("Invalid map coordinates or radius");
      }
      
      logMapInfo("Initializing map");
      
      // Initialize the map with a slight delay to ensure container is ready
      setTimeout(() => {
        if (!mapContainer.current) {
          logMapInfo("Map container not found after timeout");
          return;
        }
        
        // Initialize the map
        map.current = L.map(mapContainer.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([latitude, longitude], calculateZoom(radius));

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map.current);

        // Create marker and circle
        const locationIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Add marker
        marker.current = L.marker([latitude, longitude], { icon: locationIcon }).addTo(map.current);
        
        // Add accuracy circle
        circle.current = L.circle([latitude, longitude], {
          radius: radius,
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map.current);

        // Add popup with coordinates info
        marker.current.bindPopup(`
          <b>${latitude.toFixed(6)}, ${longitude.toFixed(6)}</b><br>
          Accuracy: ${radius} meters
        `).openPopup();
        
        // Force a map resize after component mounts to fix display issues
        setTimeout(() => {
          if (map.current) {
            map.current.invalidateSize();
            logMapInfo("Map successfully resized and initialized");
          }
        }, 300);
      }, 100);
      
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (map.current) {
        logMapInfo("Cleaning up map on unmount");
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
