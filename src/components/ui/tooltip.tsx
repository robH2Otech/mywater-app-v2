
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  delay?: number;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

// Components that match shadcn/ui tooltip structure 
const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const TooltipTrigger = ({ 
  children, 
  asChild = false,
  ...props 
}: { 
  children: React.ReactNode;
  asChild?: boolean;
} & React.HTMLAttributes<HTMLElement>) => {
  const Comp = asChild ? React.Fragment : "span";
  return <Comp {...props}>{children}</Comp>;
};

const TooltipContent = ({ 
  children, 
  side = "top", 
  align = "center",
  hidden = false,
  className,
  ...props 
}: { 
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  hidden?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  if (hidden) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "z-50 rounded bg-slate-900/90 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export function Tooltip({
  children,
  content,
  delay = 0.3,
  side = "top",
  className
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  const positions = {
    top: { x: 0, y: -10 },
    right: { x: 10, y: 0 },
    bottom: { x: 0, y: 10 },
    left: { x: -10, y: 0 }
  };
  
  const showTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsMounted(true);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
  };
  
  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
    
    timeoutRef.current = setTimeout(() => {
      setIsMounted(false);
    }, 150);
  };
  
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      
      <AnimatePresence>
        {isMounted && (
          <motion.div 
            className={cn(
              "absolute z-50 whitespace-nowrap rounded bg-slate-900/90 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm",
              side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
              side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
              side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
              side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
              className
            )}
            initial={{ opacity: 0, ...positions[side] }}
            animate={{ opacity: isVisible ? 1 : 0, x: 0, y: 0 }}
            exit={{ opacity: 0, ...positions[side] }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export the shadcn-compatible tooltip components
export { TooltipProvider, TooltipTrigger, TooltipContent };
