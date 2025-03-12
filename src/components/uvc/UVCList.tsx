import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, AlertOctagon, MapPin, Edit, Clock, Lightbulb } from "lucide-react";
import { UVCDetailsDialog } from "./UVCDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { determineUVCStatus, createUVCAlertMessage, calculateUVCLifePercentage, MAX_UVC_HOURS, WARNING_THRESHOLD, URGENT_THRESHOLD } from "@/utils/uvcStatusUtils";

interface UVCListProps {
  units: any[];
  onUVCClick: (unit: any) => void;
}

export function UVCList({ units, onUVCClick }: UVCListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [processedUnits, setProcessedUnits] = useState<any[]>([]);

  useEffect(() => {
    const updatedUnits = units.map(unit => {
      const uvcHours = unit.uvc_hours || 0;
      const calculatedStatus = determineUVCStatus(uvcHours);
      
      if (unit.uvc_status !== calculatedStatus) {
        updateUVCStatus(unit.id, calculatedStatus, unit.name, uvcHours);
      }
      
      return {
        ...unit,
        uvc_status: calculatedStatus
      };
    });
    
    setProcessedUnits(updatedUnits);
  }, [units]);

  const updateUVCStatus = async (unitId: string, newStatus: string, unitName: string, hours: number) => {
    try {
      const unitDocRef = doc(db, "units", unitId);
      await updateDoc(unitDocRef, {
        uvc_status: newStatus,
        updated_at: new Date().toISOString()
      });

      if (newStatus === 'warning' || newStatus === 'urgent') {
        const alertMessage = createUVCAlertMessage(unitName, hours, newStatus);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: unitId,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Status updated",
        description: `${unitName} UVC status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating UVC status:', error);
    }
  };

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
        return "Replace Soon";
      case "warning":
        return "Maintenance Required";
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
      const numericHours = typeof updatedData.uvc_hours === 'string' 
        ? parseFloat(updatedData.uvc_hours) 
        : updatedData.uvc_hours;
      
      const newStatus = determineUVCStatus(numericHours);
      
      const unitDocRef = doc(db, "units", selectedUnit.id);
      await updateDoc(unitDocRef, {
        uvc_hours: numericHours,
        uvc_installation_date: updatedData.uvc_installation_date,
        uvc_status: newStatus,
        updated_at: new Date().toISOString()
      });

      if (newStatus === 'warning' || newStatus === 'urgent') {
        const alertMessage = createUVCAlertMessage(selectedUnit.name, numericHours, newStatus);
        
        const alertsCollection = collection(db, "alerts");
        await addDoc(alertsCollection, {
          unit_id: selectedUnit.id,
          message: alertMessage,
          status: newStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['uvc-units'] });
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
      toast({
        title: "Success",
        description: "UVC information has been updated successfully",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating UVC info:', error);
      toast({
        title: "Error",
        description: "Failed to update UVC information",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processedUnits.map((unit) => {
          const uvcHours = unit.uvc_hours || 0;
          const lifePercentage = calculateUVCLifePercentage(uvcHours);
          const hoursRemaining = MAX_UVC_HOURS - uvcHours;
          
          return (
            <Card 
              key={unit.id} 
              className={`hover:bg-spotify-accent/40 transition-colors cursor-pointer relative group ${
                unit.uvc_status === 'urgent' ? 'bg-red-900/20' : 
                unit.uvc_status === 'warning' ? 'bg-yellow-900/20' : 
                'bg-spotify-darker'
              }`}
              onClick={() => onUVCClick(unit)}
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
                      {getStatusIcon(unit.uvc_status)}
                      <span className={`text-sm font-medium ${
                        unit.uvc_status === 'urgent' ? 'text-red-400' : 
                        unit.uvc_status === 'warning' ? 'text-yellow-400' : 
                        'text-green-400'
                      }`}>
                        {getStatusText(unit.uvc_status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Lightbulb className={`h-4 w-4 ${
                        uvcHours >= URGENT_THRESHOLD ? 'text-red-400' :
                        uvcHours >= WARNING_THRESHOLD ? 'text-yellow-400' :
                        'text-green-400'
                      }`} />
                      UVC Hours: {uvcHours.toLocaleString()} / {MAX_UVC_HOURS.toLocaleString()}
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          uvcHours >= URGENT_THRESHOLD ? 'bg-red-500' : 
                          uvcHours >= WARNING_THRESHOLD ? 'bg-yellow-500' : 
                          'bg-spotify-green'
                        }`}
                        style={{ width: `${lifePercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      {hoursRemaining > 0 
                        ? `Hours remaining: ${hoursRemaining.toLocaleString()}`
                        : 'Replacement overdue'
                      }
                    </div>
                    
                    {unit.uvc_installation_date && (
                      <div className="text-sm text-gray-400">
                        Installed: {new Date(unit.uvc_installation_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <UVCDetailsDialog
        unit={selectedUnit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />
    </>
  );
}
