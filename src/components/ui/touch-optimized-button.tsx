
import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsTouchDevice } from "@/hooks/use-responsive";

export interface TouchOptimizedButtonProps extends ButtonProps {
  touchSize?: "default" | "large";
}

const TouchOptimizedButton = React.forwardRef<
  HTMLButtonElement,
  TouchOptimizedButtonProps
>(({ className, touchSize = "default", ...props }, ref) => {
  const isTouchDevice = useIsTouchDevice();

  const getTouchClasses = () => {
    if (!isTouchDevice) return "";
    
    switch (touchSize) {
      case "large":
        return "min-h-[48px] px-6 py-3 text-base";
      default:
        return "min-h-[44px] min-w-[44px]";
    }
  };

  return (
    <Button
      ref={ref}
      className={cn(
        getTouchClasses(),
        isTouchDevice && "active:scale-95 transition-transform duration-100",
        className
      )}
      {...props}
    />
  );
});
TouchOptimizedButton.displayName = "TouchOptimizedButton";

export { TouchOptimizedButton };
