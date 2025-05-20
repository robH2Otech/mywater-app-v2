
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  userType?: 'business' | 'private';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { user, userType: currentUserType } = useFirebaseAuth();

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If userType is specified and doesn't match the logged in user's type
  if (userType && currentUserType !== userType) {
    // Redirect business users to business dashboard, private users to private dashboard
    const redirectPath = currentUserType === 'business' ? '/dashboard' : '/private-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
