
import { useCallback } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { PrivateUser } from "@/types/privateUser";
import { convertFirestoreDates } from "@/utils/firestore/firestoreUtils";

export function useFirestoreUserData() {
  const fetchUserData = useCallback(async (uid: string): Promise<PrivateUser | null> => {
    try {
      console.log("Fetching user data for UID:", uid);
      
      // Try to get user data directly by UID
      // Using the correct collection name "app_users_privat" to match Firebase
      const userDocRef = doc(db, "app_users_privat", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log("User document found by ID:", userDoc.id);
        console.log("Raw user data:", userDoc.data());
        
        // Convert data with dates
        const userData = convertFirestoreDates(userDoc.data(), [
          'purchase_date',
          'cartridge_replacement_date',
          'created_at',
          'updated_at'
        ]);
        
        // Check for referral code
        if (!userData.referral_code) {
          console.log("No referral_code found in user data, trying to fetch from referral_codes collection...");
          
          // Try to fetch from referral_codes collection
          const referralQuery = query(
            collection(db, "referral_codes"),
            where("user_id", "==", uid)
          );
          
          const referralSnapshot = await getDocs(referralQuery);
          
          if (!referralSnapshot.empty) {
            const referralDoc = referralSnapshot.docs[0].data();
            console.log("Found referral code:", referralDoc.code);
            userData.referral_code = referralDoc.code;
          }
        }
        
        return {
          id: userDoc.id,
          uid,
          ...userData
        } as PrivateUser;
      } 
      
      console.log("User document not found by ID, trying query");
      
      // Fallback to query if not found by ID
      const userQuery = query(
        collection(db, "app_users_privat"),
        where("uid", "==", uid)
      );
      
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        console.error("No user data found for uid:", uid);
        return null;
      }
      
      console.log("User found via query:", userSnapshot.docs[0].id);
      
      // Convert data with dates
      const docData = userSnapshot.docs[0].data();
      console.log("Raw user data from query:", docData);
      
      const userData = convertFirestoreDates(docData, [
        'purchase_date',
        'cartridge_replacement_date',
        'created_at',
        'updated_at'
      ]);
      
      // Check for referral code
      if (!userData.referral_code) {
        console.log("No referral_code found in user data from query, trying to fetch from referral_codes collection...");
        
        // Try to fetch from referral_codes collection
        const referralQuery = query(
          collection(db, "referral_codes"),
          where("user_id", "==", uid)
        );
        
        const referralSnapshot = await getDocs(referralQuery);
        
        if (!referralSnapshot.empty) {
          const referralDoc = referralSnapshot.docs[0].data();
          console.log("Found referral code:", referralDoc.code);
          userData.referral_code = referralDoc.code;
        }
      }
      
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
