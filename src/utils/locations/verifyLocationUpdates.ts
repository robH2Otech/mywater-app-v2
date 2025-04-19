
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const verifyLocationUpdates = async (unitId: string): Promise<boolean> => {
  try {
    console.log(`Verifying location updates for unit: ${unitId}`);
    
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
    const updates = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      const timestamp = data.createdAt?.toDate();
      return {
        index: index + 1,
        timestamp: timestamp ? timestamp.toISOString() : 'Unknown',
        coords: {
          lat: data.latitude,
          lng: data.longitude
        },
        radius: data.radius || 0,
        country: data.lastCountry || 'Unknown'
      };
    });
    
    console.log(`Found ${updates.length} location updates for unit ${unitId}:`, updates);
    return true;
  } catch (error) {
    console.error('Error verifying location updates:', error);
    return false;
  }
};
