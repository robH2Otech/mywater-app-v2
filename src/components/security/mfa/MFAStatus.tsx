
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { MFAUtils } from '@/utils/security/mfaUtils';

export function MFAStatus() {
  const { firebaseUser } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [enrolledFactors, setEnrolledFactors] = useState<string[]>([]);

  useEffect(() => {
    if (firebaseUser) {
      const factors = MFAUtils.getEnrolledFactors(firebaseUser);
      setMfaEnabled(factors.length > 0);
      setEnrolledFactors(factors);
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
