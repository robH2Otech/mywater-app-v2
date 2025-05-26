
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
import { MFAStatus } from './mfa/MFAStatus';

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

  const isMFARequired = MFAUtils.isMFARequired(userRole || '');

  const handleSendVerificationCode = async () => {
    if (!firebaseUser || !phoneNumber) return;
    
    setIsLoading(true);
    try {
      const verId = await MFAUtils.sendVerificationCode(firebaseUser, phoneNumber);
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
      toast({
        title: 'MFA Setup Failed',
        description: error.message || 'Failed to setup multi-factor authentication',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'choose':
        return (
          <MFAChooseStep
            isMFARequired={isMFARequired}
            onSetupPhone={() => setStep('phone')}
            onComplete={onComplete}
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
            onComplete={onComplete}
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
