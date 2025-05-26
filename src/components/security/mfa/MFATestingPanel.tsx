
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MFAUtils } from '@/utils/security/mfaUtils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  Phone, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Info,
  AlertTriangle 
} from 'lucide-react';

export function MFATestingPanel() {
  const { toast } = useToast();
  const { firebaseUser, userRole } = useAuth();
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [testPhone, setTestPhone] = useState('+1234567890');
  const [isRunningTests, setIsRunningTests] = useState(false);

  const updateTestResult = (testName: string, result: 'success' | 'error') => {
    setTestResults(prev => ({ ...prev, [testName]: result }));
  };

  const runMFATests = async () => {
    if (!firebaseUser) {
      toast({
        title: 'Error',
        description: 'No user authenticated',
        variant: 'destructive'
      });
      return;
    }

    setIsRunningTests(true);
    setTestResults({});

    // Test 1: Check MFA requirement
    try {
      const isRequired = MFAUtils.isMFARequired(userRole || '');
      updateTestResult('mfa-requirement', 'success');
      console.log('MFA Required:', isRequired);
    } catch (error) {
      updateTestResult('mfa-requirement', 'error');
      console.error('MFA requirement test failed:', error);
    }

    // Test 2: Check enrolled factors
    try {
      const factors = MFAUtils.getEnrolledFactors(firebaseUser);
      updateTestResult('enrolled-factors', 'success');
      console.log('Enrolled factors:', factors);
    } catch (error) {
      updateTestResult('enrolled-factors', 'error');
      console.error('Enrolled factors test failed:', error);
    }

    // Test 3: Validate phone number
    try {
      const isValid = MFAUtils.validatePhoneNumber(testPhone);
      updateTestResult('phone-validation', isValid ? 'success' : 'error');
      console.log('Phone validation:', isValid);
    } catch (error) {
      updateTestResult('phone-validation', 'error');
      console.error('Phone validation test failed:', error);
    }

    // Test 4: Initialize reCAPTCHA
    try {
      MFAUtils.initializeRecaptcha();
      updateTestResult('recaptcha-init', 'success');
      console.log('reCAPTCHA initialized successfully');
    } catch (error) {
      updateTestResult('recaptcha-init', 'error');
      console.error('reCAPTCHA initialization failed:', error);
    }

    // Test 5: Generate backup codes
    try {
      const backupCodes = MFAUtils.generateBackupCodes();
      updateTestResult('backup-codes', backupCodes.length === 10 ? 'success' : 'error');
      console.log('Generated backup codes:', backupCodes.length);
    } catch (error) {
      updateTestResult('backup-codes', 'error');
      console.error('Backup codes generation failed:', error);
    }

    setIsRunningTests(false);
    
    toast({
      title: 'MFA Tests Completed',
      description: 'Check the results below and console for details'
    });
  };

  const testPhoneVerification = async () => {
    if (!firebaseUser) return;

    try {
      setTestResults(prev => ({ ...prev, 'phone-verification': 'pending' }));
      
      const verificationId = await MFAUtils.sendVerificationCode(firebaseUser, testPhone);
      updateTestResult('phone-verification', 'success');
      
      toast({
        title: 'Verification Code Sent',
        description: `Code sent to ${testPhone}. Check your phone for the verification code.`
      });
      
      console.log('Verification ID:', verificationId);
    } catch (error) {
      updateTestResult('phone-verification', 'error');
      console.error('Phone verification test failed:', error);
      
      toast({
        title: 'Phone Verification Failed',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  };

  const getTestIcon = (result: 'pending' | 'success' | 'error' | undefined) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-4 h-4 border border-gray-300 rounded-full" />;
    }
  };

  const getTestBadge = (result: 'pending' | 'success' | 'error' | undefined) => {
    switch (result) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Fail</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge variant="outline">Not Run</Badge>;
    }
  };

  const tests = [
    { id: 'mfa-requirement', name: 'MFA Requirement Check', description: 'Test if MFA is required for current user role' },
    { id: 'enrolled-factors', name: 'Enrolled Factors', description: 'Check currently enrolled MFA factors' },
    { id: 'phone-validation', name: 'Phone Validation', description: 'Validate phone number format' },
    { id: 'recaptcha-init', name: 'reCAPTCHA Initialization', description: 'Initialize reCAPTCHA verifier' },
    { id: 'backup-codes', name: 'Backup Codes Generation', description: 'Generate backup codes' },
    { id: 'phone-verification', name: 'Phone Verification', description: 'Send verification code to phone' }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <TestTube className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold">MFA Testing Panel</h2>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This panel helps you test MFA functionality during development. 
          Make sure Firebase is properly configured before running tests.
        </AlertDescription>
      </Alert>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Test Phone Number</label>
          <Input
            type="tel"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="+1234567890"
            className="max-w-xs"
          />
        </div>
      </div>

      <div className="grid gap-4 mb-6">
        {tests.map((test) => (
          <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getTestIcon(testResults[test.id])}
              <div>
                <div className="font-medium">{test.name}</div>
                <div className="text-sm text-gray-600">{test.description}</div>
              </div>
            </div>
            {getTestBadge(testResults[test.id])}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={runMFATests}
          disabled={isRunningTests || !firebaseUser}
          className="flex items-center space-x-2"
        >
          <Shield className="h-4 w-4" />
          <span>Run All Tests</span>
        </Button>

        <Button
          onClick={testPhoneVerification}
          disabled={isRunningTests || !firebaseUser || !testPhone}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Phone className="h-4 w-4" />
          <span>Test Phone Verification</span>
        </Button>
      </div>

      {!firebaseUser && (
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You need to be authenticated to run MFA tests. Please sign in first.
          </AlertDescription>
        </Alert>
      )}

      {/* Invisible reCAPTCHA container for testing */}
      <div id="recaptcha-container"></div>
    </Card>
  );
}
