
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AnomalyDetection } from "@/types/ml";
import { useMLOperations } from "@/hooks/ml/useMLOperations";
import { AlertTriangle, Info, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface AnomaliesListProps {
  unitId?: string; // Optional: filter by unit ID
  limit?: number;
}

export function AnomaliesList({ unitId, limit }: AnomaliesListProps) {
  const { anomalies, updateAnomalyStatus, isLoading } = useMLOperations();
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyDetection | null>(null);
  const [notes, setNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter anomalies by unit if unitId is provided, and apply limit
  const filteredAnomalies = anomalies
    .filter(anomaly => !unitId || anomaly.unitId === unitId)
    .slice(0, limit || anomalies.length);

  const handleAnomalyClick = (anomaly: AnomalyDetection) => {
    setSelectedAnomaly(anomaly);
    setNotes(anomaly.notes || "");
    setDialogOpen(true);
  };

  const handleStatusUpdate = async (status: AnomalyDetection["status"]) => {
    if (!selectedAnomaly) return;
    
    await updateAnomalyStatus.mutateAsync({
      anomalyId: selectedAnomaly.id,
      status,
      notes
    });
    
    setDialogOpen(false);
  };

  const getSeverityColor = (severity: AnomalyDetection["severity"]) => {
    switch (severity) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const getStatusBadge = (status: AnomalyDetection["status"]) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded-md text-xs">Confirmed</span>;
      case "false_positive":
        return <span className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded-md text-xs">False Positive</span>;
      case "resolved":
        return <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded-md text-xs">Resolved</span>;
      case "reviewing":
        return <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded-md text-xs">Reviewing</span>;
      case "new":
      default:
        return <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-md text-xs">New</span>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString() + ' ' +
        new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <Card className="bg-spotify-darker border-spotify-accent overflow-hidden">
        <div className="p-4 border-b border-spotify-accent">
          <h3 className="text-lg font-medium text-white flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Detected Anomalies
          </h3>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-400">Loading anomalies...</p>
            </div>
          ) : filteredAnomalies.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">No anomalies detected</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnomalies.map((anomaly) => (
                  <TableRow 
                    key={anomaly.id}
                    className="hover:bg-spotify-accent/30 cursor-pointer"
                    onClick={() => handleAnomalyClick(anomaly)}
                  >
                    <TableCell>{anomaly.unitName}</TableCell>
                    <TableCell>
                      {anomaly.type === "flow_rate" && "Flow Rate"}
                      {anomaly.type === "temperature" && "Temperature"}
                      {anomaly.type === "volume_usage" && "Volume Usage"}
                      {anomaly.type === "uvc_hours" && "UVC Hours"}
                    </TableCell>
                    <TableCell>
                      <span className={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(anomaly.detectionDate)}</TableCell>
                    <TableCell>{getStatusBadge(anomaly.status)}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnomalyClick(anomaly);
                        }}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Anomaly Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-spotify-darker border border-spotify-accent text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Anomaly Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review anomaly detection information and update its status.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAnomaly && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Unit</p>
                  <p className="font-medium">{selectedAnomaly.unitName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Detected On</p>
                  <p className="font-medium">{formatDate(selectedAnomaly.detectionDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="font-medium">
                    {selectedAnomaly.type === "flow_rate" && "Flow Rate"}
                    {selectedAnomaly.type === "temperature" && "Temperature"}
                    {selectedAnomaly.type === "volume_usage" && "Volume Usage"}
                    {selectedAnomaly.type === "uvc_hours" && "UVC Hours"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Severity</p>
                  <p className={`font-medium ${getSeverityColor(selectedAnomaly.severity)}`}>
                    {selectedAnomaly.severity.charAt(0).toUpperCase() + selectedAnomaly.severity.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Value</p>
                  <p className="font-medium">{selectedAnomaly.value.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Expected Value</p>
                  <p className="font-medium">{selectedAnomaly.expectedValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Deviation</p>
                  <p className={`font-medium ${getSeverityColor(selectedAnomaly.severity)}`}>
                    {selectedAnomaly.deviationPercentage.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Confidence</p>
                  <p className="font-medium">{selectedAnomaly.confidence}%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this anomaly"
                    className="bg-spotify-dark border-spotify-accent"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="border-t border-spotify-accent pt-4">
                <p className="text-sm text-gray-400 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate("confirmed")}
                    className="border-red-600 hover:bg-red-900/30"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirm Anomaly
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate("false_positive")}
                    className="border-gray-600 hover:bg-gray-900/30"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Mark as False Positive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate("resolved")}
                    className="border-green-600 hover:bg-green-900/30"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate("reviewing")}
                    className="border-yellow-600 hover:bg-yellow-900/30"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Mark for Review
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
