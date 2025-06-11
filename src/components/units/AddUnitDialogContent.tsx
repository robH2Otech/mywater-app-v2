
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UnitFormFields } from "./UnitFormFields";
import { UnitFormActions } from "./UnitFormActions";
import { FormSlider } from "@/components/shared/FormSlider";
import { useRef } from "react";

interface AddUnitDialogContentProps {
  formData: {
    name: string;
    location: string;
    total_volume: string;
    status: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    next_maintenance: Date | null;
    setup_date: Date | null;
    uvc_hours: string;
    eid: string;
    iccid: string;
    unit_type: string;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export function AddUnitDialogContent({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false
}: AddUnitDialogContentProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <DialogHeader className="px-6 py-4 border-b border-spotify-accent shrink-0">
        <DialogTitle className="text-xl font-semibold text-white">
          {isEdit ? "Edit Water Unit" : "Add New Water Unit"}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={onSubmit} className="flex flex-col h-full min-h-0">
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 min-h-0"
        >
          <UnitFormFields formData={formData} setFormData={setFormData} />
        </div>
        
        <div className="px-6">
          <FormSlider containerRef={scrollContainerRef} />
        </div>
        
        <div className="shrink-0 border-t border-spotify-accent">
          <UnitFormActions 
            onCancel={onCancel} 
            isSubmitting={isSubmitting} 
            isEdit={isEdit}
          />
        </div>
      </form>
    </div>
  );
}
