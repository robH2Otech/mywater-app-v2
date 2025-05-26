
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MFAVerifyStepProps {
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  isLoading: boolean;
  onBack: () => void;
  onVerify: () => void;
}

export function MFAVerifyStep({ 
  verificationCode, 
  setVerificationCode, 
  isLoading, 
  onBack, 
  onVerify 
}: MFAVerifyStepProps) {
  return (
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
          onClick={onBack}
          variant="outline"
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          onClick={onVerify}
          disabled={!verificationCode || isLoading}
          className="flex-1"
        >
          Verify & Enable
        </Button>
      </div>
    </div>
  );
}
