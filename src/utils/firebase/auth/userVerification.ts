
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  setDoc, 
  getDoc
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

/**
 * Verify if user exists in private users collection
 */
export const verifyPrivateUser = async (uid: string): Promise<boolean> => {
  try {
    console.log("Verifying private user with UID:", uid);
    
    if (!uid) {
      console.error("Invalid UID provided for verification");
      return false;
    }
    
    // First try getting the user directly by UID as document ID (most efficient)
    try {
      // The correct collection name is "app_users_privat" in Firebase
      const userDocRef = doc(db, "app_users_privat", uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        console.log("User found by direct UID lookup");
        return true;
      }
    } catch (error) {
      console.log("Direct UID lookup failed, falling back to query");
    }
    
    // Check if user exists in app_users_privat collection using a query
    // The correct collection name is "app_users_privat" in Firebase
    const privateUsersRef = collection(db, "app_users_privat");
    const q = query(privateUsersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log("User found in app_users_privat collection by query");
      
      // For performance reasons, we should update the document ID to match the UID
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // If the document ID is not the same as UID, create a new document with UID as ID
      if (userDoc.id !== uid) {
        console.log("Updating user document to use UID as document ID");
        await setDoc(doc(db, "app_users_privat", uid), {
          ...userData,
          updated_at: new Date()
        });
      }
      
      return true;
    }
    
    // Check old collection as fallback
    const oldPrivateUsersRef = collection(db, "private_users");
    const oldQuery = query(oldPrivateUsersRef, where("uid", "==", uid));
    const oldSnapshot = await getDocs(oldQuery);
    
    if (!oldSnapshot.empty) {
      console.log("User found in old private_users collection, migrating...");
      // Migrate to new collection - use UID as document ID for easier retrieval
      const userData = oldSnapshot.docs[0].data();
      await setDoc(doc(db, "app_users_privat", uid), {
        ...userData,
        migrated_at: new Date(),
        updated_at: new Date()
      });
      return true;
    }
    
    console.log("User not found in any collection");
    return false;
  } catch (error) {
    console.error("Error verifying private user:", error);
    return false;
  }
};
