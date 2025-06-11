
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UnitFormFields } from "./UnitFormFields";
import { UnitFormActions } from "./UnitFormActions";

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
}

export function AddUnitDialogContent({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isSubmitting
}: AddUnitDialogContentProps) {
  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="px-6 py-4 border-b border-spotify-accent shrink-0">
        <DialogTitle className="text-xl font-semibold text-white">Add New Water Unit</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={onSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <UnitFormFields formData={formData} setFormData={setFormData} />
        </div>
        <div className="shrink-0">
          <UnitFormActions onCancel={onCancel} isSubmitting={isSubmitting} />
        </div>
      </form>
    </div>
  );
}
