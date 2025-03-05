
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, AlertOctagon, MapPin, Edit } from "lucide-react";
import { AlertDetailsDialog } from "./AlertDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUnitStatus, createAlertMessage } from "@/utils/unitStatusUtils";

interface AlertsListProps {
  units: any[];
  onAlertClick: (alert: any) => void;
}

export function AlertsList({ units, onAlertClick }: AlertsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "urgent":
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "active":
      default:
        return <Check className="h-5 w-5 text-spotify-green" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "urgent":
        return "Urgent Change";
      case "warning":
        return "Warning";
      case "active":
      default:
        return "Active";
    }
  };

  const handleEditClick = (e: React.MouseEvent, unit: any) => {
    e.stopPropagation();
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedData: any) => {
    try {
      // Convert total_volume to a number if it's a string
      const numericVolume = typeof updatedData.total_volume === 'string' 
        ? parseFloat(updatedData.total_volume) 
        : updatedData.total_volume;

      // Determine the new status based on the updated volume
      const newStatus = determineUnitStatus(numericVolume);
      
      // Update the unit document
      const unitDocRef = doc(db, "units", selectedUnit.id);
      await updateDoc(unitDocRef, {
        name: updatedData.name,
        location: updatedData.location || null,
        total_volume: numericVolume,
        status: newStatus,
        contact_name: updatedData.contact_name || null,
        contact_email: updatedData.contact_email || null,
        contact_phone: updatedData.contact_phone || null,
        next_maintenance: updatedData.next_maintenance || null,
        updated_at: new Date().toISOString()
      });

      // Check if the new status requires an alert
      if (newStatus === 'warning' || newStatus === 'urgent') {
        // Only create alert if status changed or it's urgent
        if (selectedUnit.status !== newStatus || newStatus === 'urgent') {
          const alertMessage = createAlertMessage(updatedData.name, numericVolume, newStatus);
          
          // Add a new alert to the alerts collection
          const alertsCollection = collection(db, "alerts");
          await addDoc(alertsCollection, {
            unit_id: selectedUnit.id,
            message: alertMessage,
            status: newStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Success",
        description: "Alert unit has been updated successfully",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating unit:', error);
      toast({
        title: "Error",
        description: "Failed to update alert unit",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {units.map((unit) => (
          <Card 
            key={unit.id} 
            className="bg-spotify-darker hover:bg-spotify-accent/40 transition-colors cursor-pointer relative group"
            onClick={() => onAlertClick(unit)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => handleEditClick(e, unit)}
            >
              <Edit className="h-4 w-4 text-white" />
            </Button>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-white">{unit.name}</h3>
                    {unit.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                        <MapPin className="h-4 w-4" />
                        {unit.location}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(unit.status)}
                    <span className="text-sm font-medium">
                      {getStatusText(unit.status)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-left">
                  <div className="text-sm text-gray-400">
                    Total Volume: {unit.total_volume ? `${unit.total_volume} m³` : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDetailsDialog
        alert={selectedUnit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />
    </>
  );
}
