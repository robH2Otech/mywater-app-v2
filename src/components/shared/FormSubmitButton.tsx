
import { Button } from "@/components/ui/button";

interface FormSubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  className?: string;
  label: string;
  loadingLabel: string;
}

export function FormSubmitButton({
  onClick,
  isLoading,
  disabled,
  className = "bg-spotify-green hover:bg-spotify-green/90",
  label,
  loadingLabel,
}: FormSubmitButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={className}
      disabled={disabled || isLoading}
    >
      {isLoading ? loadingLabel : label}
    </Button>
  );
}
