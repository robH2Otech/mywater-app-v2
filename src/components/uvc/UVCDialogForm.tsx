
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UVCDialogFormProps {
  formData: {
    uvc_hours: string;
    uvc_installation_date: Date | null;
  };
  setFormData: (data: any) => void;
}

export function UVCDialogForm({ formData, setFormData }: UVCDialogFormProps) {
  return (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-4 pr-4">
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
      </div>
    </ScrollArea>
  );
}
