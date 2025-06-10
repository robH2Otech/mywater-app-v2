
import React, { useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
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
      
      // Test auth
      addLog(`👤 Auth user: ${firebaseUser?.email || 'Not logged in'}`);
      addLog(`🎫 User role: ${userRole || 'No role'}`);
      addLog(`❌ Auth error: ${authError || 'None'}`);
      
      // Test Firestore collections
      const collections = ['units', 'alerts', 'filters'];
      
      for (const collectionName of collections) {
        try {
          addLog(`📊 Testing ${collectionName} collection...`);
          const snapshot = await getDocs(collection(db, collectionName));
          addLog(`✅ ${collectionName}: ${snapshot.size} documents found`);
          
          if (snapshot.size > 0) {
            snapshot.docs.slice(0, 2).forEach((doc, index) => {
              addLog(`  📄 Doc ${index + 1}: ${JSON.stringify(doc.data()).substring(0, 100)}...`);
            });
          }
        } catch (error) {
          addLog(`❌ ${collectionName} error: ${error.message}`);
        }
      }
      
    } catch (error) {
      addLog(`❌ General error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestData = async () => {
    setIsLoading(true);
    
    try {
      addLog("🏗️ Creating test data...");
      
      // Create test unit
      const unitRef = await addDoc(collection(db, "units"), {
        name: "Test Unit 1",
        status: "active",
        location: "Test Location",
        company: "X-WATER",
        total_volume: 1000,
        last_maintenance: new Date().toISOString(),
        unit_type: "filter",
        created_at: new Date()
      });
      addLog(`✅ Created test unit: ${unitRef.id}`);
      
      // Create test alert
      const alertRef = await addDoc(collection(db, "alerts"), {
        unit_id: unitRef.id,
        message: "Test alert message",
        status: "active",
        created_at: new Date()
      });
      addLog(`✅ Created test alert: ${alertRef.id}`);
      
      // Create test filter
      const filterRef = await addDoc(collection(db, "filters"), {
        unit_id: unitRef.id,
        installation_date: new Date().toISOString(),
        last_change: new Date().toISOString(),
        volume_processed: 500,
        created_at: new Date()
      });
      addLog(`✅ Created test filter: ${filterRef.id}`);
      
      addLog("🎉 Test data creation complete!");
      
    } catch (error) {
      addLog(`❌ Error creating test data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🔧 Firebase Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
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
              <div key={index} className="text-green-400 mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
