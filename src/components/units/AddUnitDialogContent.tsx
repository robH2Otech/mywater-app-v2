
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
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-white">Add New Water Unit</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-6">
        <UnitFormFields formData={formData} setFormData={setFormData} />
        <UnitFormActions onCancel={onCancel} isSubmitting={isSubmitting} />
      </form>
    </>
  );
}
