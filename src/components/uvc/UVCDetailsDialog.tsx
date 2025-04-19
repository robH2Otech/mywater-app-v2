
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDecimal } from "@/utils/measurements/formatUtils";
import { UVCProgressBar } from "./UVCProgressBar";
import { UVCDialogForm } from "./UVCDialogForm";
import { UVCDialogActions } from "./UVCDialogActions";
import { UVCDialogLoader } from "./UVCDialogLoader";
import { getMeasurementsCollectionPath } from "@/hooks/measurements/useMeasurementCollection";
import { fetchLatestMeasurement } from "@/hooks/uvc/measurementUtils";

interface UVCDetailsDialogProps {
  unit: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedData: any) => void;
  isSaving?: boolean;
}

export function UVCDetailsDialog({ 
  unit, 
  open, 
  onOpenChange, 
  onSave,
  isSaving = false
}: UVCDetailsDialogProps) {
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch the latest data when dialog opens to ensure we have the most current values
  useEffect(() => {
    async function fetchLatestData() {
      if (unit && open) {
        setIsLoading(true);
        try {
          console.log(`UVCDetailsDialog - Fetching latest data for unit ${unit.id}`);
          
          // Get the latest unit data from Firestore
          const unitDocRef = doc(db, "units", unit.id);
          const unitSnapshot = await getDoc(unitDocRef);
          
          if (unitSnapshot.exists()) {
            const latestUnitData = unitSnapshot.data();
            console.log(`UVCDetailsDialog - Latest unit data for ${unit.id}:`, latestUnitData);
            
            // Parse base UVC hours from unit document
            let baseUvcHours = latestUnitData.uvc_hours;
            if (typeof baseUvcHours === 'string') {
              baseUvcHours = parseFloat(baseUvcHours);
            } else if (baseUvcHours === undefined || baseUvcHours === null) {
              baseUvcHours = 0;
            }
            
            // If this unit doesn't already use accumulated hours, get the latest measurement data
            let totalUvcHours = baseUvcHours;
            
            if (!latestUnitData.is_uvc_accumulated) {
              const measurementData = await fetchLatestMeasurement(unit.id);
              
              if (measurementData.hasMeasurementData) {
                // Add measurement hours to the base hours
                totalUvcHours += measurementData.latestMeasurementUvcHours;
                console.log(`UVCDetailsDialog - Unit ${unit.id}: Base ${baseUvcHours} + Measurement ${measurementData.latestMeasurementUvcHours} = Total ${totalUvcHours}`);
              }
            } else {
              console.log(`UVCDetailsDialog - Unit ${unit.id}: Using accumulated hours (${baseUvcHours}), not adding measurement hours`);
            }
            
            // Set form data with the calculated total hours
            setFormData({
              uvc_hours: formatDecimal(totalUvcHours),
              uvc_installation_date: latestUnitData.uvc_installation_date ? new Date(latestUnitData.uvc_installation_date) : null,
            });
          } else {
            // Fallback to the data passed in props
            console.log(`UVCDetailsDialog - Unit ${unit.id} not found in Firestore, using props data`);
            
            setFormData({
              uvc_hours: formatDecimal(unit.uvc_hours || 0),
              uvc_installation_date: unit.uvc_installation_date ? new Date(unit.uvc_installation_date) : null,
            });
          }
        } catch (error) {
          console.error("Error fetching latest UVC data:", error);
          toast({
            title: "Error",
            description: "Failed to load the latest UVC data",
            variant: "destructive",
          });
          
          // Fallback to the data passed in props
          setFormData({
            uvc_hours: formatDecimal(unit.uvc_hours || 0),
            uvc_installation_date: unit.uvc_installation_date ? new Date(unit.uvc_installation_date) : null,
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchLatestData();
  }, [unit, open, toast]);

  const handleSave = () => {
    if (onSave && formData) {
      // Convert uvc_hours to a number
      const hours = formData.uvc_hours ? parseFloat(formData.uvc_hours) : 0;
      
      console.log(`UVCDetailsDialog - Saving UVC hours for unit ${unit.id}: ${hours}`);
      
      onSave({
        ...formData,
        uvc_hours: hours,
      });
    }
  };

  if (!unit || !formData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {unit.name} - UVC Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <UVCDialogLoader />
        ) : (
          <div className="space-y-4 mt-3">
            <UVCProgressBar hours={formData.uvc_hours} />
            <UVCDialogForm formData={formData} setFormData={setFormData} />
            <UVCDialogActions 
              onCancel={() => onOpenChange(false)} 
              onSave={handleSave}
              isSaving={isSaving} 
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
