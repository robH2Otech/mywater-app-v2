
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MultiFactorAuth } from '@/components/security/MultiFactorAuth';
import { MFATestingPanel } from '@/components/security/mfa/MFATestingPanel';
import { MFAStatus } from '@/components/security/mfa/MFAStatus';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, Shield, Settings, Info } from 'lucide-react';

export default function MFATestingPage() {
  const { firebaseUser, userRole } = useAuth();
  const [setupComplete, setSetupComplete] = useState(false);

  const handleSetupComplete = () => {
    setSetupComplete(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">MFA Development & Testing</h1>
        <p className="text-gray-600">
          Test and configure Multi-Factor Authentication for your application
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Firebase Setup Required:</strong> Make sure you have enabled Phone authentication 
          in your Firebase Console under Authentication → Sign-in method.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Current Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>User Role:</span>
                <span className="font-medium">{userRole || 'None'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Authenticated:</span>
                <span className="font-medium">{firebaseUser ? 'Yes' : 'No'}</span>
              </div>
              {firebaseUser && <MFAStatus />}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="setup" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Setup</span>
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center space-x-2">
                <TestTube className="h-4 w-4" />
                <span>Testing</span>
              </TabsTrigger>
              <TabsTrigger value="guide" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Guide</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup">
              {setupComplete ? (
                <Card className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">MFA Setup Complete!</h3>
                  <p className="text-gray-600 mb-4">
                    Multi-factor authentication has been successfully configured.
                  </p>
                  <Button onClick={() => setSetupComplete(false)} variant="outline">
                    Setup Again
                  </Button>
                </Card>
              ) : (
                <MultiFactorAuth onComplete={handleSetupComplete} showGuide={true} />
              )}
            </TabsContent>

            <TabsContent value="testing">
              <MFATestingPanel />
            </TabsContent>

            <TabsContent value="guide">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Firebase MFA Setup Guide</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">1. Firebase Console Configuration</h4>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Go to Firebase Console → Authentication → Sign-in method</li>
                      <li>• Enable "Phone" as a sign-in provider</li>
                      <li>• Add your domain to authorized domains</li>
                      <li>• Configure reCAPTCHA settings if needed</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">2. Testing Steps</h4>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Use the "Testing" tab to verify MFA functionality</li>
                      <li>• Test with a real phone number that can receive SMS</li>
                      <li>• Verify backup codes are generated correctly</li>
                      <li>• Test the complete enrollment flow</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3. Common Issues</h4>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• reCAPTCHA not loading: Check domain configuration</li>
                      <li>• SMS not received: Verify phone number format</li>
                      <li>• Enrollment fails: Check Firebase project settings</li>
                      <li>• Type errors: Ensure Firebase SDK is up to date</li>
                    </ul>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      For production use, make sure to properly handle errors and provide 
                      clear user feedback throughout the MFA setup process.
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
