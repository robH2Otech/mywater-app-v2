
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
import { MaintenancePrediction } from "@/types/ml";
import { useMLOperations } from "@/hooks/ml/useMLOperations";
import { Calendar, Tool, Info, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { FormInput } from "@/components/shared/FormInput";

interface PredictionsListProps {
  unitId?: string; // Optional: filter by unit ID
  limit?: number;
}

export function PredictionsList({ unitId, limit }: PredictionsListProps) {
  const { predictions, updatePredictionStatus, isLoading } = useMLOperations();
  const [selectedPrediction, setSelectedPrediction] = useState<MaintenancePrediction | null>(null);
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter predictions by unit if unitId is provided, and apply limit
  const filteredPredictions = predictions
    .filter(prediction => !unitId || prediction.unitId === unitId)
    .slice(0, limit || predictions.length);

  const handlePredictionClick = (prediction: MaintenancePrediction) => {
    setSelectedPrediction(prediction);
    setNotes(prediction.notes || "");
    setAssignedTo(prediction.assignedTo || "");
    if (prediction.scheduledDate) {
      setScheduledDate(new Date(prediction.scheduledDate));
    } else {
      setScheduledDate(null);
    }
    setDialogOpen(true);
  };

  const handleStatusUpdate = async (status: MaintenancePrediction["status"]) => {
    if (!selectedPrediction) return;
    
    await updatePredictionStatus.mutateAsync({
      predictionId: selectedPrediction.id,
      status,
      scheduledDate: scheduledDate ? scheduledDate.toISOString() : undefined,
      assignedTo: assignedTo || undefined,
      notes
    });
    
    setDialogOpen(false);
  };

  const getPriorityColor = (priority: MaintenancePrediction["priority"]) => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const getStatusBadge = (status: MaintenancePrediction["status"]) => {
    switch (status) {
      case "scheduled":
        return <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-md text-xs">Scheduled</span>;
      case "completed":
        return <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded-md text-xs">Completed</span>;
      case "false_prediction":
        return <span className="px-2 py-1 bg-gray-800/50 text-gray-300 rounded-md text-xs">False Prediction</span>;
      case "predicted":
      default:
        return <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded-md text-xs">Predicted</span>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <Card className="bg-spotify-darker border-spotify-accent overflow-hidden">
        <div className="p-4 border-b border-spotify-accent">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Calendar className="h-5 w-5 text-mywater-blue mr-2" />
            Maintenance Predictions
          </h3>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-400">Loading predictions...</p>
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">No maintenance predictions available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Maintenance Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Predicted Date</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPredictions.map((prediction) => (
                  <TableRow 
                    key={prediction.id}
                    className="hover:bg-spotify-accent/30 cursor-pointer"
                    onClick={() => handlePredictionClick(prediction)}
                  >
                    <TableCell>{prediction.unitName}</TableCell>
                    <TableCell>
                      {prediction.maintenanceType === "filter_change" && "Filter Change"}
                      {prediction.maintenanceType === "uvc_replacement" && "UVC Replacement"}
                      {prediction.maintenanceType === "general_service" && "General Service"}
                    </TableCell>
                    <TableCell>
                      <span className={getPriorityColor(prediction.priority)}>
                        {prediction.priority.charAt(0).toUpperCase() + prediction.priority.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(prediction.predictedDate)}</TableCell>
                    <TableCell>
                      {prediction.estimatedDaysRemaining > 0 
                        ? `${prediction.estimatedDaysRemaining} days`
                        : "Overdue"}
                    </TableCell>
                    <TableCell>{getStatusBadge(prediction.status)}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePredictionClick(prediction);
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

      {/* Prediction Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-spotify-darker border border-spotify-accent text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Maintenance Prediction Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review maintenance prediction and update its status.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrediction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Unit</p>
                  <p className="font-medium">{selectedPrediction.unitName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Maintenance Type</p>
                  <p className="font-medium">
                    {selectedPrediction.maintenanceType === "filter_change" && "Filter Change"}
                    {selectedPrediction.maintenanceType === "uvc_replacement" && "UVC Replacement"}
                    {selectedPrediction.maintenanceType === "general_service" && "General Service"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Priority</p>
                  <p className={`font-medium ${getPriorityColor(selectedPrediction.priority)}`}>
                    {selectedPrediction.priority.charAt(0).toUpperCase() + selectedPrediction.priority.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Predicted Date</p>
                  <p className="font-medium">{formatDate(selectedPrediction.predictedDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Days Remaining</p>
                  <p className={`font-medium ${
                    selectedPrediction.estimatedDaysRemaining <= 0 ? "text-red-500" : 
                    selectedPrediction.estimatedDaysRemaining < 7 ? "text-yellow-500" : "text-green-500"
                  }`}>
                    {selectedPrediction.estimatedDaysRemaining > 0 
                      ? `${selectedPrediction.estimatedDaysRemaining} days`
                      : "Overdue"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Confidence</p>
                  <p className="font-medium">{selectedPrediction.confidence}%</p>
                </div>
                <div className="col-span-2">
                  <FormInput
                    label="Assign To"
                    value={assignedTo}
                    onChange={setAssignedTo}
                    placeholder="Technician name or ID"
                  />
                </div>
                <div className="col-span-2">
                  <FormDatePicker
                    label="Schedule Maintenance"
                    value={scheduledDate}
                    onChange={setScheduledDate}
                  />
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this maintenance prediction"
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
                    onClick={() => handleStatusUpdate("scheduled")}
                    disabled={!scheduledDate}
                    className="border-blue-600 hover:bg-blue-900/30"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule Maintenance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate("completed")}
                    className="border-green-600 hover:bg-green-900/30"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark as Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate("false_prediction")}
                    className="border-gray-600 hover:bg-gray-900/30"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Mark as False Prediction
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
