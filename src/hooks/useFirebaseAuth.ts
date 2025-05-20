
import { useState, useEffect } from 'react';
import { auth, db } from '@/integrations/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { UserRole } from '@/types/users';

interface FirebaseAuthState {
  user: FirebaseUser | null;
  userRole: UserRole | null;
  isLoading: boolean;
  error: Error | null;
}

export function useFirebaseAuth(): FirebaseAuthState {
  const [authState, setAuthState] = useState<FirebaseAuthState>({
    user: null,
    userRole: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setAuthState({
          user: null,
          userRole: null,
          isLoading: false,
          error: null
        });
        return;
      }

      try {
        // Get the user's role from Firestore
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('id', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        let role: UserRole = "user"; // Default role
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          role = userData.role as UserRole || "user";
        }

        setAuthState({
          user,
          userRole: role,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setAuthState({
          user,
          userRole: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error')
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
}
