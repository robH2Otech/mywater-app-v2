
import { UnitNameSection } from "./form/UnitNameSection";
import { UnitTypeSection } from "./form/UnitTypeSection";
import { UnitDetailsSection } from "./form/UnitDetailsSection";

interface UnitFormFieldsProps {
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
}

export function UnitFormFields({ formData, setFormData }: UnitFormFieldsProps) {
  return (
    <div className="space-y-6">
      <UnitNameSection formData={formData} setFormData={setFormData} />
      <UnitTypeSection formData={formData} setFormData={setFormData} />
      <UnitDetailsSection formData={formData} setFormData={setFormData} />
    </div>
  );
}
