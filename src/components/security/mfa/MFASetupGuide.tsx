
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';

interface MFASetupGuideProps {
  onStartSetup: () => void;
}

export function MFASetupGuide({ onStartSetup }: MFASetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const setupSteps = [
    {
      title: "Firebase Console Setup",
      icon: <Shield className="h-5 w-5" />,
      description: "Configure your Firebase project for MFA",
      details: [
        "Go to Firebase Console → Authentication → Sign-in method",
        "Enable 'Phone' as a sign-in provider",
        "Add your domain to authorized domains",
        "Configure reCAPTCHA settings if needed"
      ]
    },
    {
      title: "Phone Number Verification",
      icon: <Smartphone className="h-5 w-5" />,
      description: "Set up phone authentication",
      details: [
        "Enter a valid phone number with country code (+1234567890)",
        "Ensure your phone can receive SMS messages",
        "Have access to the phone during setup",
        "Check that SMS delivery works in your region"
      ]
    },
    {
      title: "Backup Codes",
      icon: <Key className="h-5 w-5" />,
      description: "Save your backup codes securely",
      details: [
        "Download or print your backup codes",
        "Store them in a secure location",
        "Each code can only be used once",
        "Keep them separate from your device"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Multi-Factor Authentication Setup</h2>
        <p className="text-gray-600">Follow these steps to secure your account with MFA</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          MFA adds an extra layer of security by requiring both your password and a code from your phone to sign in.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {setupSteps.map((step, index) => (
          <Card key={index} className={`p-4 ${currentStep === index ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${currentStep === index ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>
                {step.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center">
                {currentStep > index ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : currentStep === index ? (
                  <div className="w-5 h-5 border-2 border-blue-600 rounded-full" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        {currentStep < setupSteps.length - 1 ? (
          <Button onClick={() => setCurrentStep(currentStep + 1)}>
            Next Step
          </Button>
        ) : (
          <Button onClick={onStartSetup} className="bg-blue-600 hover:bg-blue-700">
            Start MFA Setup
          </Button>
        )}
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Make sure you have access to your phone before starting the setup process.
        </AlertDescription>
      </Alert>
    </div>
  );
}
