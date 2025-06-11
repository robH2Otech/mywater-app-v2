
import { FormInput } from "@/components/shared/FormInput";
import { FormDatePicker } from "@/components/shared/FormDatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

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
  // Show/hide UVC hours based on unit type
  const showUVCFields = formData.unit_type === 'uvc';
  const [useCustomName, setUseCustomName] = useState(false);
  const [namePrefix, setNamePrefix] = useState("MYWATER");
  
  // Handle name prefix change
  const handlePrefixChange = (value: string) => {
    setNamePrefix(value);
    if (!useCustomName) {
      // Only update the name if we're not using a custom name
      const currentNumber = formData.name.split(' ')[1] || '';
      setFormData({ ...formData, name: `${value} ${currentNumber}` });
    }
  };
  
  // Toggle between custom and auto name
  const handleCustomNameToggle = (checked: boolean) => {
    setUseCustomName(checked);
    if (!checked) {
      // If switching back to auto-name, restore the formatted name
      const currentNumber = formData.name.split(' ')[1] || '';
      setFormData({ ...formData, name: `${namePrefix} ${currentNumber}` });
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">
      {/* Name Selection Mode */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-between bg-spotify-accent/20 p-3 rounded-md">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-white">Custom Name</h4>
          <p className="text-xs text-gray-400">
            {useCustomName ? "Enter any name for this unit" : "Use standard naming format"}
          </p>
        </div>
        <Switch 
          checked={useCustomName}
          onCheckedChange={handleCustomNameToggle}
          className="data-[state=checked]:bg-mywater-blue"
        />
      </div>
      
      {!useCustomName ? (
        <>
          {/* Predefined naming format */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Name Prefix</label>
            <Select
              value={namePrefix}
              onValueChange={handlePrefixChange}
            >
              <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white h-9">
                <SelectValue placeholder="Select prefix" />
              </SelectTrigger>
              <SelectContent className="bg-spotify-darker border-spotify-accent">
                <SelectItem value="MYWATER">MYWATER</SelectItem>
                <SelectItem value="X-WATER">X-WATER</SelectItem>
                <SelectItem value="AQUA">AQUA</SelectItem>
                <SelectItem value="PUREFLOW">PUREFLOW</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <FormInput
            label="Unit Number"
            value={formData.name.split(' ')[1] || ''}
            onChange={(value) => setFormData({ ...formData, name: `${namePrefix} ${value}` })}
            placeholder="e.g. 001"
            required
          />
        </>
      ) : (
        <FormInput
          label="Unit Name"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          placeholder="Enter unit name"
          required
          className="col-span-1 md:col-span-2"
        />
      )}
      
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
      {showUVCFields && (
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
  );
}
