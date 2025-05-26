
import { Button } from '@/components/ui/button';
import { CheckCircle, Key } from 'lucide-react';

interface MFABackupStepProps {
  backupCodes: string[];
  onComplete: () => void;
}

export function MFABackupStep({ backupCodes, onComplete }: MFABackupStepProps) {
  return (
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
  );
}
