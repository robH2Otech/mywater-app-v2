
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function ReportEmptyState() {
  return (
    <div className="space-y-3 mt-4">
      <h2 className="text-xl font-semibold">Generated Reports</h2>
      <Card className="bg-spotify-darker overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center text-center p-6">
          <FileText className="h-16 w-16 text-gray-400 mb-3" />
          <h3 className="text-xl font-semibold mb-2">No Reports Available</h3>
          <p className="text-gray-400 max-w-md">
            Select a unit and report type above to generate your first report. Reports help you track performance metrics and understand water treatment trends.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
