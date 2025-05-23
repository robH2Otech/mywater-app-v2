
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
  maxHeight = "65vh"
}: ScrollableDialogContentProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={scrollContainerRef}
        className="scrollable-form overflow-y-auto custom-scrollbar"
        style={{ 
          maxHeight,
          paddingRight: isMobile ? '12px' : '18px',
          paddingLeft: isMobile ? '12px' : '18px',
          paddingBottom: '15px',
          paddingTop: '10px',
          marginRight: '-2px',  // Compensate for scrollbar
          overflowX: 'hidden'   // Prevent horizontal scroll
        }}
      >
        {children}
      </div>
      <div className="mt-2">
        <FormSlider containerRef={scrollContainerRef} />
      </div>
    </div>
  );
}
