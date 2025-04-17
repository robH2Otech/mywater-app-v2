
import { useState } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { doc, updateDoc, serverTimestamp, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { toast } from 'sonner';
import { LocationData } from '@/utils/locations/locationData';

export const useCloudLocationUpdate = () => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const functions = getFunctions();

  const updateUnitLocation = async (unitId: string, iccid: string): Promise<LocationData | null> => {
    if (!unitId || !iccid) {
      toast.error('Unit ID and ICCID are required to update location');
      return null;
    }

    setIsUpdating(true);
    try {
      const updateFn = httpsCallable<
        { unitId: string; iccid: string },
        { success: boolean; location: LocationData }
      >(functions, 'updateUnitLocation');

      toast.info('Requesting location data update...');

      const result = await updateFn({ unitId, iccid });
      
      if (result.data.success) {
        // Add client-side timestamp for immediate UI update
        const locationWithTimestamp = {
          ...result.data.location,
          timestamp: new Date().toISOString()
        };
        
        // Update the UI immediately
        toast.success('Location data updated successfully');
        
        // Also store in local history
        try {
          // Update the unit document with latest location
          const unitRef = doc(db, "units", unitId);
          await updateDoc(unitRef, {
            lastKnownLatitude: locationWithTimestamp.latitude,
            lastKnownLongitude: locationWithTimestamp.longitude,
            lastKnownRadius: locationWithTimestamp.radius,
            lastKnownCountry: locationWithTimestamp.lastCountry,
            lastKnownOperator: locationWithTimestamp.lastOperator,
            locationLastFetchedAt: serverTimestamp()
          });
          
          // Add to location history with TTL
          await addDoc(collection(db, "locationHistory"), {
            unitId,
            latitude: locationWithTimestamp.latitude,
            longitude: locationWithTimestamp.longitude, 
            radius: locationWithTimestamp.radius,
            lastCountry: locationWithTimestamp.lastCountry,
            lastOperator: locationWithTimestamp.lastOperator,
            createdAt: serverTimestamp(),
            expireAt: Timestamp.fromMillis(Date.now() + (24 * 60 * 60 * 1000))
          });
        } catch (err) {
          console.error("Error updating local location data:", err);
          // This is non-critical as the cloud function already updated the data
        }
        
        return locationWithTimestamp;
      } else {
        toast.error('Failed to update location data');
        return null;
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(`Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateUnitLocation
  };
};
