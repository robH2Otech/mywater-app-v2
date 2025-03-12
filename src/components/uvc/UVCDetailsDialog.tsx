
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { useState, useEffect } from "react";
import { MAX_UVC_HOURS, determineUVCStatus } from "@/utils/uvcStatusUtils";

interface UVCDetailsDialogProps {
  unit: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedData: any) => void;
}

export function UVCDetailsDialog({ unit, open, onOpenChange, onSave }: UVCDetailsDialogProps) {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (unit) {
      setFormData({
        uvc_hours: unit.uvc_hours?.toString() || "0",
        uvc_installation_date: unit.uvc_installation_date ? new Date(unit.uvc_installation_date) : null,
      });
    }
  }, [unit]);

  const handleSave = () => {
    if (onSave && formData) {
      onSave({
        ...formData,
        uvc_hours: formData.uvc_hours ? parseFloat(formData.uvc_hours) : 0,
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

          <FormInput
            label="UVC Hours"
            type="number"
            value={formData.uvc_hours}
            onChange={(value) => setFormData({ ...formData, uvc_hours: value })}
          />

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
      </DialogContent>
    </Dialog>
  );
}
