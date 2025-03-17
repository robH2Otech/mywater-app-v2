
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollableDialogContent } from "@/components/shared/ScrollableDialogContent";

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
  };
  setFormData: (data: any) => void;
}

export function UnitFormFields({ formData, setFormData }: UnitFormFieldsProps) {
  return (
    <ScrollableDialogContent maxHeight="60vh">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <FormInput
          label="UVC Hours"
          type="number"
          value={formData.uvc_hours}
          onChange={(value) => setFormData({ ...formData, uvc_hours: value })}
          placeholder="Enter UVC start hours"
        />
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
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white h-10">
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
