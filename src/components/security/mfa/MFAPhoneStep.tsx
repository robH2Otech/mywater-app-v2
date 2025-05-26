
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { MFAUtils } from '@/utils/security/mfaUtils';

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
  const isValidPhone = phoneNumber ? MFAUtils.validatePhoneNumber(MFAUtils.formatPhoneNumber(phoneNumber)) : false;

  const handlePhoneChange = (value: string) => {
    // Auto-format the phone number
    setPhoneNumber(value);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Enter your phone number with country code. You'll receive an SMS with a verification code.
        </AlertDescription>
      </Alert>

      <div>
        <label className="block text-sm font-medium mb-2">Phone Number</label>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="+1 (555) 123-4567"
          disabled={isLoading}
          className={!phoneNumber ? '' : isValidPhone ? 'border-green-500' : 'border-red-500'}
        />
        {phoneNumber && !isValidPhone && (
          <p className="text-sm text-red-600 mt-1">
            Please enter a valid phone number with country code (e.g., +1234567890)
          </p>
        )}
        {phoneNumber && isValidPhone && (
          <p className="text-sm text-green-600 mt-1">
            Valid phone number format
          </p>
        )}
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Format examples:</strong>
        </p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• US: +1234567890</li>
          <li>• UK: +441234567890</li>
          <li>• Germany: +4912345678</li>
          <li>• Include country code (+)</li>
        </ul>
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
          disabled={!isValidPhone || isLoading}
          className="flex-1"
        >
          {isLoading ? 'Sending...' : 'Send Code'}
        </Button>
      </div>
    </div>
  );
}
