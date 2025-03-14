
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { useState, useEffect } from "react";
import { MAX_UVC_HOURS, determineUVCStatus } from "@/utils/uvcStatusUtils";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";

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
          // Get the latest data from Firestore for this unit
          const unitDocRef = doc(db, "units", unit.id);
          const unitSnapshot = await getDoc(unitDocRef);
          
          if (unitSnapshot.exists()) {
            const latestData = unitSnapshot.data();
            
            // Parse base UVC hours from unit document
            let baseUvcHours = latestData.uvc_hours;
            if (typeof baseUvcHours === 'string') {
              baseUvcHours = parseFloat(baseUvcHours);
            } else if (baseUvcHours === undefined || baseUvcHours === null) {
              baseUvcHours = 0;
            }
            
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
                  if (latestMeasurement.uvc_hours !== undefined) {
                    const measurementUvcHours = typeof latestMeasurement.uvc_hours === 'string' 
                      ? parseFloat(latestMeasurement.uvc_hours) 
                      : (latestMeasurement.uvc_hours || 0);
                    
                    // Add measurement hours to the base hours
                    totalUvcHours += measurementUvcHours;
                    console.log(`Dialog - Unit ${unit.id}: Base UVC hours ${baseUvcHours} + Measurement ${measurementUvcHours} = Total ${totalUvcHours}`);
                  }
                }
              } catch (error) {
                console.error("Error fetching measurement data:", error);
              }
            }
            
            setFormData({
              uvc_hours: totalUvcHours.toString(),
              uvc_installation_date: latestData.uvc_installation_date ? new Date(latestData.uvc_installation_date) : null,
            });
          } else {
            // Fallback to the data passed in props
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
      
      onSave({
        ...formData,
        uvc_hours: hours,
        // When saving, the value is now considered accumulated (total)
      });
      onOpenChange(false);
    }
  };

  if (!unit || !formData) {
    return null;
  }

  const calculatePercentage = () => {
    const hours = parseFloat(formData.uvc_hours || "0");
    return Math.min(Math.round((hours / MAX_UVC_HOURS) * 100), 100);
  };

  const getPercentageClass = () => {
    const percentage = calculatePercentage();
    if (percentage > 90) return "text-red-500";
    if (percentage > 80) return "text-yellow-500";
    return "text-spotify-green";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {unit.name} - UVC Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green"></div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold flex justify-center items-end gap-2">
                <span className={getPercentageClass()}>{calculatePercentage()}%</span>
                <span className="text-lg text-gray-400">used</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                <div 
                  className={`h-2.5 rounded-full ${
                    calculatePercentage() > 90 ? 'bg-red-500' : 
                    calculatePercentage() > 80 ? 'bg-yellow-500' : 
                    'bg-spotify-green'
                  }`}
                  style={{ width: `${calculatePercentage()}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 mt-2">
                {formData.uvc_hours || "0"} / {MAX_UVC_HOURS.toLocaleString()} hours
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">
                Enter the total accumulated UVC hours for this unit.
              </p>
              <FormInput
                label="UVC Hours"
                type="number"
                value={formData.uvc_hours}
                onChange={(value) => setFormData({ ...formData, uvc_hours: value })}
              />
            </div>

            <FormDatePicker
              label="Installation Date"
              value={formData.uvc_installation_date}
              onChange={(date) => setFormData({ ...formData, uvc_installation_date: date })}
            />

            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="bg-spotify-accent hover:bg-spotify-accent-hover text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-spotify-green hover:bg-spotify-green/90 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
