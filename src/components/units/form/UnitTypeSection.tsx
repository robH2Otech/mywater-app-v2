
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface UnitTypeSectionProps {
  formData: {
    unit_type: string;
  };
  setFormData: (data: any) => void;
}

export function UnitTypeSection({ formData, setFormData }: UnitTypeSectionProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-400 block">Unit Type</label>
      <RadioGroup
        value={formData.unit_type}
        onValueChange={(value) => setFormData({ ...formData, unit_type: value })}
        className="flex flex-wrap gap-4 space-y-0"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="uvc" id="uvc" className="text-mywater-blue" />
          <Label htmlFor="uvc" className="text-sm text-white cursor-pointer">UVC Unit</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="drop" id="drop" className="text-mywater-blue" />
          <Label htmlFor="drop" className="text-sm text-white cursor-pointer">DROP Unit</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="office" id="office" className="text-mywater-blue" />
          <Label htmlFor="office" className="text-sm text-white cursor-pointer">Office Unit</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
