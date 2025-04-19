
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lightbulb, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDecimal } from "@/utils/measurements/formatUtils";
import { UVCProgressBar } from "./UVCProgressBar";
import { UVCDialogForm } from "./UVCDialogForm";
import { UVCDialogActions } from "./UVCDialogActions";
import { UVCDialogLoader } from "./UVCDialogLoader";
import { fetchLatestMeasurement } from "@/hooks/uvc/measurementUtils";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to fetch the latest data
  const fetchLatestData = async () => {
    if (!unit) return;
    
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
        let latestMeasurementTimestamp = null;
        
        if (!latestUnitData.is_uvc_accumulated) {
          const measurementData = await fetchLatestMeasurement(unit.id);
          
          if (measurementData.hasMeasurementData) {
            // Add measurement hours to the base hours
            totalUvcHours += measurementData.latestMeasurementUvcHours;
            latestMeasurementTimestamp = measurementData.timestamp;
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
        
        // Set last updated timestamp
        setLastUpdated(new Date().toLocaleTimeString());
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
      setIsRefreshing(false);
    }
  };

  // Fetch the latest data when dialog opens
  useEffect(() => {
    if (unit && open) {
      fetchLatestData();
    }
  }, [unit, open]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Invalidate queries to ensure fresh data
    await queryClient.invalidateQueries({ queryKey: ["uvc-units"] });
    await queryClient.invalidateQueries({ queryKey: ["units"] });
    await queryClient.invalidateQueries({ queryKey: ["unit", unit?.id] });
    await queryClient.invalidateQueries({ queryKey: ["measurements"] });
    
    // Fetch latest data
    await fetchLatestData();
    
    toast({
      title: "Data refreshed",
      description: "UVC data has been updated with latest measurements",
    });
  };

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
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              {unit.name} - UVC Details
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-400">Last updated: {lastUpdated}</p>
          )}
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
