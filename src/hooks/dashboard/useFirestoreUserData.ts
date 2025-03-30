
import { useCallback } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { PrivateUser } from "@/types/privateUser";
import { convertFirestoreDates } from "@/utils/firestore/firestoreUtils";

export function useFirestoreUserData() {
  const fetchUserData = useCallback(async (uid: string): Promise<PrivateUser | null> => {
    try {
      // Try to get user data directly by UID
      // Using the correct collection name "app_users_privat" to match Firebase
      const userDocRef = doc(db, "app_users_privat", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Convert data with dates
        const userData = convertFirestoreDates(userDoc.data(), [
          'purchase_date',
          'cartridge_replacement_date',
          'created_at',
          'updated_at'
        ]);
        
        return {
          id: userDoc.id,
          uid,
          ...userData
        } as PrivateUser;
      } 
      
      // Fallback to query if not found by ID
      const userQuery = query(
        collection(db, "app_users_privat"),
        where("uid", "==", uid)
      );
      
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        console.error("No user data found");
        return null;
      }
      
      // Convert data with dates
      const docData = userSnapshot.docs[0].data();
      const userData = convertFirestoreDates(docData, [
        'purchase_date',
        'cartridge_replacement_date',
        'created_at',
        'updated_at'
      ]);
      
      return {
        id: userSnapshot.docs[0].id,
        ...userData
      } as PrivateUser;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }, []);

  return { fetchUserData };
}
