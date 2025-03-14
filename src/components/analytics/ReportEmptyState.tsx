
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function ReportEmptyState() {
  return (
    <Card className="p-6 mt-8 bg-spotify-darker border-spotify-accent">
      <div className="text-center text-gray-400 py-8">
        <div className="flex justify-center mb-4">
          <FileText className="h-12 w-12 opacity-30" />
        </div>
        <h3 className="text-lg font-medium mb-2">No reports generated yet</h3>
        <p>Select a unit and report type, then click "Generate Report".</p>
      </div>
    </Card>
  );
}
