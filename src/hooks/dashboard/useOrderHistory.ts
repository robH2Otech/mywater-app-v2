
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { Order } from '@/types/privateUser';
import { convertFirestoreDates } from '@/utils/firestore/firestoreUtils';

export function useOrderHistory(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('user_id', '==', userId),
          orderBy('created_at', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const orderData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...convertFirestoreDates(data, ['created_at']),
            id: doc.id
          } as Order;
        });

        setOrders(orderData);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, loading, error };
}
