
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormInput } from "@/components/shared/FormInput";
import { useState } from "react";

interface UnitNameSectionProps {
  formData: {
    name: string;
    unit_type: string;
  };
  setFormData: (data: any) => void;
}

export function UnitNameSection({ formData, setFormData }: UnitNameSectionProps) {
  const [useCustomName, setUseCustomName] = useState(false);
  const [namePrefix, setNamePrefix] = useState("MYWATER");
  
  const handlePrefixChange = (value: string) => {
    setNamePrefix(value);
    if (!useCustomName) {
      const currentNumber = formData.name.split(' ')[1] || '';
      setFormData({ ...formData, name: `${value} ${currentNumber}` });
    }
  };
  
  const handleCustomNameToggle = (checked: boolean) => {
    setUseCustomName(checked);
    if (!checked) {
      const currentNumber = formData.name.split(' ')[1] || '';
      setFormData({ ...formData, name: `${namePrefix} ${currentNumber}` });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-spotify-accent/20 p-3 rounded-md">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Name Prefix</label>
            <Select value={namePrefix} onValueChange={handlePrefixChange}>
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
        </div>
      ) : (
        <FormInput
          label="Unit Name"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          placeholder="Enter unit name"
          required
        />
      )}
    </div>
  );
}
