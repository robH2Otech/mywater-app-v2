
import { createContext, useContext, ReactNode, useState } from 'react';

type UserRole = 'admin' | 'user';
type UserType = 'business' | 'private';

interface FirebaseAuthContextType {
  user: any | null;
  userRole: UserRole | null;
  userType: UserType | null;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  userRole: null,
  userType: null,
});

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useState<any | null>(null);
  const [userRole] = useState<UserRole | null>('admin');
  const [userType] = useState<UserType | null>('business');

  return (
    <FirebaseAuthContext.Provider value={{ user, userRole, userType }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => useContext(FirebaseAuthContext);
