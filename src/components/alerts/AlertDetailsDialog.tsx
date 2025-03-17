
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { AlertTriangle, Calendar, User, MessageSquare, FileText } from "lucide-react";
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { useState, useEffect, useRef } from "react";

interface AlertDetailsDialogProps {
  alert: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedData: any) => void;
}

export function AlertDetailsDialog({ alert, open, onOpenChange, onSave }: AlertDetailsDialogProps) {
  const [formData, setFormData] = useState<any>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alert) {
      setFormData({
        name: alert.name,
        location: alert.location || "",
        total_volume: alert.total_volume?.toString() || "",
        status: alert.status || "active",
        contact_name: alert.contact_name || "",
        contact_email: alert.contact_email || "",
        contact_phone: alert.contact_phone || "",
        next_maintenance: alert.next_maintenance ? new Date(alert.next_maintenance) : null,
      });
    }
  }, [alert]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      const currentPosition = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
      setScrollPosition(currentPosition * 100);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      contentRef.current.scrollTop = (maxScrollTop * value[0]) / 100;
    }
  };

  const handleSave = () => {
    if (onSave && formData) {
      onSave({
        ...formData,
        total_volume: formData.total_volume ? parseFloat(formData.total_volume) : null,
      });
    }
  };

  if (!alert || !formData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent relative p-0">
        <div 
          ref={contentRef} 
          className="form-dialog-content p-6 overflow-y-auto"
          onScroll={handleScroll}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alert Details
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <FormInput
              label="Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
            />

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
            />

            <FormInput
              label="Total Volume (m³)"
              type="number"
              value={formData.total_volume}
              onChange={(value) => setFormData({ ...formData, total_volume: value })}
            />

            <FormDatePicker
              label="Next Maintenance"
              value={formData.next_maintenance}
              onChange={(date) => setFormData({ ...formData, next_maintenance: date })}
            />

            <FormInput
              label="Contact Name"
              value={formData.contact_name}
              onChange={(value) => setFormData({ ...formData, contact_name: value })}
            />

            <FormInput
              label="Email"
              type="email"
              value={formData.contact_email}
              onChange={(value) => setFormData({ ...formData, contact_email: value })}
            />

            <FormInput
              label="Phone"
              value={formData.contact_phone}
              onChange={(value) => setFormData({ ...formData, contact_phone: value })}
            />
          </div>

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
        
        {/* Form Navigation Slider */}
        <div className="form-slider-container">
          <Slider
            value={[scrollPosition]} 
            onValueChange={handleSliderChange}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
