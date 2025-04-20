
import React, { useEffect, useRef } from 'react';
import { LocationData } from '@/utils/locations/locationData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';

interface UnitLocationMapProps {
  locationData: LocationData | null;
  isLoading: boolean;
}

export const UnitLocationMap: React.FC<UnitLocationMapProps> = ({ locationData, isLoading }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  
  useEffect(() => {
    // Return early if we're still loading or don't have data
    if (isLoading || !locationData || !mapRef.current) return;
    
    // Only initialize the map once
    if (!mapInstance.current) {
      console.log("Initializing map with location:", locationData);
      
      mapInstance.current = L.map(mapRef.current).setView(
        [locationData.latitude, locationData.longitude], 
        13
      );
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    } else {
      // If map already exists, just update the view
      mapInstance.current.setView(
        [locationData.latitude, locationData.longitude], 
        13
      );
    }
    
    // Add marker for unit location
    const marker = L.marker([locationData.latitude, locationData.longitude])
      .addTo(mapInstance.current);
      
    // Add circle to represent accuracy radius
    if (locationData.radius) {
      const circle = L.circle(
        [locationData.latitude, locationData.longitude], 
        {
          radius: locationData.radius,
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: 0.1,
          weight: 1
        }
      ).addTo(mapInstance.current);
    }
    
    // Clean up function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [locationData, isLoading]);
  
  return (
    <Card className="overflow-hidden">
      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !locationData ? (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-gray-400">No location data available</p>
        </div>
      ) : (
        <div ref={mapRef} className="h-[400px] w-full" />
      )}
    </Card>
  );
};
