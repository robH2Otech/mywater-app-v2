
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/integrations/firebase/client";
import { refreshUserClaims, verifyUserClaims } from "@/utils/admin/adminClaimsManager";

export function AuthDebugPanel() {
  const { 
    currentUser, 
    firebaseUser, 
    userRole, 
    company, 
    isLoading, 
    authError, 
    debugInfo,
    refreshUserSession 
  } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClaims = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserClaims();
      await refreshUserSession();
      console.log("Claims refreshed successfully");
    } catch (error) {
      console.error("Error refreshing claims:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVerifyClaims = async () => {
    const result = await verifyUserClaims();
    console.log("Claims verification result:", result);
  };

  const handleGetToken = async () => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken(true);
        const tokenResult = await firebaseUser.getIdTokenResult();
        console.log("Token:", token.substring(0, 50) + "...");
        console.log("Token claims:", tokenResult.claims);
      } catch (error) {
        console.error("Error getting token:", error);
      }
    }
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <Card className="mt-4 border-yellow-500 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">🔧 Auth Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Firebase User:</strong>
            <pre className="text-xs bg-gray-100 p-1 rounded">
              {firebaseUser ? JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified
              }, null, 2) : 'null'}
            </pre>
          </div>
          
          <div>
            <strong>Current User:</strong>
            <pre className="text-xs bg-gray-100 p-1 rounded">
              {currentUser ? JSON.stringify({
                id: currentUser.id,
                email: currentUser.email,
                role: currentUser.role,
                company: currentUser.company
              }, null, 2) : 'null'}
            </pre>
          </div>
        </div>

        <div>
          <strong>Auth State:</strong>
          <pre className="text-xs bg-gray-100 p-1 rounded">
            {JSON.stringify({
              userRole,
              company,
              isLoading,
              authError
            }, null, 2)}
          </pre>
        </div>

        {debugInfo && (
          <div>
            <strong>Debug Info:</strong>
            <pre className="text-xs bg-gray-100 p-1 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefreshClaims}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Claims"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleVerifyClaims}>
            Verify Claims
          </Button>
          <Button size="sm" variant="outline" onClick={handleGetToken}>
            Get Token
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
