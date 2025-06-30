
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-responsive";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: "primary" | "secondary";
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  show?: boolean;
  label?: string;
}

export function FloatingActionButton({
  icon,
  onClick,
  className,
  variant = "primary",
  position = "bottom-right",
  show = true,
  label
}: FloatingActionButtonProps) {
  const isMobile = useIsMobile();

  if (!isMobile || !show) return null;

  const getPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "bottom-6 left-6";
      case "bottom-center":
        return "bottom-6 left-1/2 -translate-x-1/2";
      default:
        return "bottom-6 right-6";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-white text-spotify-dark shadow-lg hover:bg-gray-50";
      default:
        return "bg-mywater-blue text-white shadow-lg hover:bg-mywater-blue/90";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "fixed z-50",
          getPositionClasses()
        )}
      >
        <Button
          onClick={onClick}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl border-0",
            getVariantClasses(),
            className
          )}
          aria-label={label}
        >
          {icon}
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
