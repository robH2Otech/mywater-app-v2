
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CartridgeAlertProps {
  isReplacementDueSoon: boolean;
  isReplacementOverdue: boolean;
  formattedReplacementDate: string;
}

export function CartridgeAlert({ 
  isReplacementDueSoon, 
  isReplacementOverdue, 
  formattedReplacementDate 
}: CartridgeAlertProps) {
  if (!isReplacementDueSoon && !isReplacementOverdue) {
    return null;
  }
  
  if (isReplacementOverdue) {
    return (
      <Alert className="mb-6 border-red-500 bg-red-500/10">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-500">Cartridge Replacement Overdue</AlertTitle>
        <AlertDescription>
          Your water purifier cartridge is overdue for replacement. Please replace it as soon as 
          possible to maintain optimal water quality.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isReplacementDueSoon) {
    return (
      <Alert className="mb-6 border-amber-500 bg-amber-500/10">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-500">Cartridge Replacement Reminder</AlertTitle>
        <AlertDescription>
          Your water purifier cartridge will need replacement on {formattedReplacementDate}. 
          Consider ordering a replacement soon to ensure continuous water purification.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
