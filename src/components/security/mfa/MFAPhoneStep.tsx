
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MFAPhoneStepProps {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  isLoading: boolean;
  onBack: () => void;
  onSendCode: () => void;
}

export function MFAPhoneStep({ 
  phoneNumber, 
  setPhoneNumber, 
  isLoading, 
  onBack, 
  onSendCode 
}: MFAPhoneStepProps) {
  return (
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
          onClick={onBack}
          variant="outline"
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          onClick={onSendCode}
          disabled={!phoneNumber || isLoading}
          className="flex-1"
        >
          Send Code
        </Button>
      </div>
    </div>
  );
}
