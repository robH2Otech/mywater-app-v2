import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '@/integrations/firebase/client';
import { 
  multiFactor, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator,
  RecaptchaVerifier 
} from 'firebase/auth';

interface MFASetupProps {
  onComplete: () => void;
}

export function MultiFactorAuth({ onComplete }: MFASetupProps) {
  const { toast } = useToast();
  const { firebaseUser, userRole } = useAuth();
  const [step, setStep] = useState<'choose' | 'phone' | 'verify' | 'backup'>('choose');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if MFA is required for user role
  const isMFARequired = userRole === 'admin' || userRole === 'superadmin';

  // Generate backup codes
  const generateBackupCodes = (): string[] => {
    return Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
  };

  // Setup phone MFA - Fixed Firebase API usage
  const setupPhoneMFA = async () => {
    if (!firebaseUser || !verificationId || !verificationCode) return;
    
    setIsLoading(true);
    try {
      const multiFactorSession = await multiFactor(firebaseUser).getSession();
      const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      
      await multiFactor(firebaseUser).enroll(multiFactorAssertion, multiFactorSession);
      
      toast({
        title: 'MFA Enabled',
        description: 'Multi-factor authentication has been successfully enabled.'
      });
      
      setStep('backup');
      setBackupCodes(generateBackupCodes());
      
    } catch (error: any) {
      console.error('MFA setup error:', error);
      toast({
        title: 'MFA Setup Failed',
        description: error.message || 'Failed to setup multi-factor authentication',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send verification code - Fixed Firebase API usage
  const sendVerificationCode = async () => {
    if (!firebaseUser || !phoneNumber) return;
    
    setIsLoading(true);
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });

      const multiFactorSession = await multiFactor(firebaseUser).getSession();
      const phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: multiFactorSession
      };
      
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
      
      setVerificationId(verId);
      setStep('verify');
      
      toast({
        title: 'Code Sent',
        description: 'Verification code has been sent to your phone.'
      });
      
    } catch (error: any) {
      console.error('Phone verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to send verification code',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold">Multi-Factor Authentication</h2>
          {isMFARequired && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
          )}
        </div>

        {step === 'choose' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              {isMFARequired 
                ? 'Multi-factor authentication is required for your role. Please set it up now.'
                : 'Add an extra layer of security to your account.'
              }
            </p>
            
            <Button
              onClick={() => setStep('phone')}
              className="w-full"
              variant="outline"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Set up Phone Authentication
            </Button>
            
            {!isMFARequired && (
              <Button
                onClick={onComplete}
                variant="ghost"
                className="w-full"
              >
                Skip for now
              </Button>
            )}
          </div>
        )}

        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => setStep('choose')}
                variant="outline"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={sendVerificationCode}
                disabled={!phoneNumber || isLoading}
                className="flex-1"
              >
                Send Code
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <Input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => setStep('phone')}
                variant="outline"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={setupPhoneMFA}
                disabled={!verificationCode || isLoading}
                className="flex-1"
              >
                Verify & Enable
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">MFA Successfully Enabled!</span>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Key className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Backup Codes</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Save these codes in a secure location. You can use them to access your account if you lose your phone.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            
            <Button onClick={onComplete} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </div>
        )}
      </Card>

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

// MFA Status Component
export function MFAStatus() {
  const { firebaseUser } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [enrolledFactors, setEnrolledFactors] = useState<string[]>([]);

  useEffect(() => {
    if (firebaseUser) {
      const factors = multiFactor(firebaseUser).enrolledFactors;
      setMfaEnabled(factors.length > 0);
      setEnrolledFactors(factors.map(factor => factor.factorId));
    }
  }, [firebaseUser]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Multi-Factor Authentication</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {mfaEnabled ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Enabled</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-600">Disabled</span>
            </>
          )}
        </div>
      </div>
      
      {mfaEnabled && enrolledFactors.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          Active factors: {enrolledFactors.join(', ')}
        </div>
      )}
    </Card>
  );
}
