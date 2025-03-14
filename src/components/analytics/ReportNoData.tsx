
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function ReportNoData() {
  return (
    <Card className="p-6 bg-spotify-darker border-spotify-accent">
      <div className="text-center">
        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
        <p className="text-gray-400 mb-4">
          There is no measurement data available for the selected period.
        </p>
      </div>
    </Card>
  );
}
