
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
import { MFAUtils } from '@/utils/security/mfaUtils';
import { MFAChooseStep } from './mfa/MFAChooseStep';
import { MFAPhoneStep } from './mfa/MFAPhoneStep';
import { MFAVerifyStep } from './mfa/MFAVerifyStep';
import { MFABackupStep } from './mfa/MFABackupStep';
import { MFASetupGuide } from './mfa/MFASetupGuide';
import { MFAStatus } from './mfa/MFAStatus';

interface MFASetupProps {
  onComplete: () => void;
  showGuide?: boolean;
  showTesting?: boolean;
}

export function MultiFactorAuth({ onComplete, showGuide = false, showTesting = false }: MFASetupProps) {
  const { toast } = useToast();
  const { firebaseUser, userRole } = useAuth();
  const [step, setStep] = useState<'guide' | 'choose' | 'phone' | 'verify' | 'backup'>(showGuide ? 'guide' : 'choose');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isMFARequired = MFAUtils.isMFARequired(userRole || '');

  const handleSendVerificationCode = async () => {
    if (!firebaseUser || !phoneNumber) return;
    
    // Validate phone number first
    const formattedPhone = MFAUtils.formatPhoneNumber(phoneNumber);
    if (!MFAUtils.validatePhoneNumber(formattedPhone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number with country code (e.g., +1234567890)',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const verId = await MFAUtils.sendVerificationCode(firebaseUser, formattedPhone);
      setVerificationId(verId);
      setStep('verify');
      
      toast({
        title: 'Code Sent',
        description: `Verification code has been sent to ${formattedPhone}`
      });
      
    } catch (error: any) {
      console.error('Phone verification error:', error);
      
      let errorMessage = 'Failed to send verification code';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later';
      } else if (error.code === 'auth/missing-phone-number') {
        errorMessage = 'Phone number is required';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupPhoneMFA = async () => {
    if (!firebaseUser || !verificationId || !verificationCode) return;
    
    setIsLoading(true);
    try {
      await MFAUtils.setupPhoneMFA(firebaseUser, verificationId, verificationCode);
      
      toast({
        title: 'MFA Enabled',
        description: 'Multi-factor authentication has been successfully enabled.'
      });
      
      setStep('backup');
      setBackupCodes(MFAUtils.generateBackupCodes());
      
    } catch (error: any) {
      console.error('MFA setup error:', error);
      
      let errorMessage = 'Failed to setup multi-factor authentication';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please try again';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Verification code has expired. Please request a new one';
      } else if (error.code === 'auth/session-expired') {
        errorMessage = 'Session has expired. Please start over';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'MFA Setup Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSetup = () => {
    // Clean up resources
    MFAUtils.cleanup();
    onComplete();
  };

  const renderStep = () => {
    switch (step) {
      case 'guide':
        return (
          <MFASetupGuide onStartSetup={() => setStep('choose')} />
        );
      case 'choose':
        return (
          <MFAChooseStep
            isMFARequired={isMFARequired}
            onSetupPhone={() => setStep('phone')}
            onComplete={handleCompleteSetup}
          />
        );
      case 'phone':
        return (
          <MFAPhoneStep
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            isLoading={isLoading}
            onBack={() => setStep('choose')}
            onSendCode={handleSendVerificationCode}
          />
        );
      case 'verify':
        return (
          <MFAVerifyStep
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            isLoading={isLoading}
            onBack={() => setStep('phone')}
            onVerify={handleSetupPhoneMFA}
          />
        );
      case 'backup':
        return (
          <MFABackupStep
            backupCodes={backupCodes}
            onComplete={handleCompleteSetup}
          />
        );
      default:
        return null;
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

        {renderStep()}
      </Card>

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

// Export the MFAStatus component for backward compatibility
export { MFAStatus } from './mfa/MFAStatus';
