import { ReportData } from "@/types/analytics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getReportTitle, downloadReportAsTxt } from "@/utils/reportUtils";
import { formatDistanceToNow } from "date-fns";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ReportListItemProps {
  report: ReportData;
  onViewReport: (report: ReportData) => void;
  onReportDeleted: () => void;
}

export function ReportListItem({ report, onViewReport, onReportDeleted }: ReportListItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDownloadReport = async () => {
    try {
      await downloadReportAsTxt(report);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download report",
      });
    }
  };

  const handleDeleteReport = async () => {
    try {
      const reportRef = doc(db, "reports", report.id);
      await deleteDoc(reportRef);
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
      onReportDeleted();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete report",
      });
    }
  };

  const createdAt = report.created_at ? 
    (typeof report.created_at === 'string' ? 
      new Date(report.created_at) : 
      // @ts-ignore - Handle Firestore Timestamp
      report.created_at.toDate ? report.created_at.toDate() : new Date()
    ) : 
    new Date();

  const unitName = report.unit_name || "Unknown Unit";

  return (
    <Card key={report.id} className="p-4 bg-spotify-darker rounded-xl overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">
            {unitName} - {getReportTitle(report.report_type)}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Generated {formatDistanceToNow(createdAt, { addSuffix: true })}
          </p>
          <div className="mt-2 text-sm text-gray-300 line-clamp-3 whitespace-pre-wrap">
            {report.content}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewReport(report)}
            className="flex items-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-spotify-darker border-spotify-accent rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-spotify-dark hover:bg-spotify-dark/90">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReport}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
