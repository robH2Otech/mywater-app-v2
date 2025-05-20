
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/integrations/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';

type UserRole = 'admin' | 'user';
type UserType = 'business' | 'private';

interface FirebaseAuthContextType {
  user: any | null;
  userRole: UserRole | null;
  userType: UserType | null;
  isLoading: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  userRole: null,
  userType: null,
  isLoading: true,
});

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user type and role from Firestore
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('uid', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserRole(userData.role as UserRole || 'user');
            setUserType('business');  // Default to business if in main users collection
          } else {
            // Check if user is in private users collection
            const privateUsersRef = collection(db, 'app_users_privat');
            const privateQuery = query(privateUsersRef, where('uid', '==', currentUser.uid));
            const privateSnapshot = await getDocs(privateQuery);
            
            if (!privateSnapshot.empty) {
              setUserType('private');
              setUserRole('user');  // Default role for private users
            } else {
              // User not found in any collection
              setUserType(null);
              setUserRole(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // No user signed in
        setUser(null);
        setUserRole(null);
        setUserType(null);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseAuthContext.Provider value={{ user, userRole, userType, isLoading }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => useContext(FirebaseAuthContext);
