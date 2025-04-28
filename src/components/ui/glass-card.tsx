
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: boolean;
  hover?: boolean;
  animation?: "none" | "subtle" | "lift";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, gradient = false, hover = true, animation = "subtle", ...props }, ref) => {
    const variants = {
      subtle: {
        hover: { scale: 1.01, y: -2 },
      },
      lift: {
        hover: { scale: 1.03, y: -4 },
      },
      none: {
        hover: {},
      }
    };

    const cardContent = (
      <div
        ref={ref}
        className={cn(
          "rounded-xl backdrop-blur-md border border-white/10",
          "bg-gradient-glass shadow-lg relative overflow-hidden",
          hover && "transition-all duration-300",
          gradient && "bg-gradient-card",
          className
        )}
        {...props}
      >
        {/* Subtle highlight effect at the top */}
        {gradient && (
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        
        {/* Content */}
        {children}
      </div>
    );

    // Return with or without motion wrapper based on animation setting
    if (animation === "none" || !hover) {
      return cardContent;
    }

    return (
      <motion.div
        whileHover={variants[animation].hover}
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
