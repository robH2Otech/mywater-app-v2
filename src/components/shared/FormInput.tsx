
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  className?: string;
}

export function FormInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  required = false,
  minLength,
  disabled = false,
  className
}: FormInputProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <label className="text-sm text-gray-400">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <Input
        type={type}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-spotify-accent border-spotify-accent-hover text-white ${isMobile ? 'text-base' : 'text-sm'}`}
        required={required}
        minLength={minLength}
        disabled={disabled}
      />
    </div>
  );
}
