
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ReportNoData() {
  return (
    <Alert className="bg-spotify-darker border-spotify-accent-hover">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No data available</AlertTitle>
      <AlertDescription>
        There is no measurement data available for this report period. Sample data will be generated for demonstration purposes.
      </AlertDescription>
    </Alert>
  );
}
