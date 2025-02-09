
import { Input } from "@/components/ui/input";

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}

export function FormInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  required = false,
  minLength
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">{label}</label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-spotify-accent border-spotify-accent-hover text-white"
        required={required}
        minLength={minLength}
      />
    </div>
  );
}
