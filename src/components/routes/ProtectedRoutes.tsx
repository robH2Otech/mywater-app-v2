
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  userType?: 'business' | 'private';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { user, userType: currentUserType, isLoading } = useFirebaseAuth();

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mywater-blue"></div>
      </div>
    );
  }

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
