
import React, { useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "@/integrations/firebase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export const FirebaseDebugPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { firebaseUser, userRole, authError } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addLog("🔍 Testing Firebase connection...");
      
      // Test auth and token details
      addLog(`👤 Auth user: ${firebaseUser?.email || 'Not logged in'}`);
      addLog(`🎫 User role: ${userRole || 'No role'}`);
      addLog(`❌ Auth error: ${authError || 'None'}`);
      addLog(`🔑 User UID: ${firebaseUser?.uid || 'No UID'}`);
      
      // Get and display token information
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const tokenResult = await firebaseUser.getIdTokenResult();
          addLog(`🎟️ Token exists: ${token ? 'Yes' : 'No'}`);
          addLog(`📋 Token claims: ${JSON.stringify(tokenResult.claims)}`);
          addLog(`🔐 Email verified: ${firebaseUser.emailVerified}`);
        } catch (tokenError) {
          addLog(`❌ Token error: ${tokenError.message}`);
        }
      }
      
      // Test Firestore collections with detailed error reporting
      const collections = ['units', 'alerts', 'filters'];
      
      for (const collectionName of collections) {
        try {
          addLog(`📊 Testing ${collectionName} collection...`);
          const snapshot = await getDocs(collection(db, collectionName));
          addLog(`✅ ${collectionName}: ${snapshot.size} documents found`);
          
          if (snapshot.size > 0) {
            snapshot.docs.slice(0, 2).forEach((doc, index) => {
              const data = doc.data();
              addLog(`  📄 Doc ${index + 1} ID: ${doc.id}`);
              addLog(`  📄 Doc ${index + 1} data: ${JSON.stringify(data).substring(0, 100)}...`);
            });
          } else {
            addLog(`  ⚠️ ${collectionName} collection is empty - this is expected for new projects`);
          }
        } catch (error) {
          addLog(`❌ ${collectionName} error: ${error.message}`);
          addLog(`❌ Error code: ${error.code}`);
          addLog(`❌ Full error: ${JSON.stringify(error, null, 2)}`);
        }
      }
      
      // Test project configuration
      addLog(`🏗️ Firebase project: ${db.app.options.projectId}`);
      addLog(`🌐 Auth domain: ${auth.app.options.authDomain}`);
      
    } catch (error) {
      addLog(`❌ General error: ${error.message}`);
      addLog(`❌ Error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestData = async () => {
    setIsLoading(true);
    
    try {
      addLog("🏗️ Creating test data...");
      
      if (!firebaseUser) {
        addLog("❌ No authenticated user - cannot create test data");
        return;
      }
      
      // Test token before creating data
      try {
        const token = await firebaseUser.getIdToken(true); // Force refresh
        addLog(`🔄 Token refreshed successfully`);
      } catch (tokenError) {
        addLog(`❌ Token refresh failed: ${tokenError.message}`);
        return;
      }
      
      // Create test unit
      const testUnit = {
        name: "Test Unit " + Date.now(),
        status: "active",
        location: "Test Location",
        company: "X-WATER",
        total_volume: 1000,
        last_maintenance: new Date().toISOString(),
        unit_type: "filter",
        created_at: new Date(),
        created_by: firebaseUser.uid
      };
      
      const unitRef = await addDoc(collection(db, "units"), testUnit);
      addLog(`✅ Created test unit: ${unitRef.id}`);
      
      // Create test alert
      const testAlert = {
        unit_id: unitRef.id,
        message: "Test alert message",
        status: "active",
        severity: "medium",
        created_at: new Date(),
        created_by: firebaseUser.uid
      };
      
      const alertRef = await addDoc(collection(db, "alerts"), testAlert);
      addLog(`✅ Created test alert: ${alertRef.id}`);
      
      // Create test filter
      const testFilter = {
        unit_id: unitRef.id,
        installation_date: new Date().toISOString(),
        last_change: new Date().toISOString(),
        volume_processed: 500,
        status: "active",
        created_at: new Date(),
        created_by: firebaseUser.uid
      };
      
      const filterRef = await addDoc(collection(db, "filters"), testFilter);
      addLog(`✅ Created test filter: ${filterRef.id}`);
      
      addLog("🎉 Test data creation complete!");
      addLog("🔄 Try running 'Test Connection' again to see the new data");
      
    } catch (error) {
      addLog(`❌ Error creating test data: ${error.message}`);
      addLog(`❌ Error code: ${error.code}`);
      addLog(`❌ Full error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSimpleRead = async () => {
    setIsLoading(true);
    
    try {
      addLog("🧪 Testing simple read operation...");
      
      if (!firebaseUser) {
        addLog("❌ No authenticated user");
        return;
      }
      
      // Test a simple collection read
      const testCollection = collection(db, "units");
      addLog("📡 Attempting to read units collection...");
      
      const snapshot = await getDocs(testCollection);
      addLog(`✅ Simple read successful: ${snapshot.size} documents`);
      
    } catch (error) {
      addLog(`❌ Simple read failed: ${error.message}`);
      addLog(`❌ This suggests a permissions or configuration issue`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🔧 Enhanced Firebase Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testFirebaseConnection}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
          <Button 
            onClick={createTestData}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Creating..." : "Create Test Data"}
          </Button>
          <Button 
            onClick={testSimpleRead}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Testing..." : "Simple Read Test"}
          </Button>
          <Button 
            onClick={() => setTestResults([])}
            variant="outline"
          >
            Clear Logs
          </Button>
        </div>
        
        <div className="bg-black p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-gray-400">Click "Test Connection" to start debugging...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-green-400 mb-1 whitespace-pre-wrap">
                {result}
              </div>
            ))
          )}
        </div>
        
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Debug Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click "Test Connection" to check authentication and permissions</li>
            <li>Review token and claims information</li>
            <li>If permissions fail, check Firestore rules deployment</li>
            <li>Use "Simple Read Test" for basic connectivity</li>
            <li>Create test data only after connection test passes</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
