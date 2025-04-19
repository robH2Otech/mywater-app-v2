
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const verifyLocationUpdates = async (unitId: string): Promise<boolean> => {
  try {
    // Get the last 2 location history records for this unit
    const historyRef = collection(db, 'locationHistory');
    const historyQuery = query(
      historyRef,
      where('unitId', '==', unitId),
      orderBy('createdAt', 'desc'),
      limit(2)
    );
    
    const snapshot = await getDocs(historyQuery);
    
    if (snapshot.empty) {
      console.log('No location history found for unit:', unitId);
      return false;
    }
    
    // Log the timestamps to verify scheduled updates
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Location update ${index + 1}:`, {
        timestamp: data.createdAt?.toDate(),
        coords: {
          lat: data.latitude,
          lng: data.longitude
        }
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error verifying location updates:', error);
    return false;
  }
};
