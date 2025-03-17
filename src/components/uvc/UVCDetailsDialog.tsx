
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { UVCProgressBar } from "./UVCProgressBar";
import { UVCDialogForm } from "./UVCDialogForm";
import { UVCDialogActions } from "./UVCDialogActions";
import { UVCDialogLoader } from "./UVCDialogLoader";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";

interface UVCDetailsDialogProps {
  unit: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedData: any) => void;
}

export function UVCDetailsDialog({ unit, open, onOpenChange, onSave }: UVCDetailsDialogProps) {
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
          
          // Get the latest data from Firestore for this unit
          const unitDocRef = doc(db, "units", unit.id);
          const unitSnapshot = await getDoc(unitDocRef);
          
          if (unitSnapshot.exists()) {
            const latestData = unitSnapshot.data();
            console.log(`UVCDetailsDialog - Latest data for unit ${unit.id}:`, latestData);
            
            // Parse base UVC hours from unit document
            let baseUvcHours = latestData.uvc_hours;
            if (typeof baseUvcHours === 'string') {
              baseUvcHours = parseFloat(baseUvcHours);
            } else if (baseUvcHours === undefined || baseUvcHours === null) {
              baseUvcHours = 0;
            }
            
            console.log(`UVCDetailsDialog - Unit ${unit.id} - Base UVC hours: ${baseUvcHours}`);
            console.log(`UVCDetailsDialog - Unit ${unit.id} - is_uvc_accumulated flag: ${latestData.is_uvc_accumulated}`);
            
            // Only fetch measurement data if this unit doesn't already use accumulated hours
            let totalUvcHours = baseUvcHours;
            
            if (!latestData.is_uvc_accumulated) {
              // Get latest measurement data for this unit to add to the base hours
              try {
                const measurementsQuery = query(
                  collection(db, "measurements"),
                  where("unit_id", "==", unit.id),
                  orderBy("timestamp", "desc"),
                  limit(1)
                );
                
                const measurementsSnapshot = await getDocs(measurementsQuery);
                
                if (!measurementsSnapshot.empty) {
                  const latestMeasurement = measurementsSnapshot.docs[0].data();
                  console.log(`UVCDetailsDialog - Latest measurement for unit ${unit.id}:`, latestMeasurement);
                  
                  if (latestMeasurement.uvc_hours !== undefined) {
                    const measurementUvcHours = typeof latestMeasurement.uvc_hours === 'string' 
                      ? parseFloat(latestMeasurement.uvc_hours) 
                      : (latestMeasurement.uvc_hours || 0);
                    
                    // Add measurement hours to the base hours
                    totalUvcHours += measurementUvcHours;
                    console.log(`UVCDetailsDialog - Unit ${unit.id}: Base UVC hours ${baseUvcHours} + Measurement ${measurementUvcHours} = Total ${totalUvcHours}`);
                  }
                }
              } catch (error) {
                console.error("Error fetching measurement data:", error);
              }
            } else {
              console.log(`UVCDetailsDialog - Unit ${unit.id}: Using accumulated hours (${baseUvcHours}), not adding measurement hours`);
            }
            
            setFormData({
              uvc_hours: totalUvcHours.toString(),
              uvc_installation_date: latestData.uvc_installation_date ? new Date(latestData.uvc_installation_date) : null,
            });
            
            console.log(`UVCDetailsDialog - Setting form data for unit ${unit.id}:`, {
              uvc_hours: totalUvcHours.toString(),
              uvc_installation_date: latestData.uvc_installation_date
            });
          } else {
            // Fallback to the data passed in props
            console.log(`UVCDetailsDialog - Unit ${unit.id} not found in Firestore, using props data:`, unit);
            
            setFormData({
              uvc_hours: unit.uvc_hours?.toString() || "0",
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
            uvc_hours: unit.uvc_hours?.toString() || "0",
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
      onOpenChange(false);
    }
  };

  if (!unit || !formData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="sm:max-w-[500px] w-[95vw] bg-spotify-darker border-spotify-accent">
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
            />
          </div>
        )}
      </ScrollableDialogContent>
    </Dialog>
  );
}
