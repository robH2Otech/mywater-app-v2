
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';

interface MFAChooseStepProps {
  isMFARequired: boolean;
  onSetupPhone: () => void;
  onComplete: () => void;
}

export function MFAChooseStep({ isMFARequired, onSetupPhone, onComplete }: MFAChooseStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        {isMFARequired 
          ? 'Multi-factor authentication is required for your role. Please set it up now.'
          : 'Add an extra layer of security to your account.'
        }
      </p>
      
      <Button
        onClick={onSetupPhone}
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
  );
}
