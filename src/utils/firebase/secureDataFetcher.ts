
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export interface SecureQueryOptions {
  userRole: string | null;
  company: string | null;
  collectionName: string;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Securely fetch data from Firestore with proper role-based access control
 * This ensures queries comply with Firestore security rules
 */
export async function secureDataFetch<T>({
  userRole,
  company,
  collectionName,
  orderByField,
  orderDirection = 'asc'
}: SecureQueryOptions): Promise<T[]> {
  console.log(`🔒 Secure fetch from ${collectionName} for role: ${userRole}, company: ${company}`);
  
  try {
    const collectionRef = collection(db, collectionName);
    
    // Build query based on user role and security rules
    let queryRef;
    
    if (userRole === 'superadmin') {
      // Superadmins can access all data
      queryRef = orderByField 
        ? query(collectionRef, orderBy(orderByField, orderDirection))
        : collectionRef;
    } else if (userRole === 'technician') {
      // Technicians can access all data but must query properly for security rules
      // The security rules allow technicians to read all data, but we need to structure the query correctly
      queryRef = orderByField 
        ? query(collectionRef, orderBy(orderByField, orderDirection))
        : collectionRef;
    } else {
      // Regular users and admins are filtered by company
      const userCompany = company || 'X-WATER';
      if (orderByField) {
        queryRef = query(
          collectionRef,
          where('company', '==', userCompany),
          orderBy(orderByField, orderDirection)
        );
      } else {
        queryRef = query(collectionRef, where('company', '==', userCompany));
      }
    }
    
    const snapshot = await getDocs(queryRef);
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
    
    console.log(`🔒 Successfully fetched ${results.length} records from ${collectionName}`);
    return results;
    
  } catch (error) {
    console.error(`🔒 Error fetching from ${collectionName}:`, error);
    
    // If we get permission errors, try a fallback approach for technicians
    if (userRole === 'technician' && error instanceof Error && error.message.includes('permission')) {
      console.log(`🔒 Attempting fallback query for technician access to ${collectionName}`);
      try {
        // For technicians, try querying without company filter as a fallback
        const collectionRef = collection(db, collectionName);
        const queryRef = orderByField 
          ? query(collectionRef, orderBy(orderByField, orderDirection))
          : collectionRef;
        
        const snapshot = await getDocs(queryRef);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        
        console.log(`🔒 Fallback successful: fetched ${results.length} records from ${collectionName}`);
        return results;
      } catch (fallbackError) {
        console.error(`🔒 Fallback also failed for ${collectionName}:`, fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
}

/**
 * Apply client-side filtering for additional security or UI requirements
 * This should only be used after secure server-side querying
 */
export function applyClientFiltering<T extends { company?: string }>(
  data: T[],
  userRole: string | null,
  userCompany: string | null
): T[] {
  if (userRole === 'superadmin' || userRole === 'technician') {
    return data; // These roles see all data
  }
  
  const filterCompany = userCompany || 'X-WATER';
  return data.filter(item => 
    !item.company || item.company === filterCompany
  );
}
