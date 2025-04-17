
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { LocationData } from '@/utils/locations/locationData';

interface LocationHistoryItem extends LocationData {
  createdAt: Date;
}

export const useLocationHistory = (unitId: string, limitCount: number = 10) => {
  const [history, setHistory] = useState<LocationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocationHistory = async () => {
    if (!unitId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching location history for unit ${unitId}, limit ${limitCount}`);
      const historyRef = collection(db, 'locationHistory');
      const historyQuery = query(
        historyRef,
        where('unitId', '==', unitId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(historyQuery);
      
      if (snapshot.empty) {
        console.log(`No location history found for unit ${unitId}`);
        setHistory([]);
        return;
      }
      
      console.log(`Found ${snapshot.docs.length} location history records for unit ${unitId}`);
      
      const historyData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          radius: data.radius || 0,
          lastCountry: data.lastCountry,
          lastOperator: data.lastOperator,
          timestamp: data.createdAt?.toDate().toISOString(),
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });
      
      setHistory(historyData);
    } catch (err) {
      console.error('Error fetching location history:', err);
      setError('Failed to load location history');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (unitId) {
      fetchLocationHistory();
    }
  }, [unitId]);
  
  return {
    history,
    isLoading,
    error,
    refreshHistory: fetchLocationHistory
  };
};
