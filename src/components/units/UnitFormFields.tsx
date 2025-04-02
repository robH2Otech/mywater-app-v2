
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
    <ScrollableDialogContent maxHeight="65vh">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-1">
        <FormInput
          label="Unit Name"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          placeholder="MYWATER XXX"
          required
        />
        <FormInput
          label="Maintenance Contact"
          value={formData.contact_name}
          onChange={(value) => setFormData({ ...formData, contact_name: value })}
          placeholder="Enter contact name"
        />
        
        {/* Unit Type Selection */}
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="text-xs font-medium text-gray-400 block">Unit Type</label>
          <RadioGroup
            value={formData.unit_type}
            onValueChange={(value) => setFormData({ ...formData, unit_type: value })}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="uvc" id="uvc" className="text-mywater-blue" />
              <Label htmlFor="uvc" className="text-sm text-white cursor-pointer">UVC Unit</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="drop" id="drop" className="text-mywater-blue" />
              <Label htmlFor="drop" className="text-sm text-white cursor-pointer">DROP Unit</Label>
            </div>
          </RadioGroup>
        </div>

        <FormInput
          label="Location"
          value={formData.location}
          onChange={(value) => setFormData({ ...formData, location: value })}
          placeholder="Enter location"
        />
        <FormInput
          label="Email"
          type="email"
          value={formData.contact_email}
          onChange={(value) => setFormData({ ...formData, contact_email: value })}
          placeholder="Enter email"
        />
        <FormInput
          label="Total Volume (m³)"
          type="number"
          value={formData.total_volume}
          onChange={(value) => setFormData({ ...formData, total_volume: value })}
          placeholder="Enter volume"
          required
        />
        <FormInput
          label="Phone"
          type="tel"
          value={formData.contact_phone}
          onChange={(value) => setFormData({ ...formData, contact_phone: value })}
          placeholder="Enter phone number"
        />
        
        {/* Show UVC Hours only for UVC units */}
        {formData.unit_type === 'uvc' && (
          <FormInput
            label="UVC Hours"
            type="number"
            value={formData.uvc_hours}
            onChange={(value) => setFormData({ ...formData, uvc_hours: value })}
            placeholder="Enter UVC start hours"
          />
        )}

        <FormDatePicker
          label="Setup Date"
          value={formData.setup_date}
          onChange={(date) => setFormData({ ...formData, setup_date: date })}
        />
        <FormInput
          label="EID"
          value={formData.eid}
          onChange={(value) => setFormData({ ...formData, eid: value })}
          placeholder="e.g. 89001054010100176627012218592217"
        />
        <FormInput
          label="ICCID"
          value={formData.iccid}
          onChange={(value) => setFormData({ ...formData, iccid: value })}
          placeholder="e.g. 8944502701221859223"
        />
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white h-9">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-spotify-darker border-spotify-accent">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FormDatePicker
          label="Next Maintenance"
          value={formData.next_maintenance}
          onChange={(date) => setFormData({ ...formData, next_maintenance: date })}
        />
      </div>
    </ScrollableDialogContent>
  );
}
