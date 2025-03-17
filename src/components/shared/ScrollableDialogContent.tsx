
import React, { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormSlider } from "./FormSlider";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScrollableDialogContentProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export function ScrollableDialogContent({
  children,
  className = "",
  maxHeight = "70vh"
}: ScrollableDialogContentProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={scrollContainerRef}
        className="scrollable-form overflow-y-auto pr-1"
        style={{ maxHeight }}
      >
        {children}
      </div>
      <FormSlider containerRef={scrollContainerRef} />
    </div>
  );
}
