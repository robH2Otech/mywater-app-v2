
import React, { useRef } from "react";
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
  maxHeight = "75vh"
}: ScrollableDialogContentProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={scrollContainerRef}
        className="scrollable-form overflow-y-auto px-2 custom-scrollbar"
        style={{ 
          maxHeight,
          paddingRight: isMobile ? '12px' : '20px',
          paddingLeft: isMobile ? '12px' : '20px',
          paddingBottom: '20px',
          paddingTop: '10px'
        }}
      >
        {children}
      </div>
      <div className="mt-4">
        <FormSlider containerRef={scrollContainerRef} />
      </div>
    </div>
  );
}
