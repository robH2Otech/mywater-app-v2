
import { DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface ScrollableDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  maxHeight?: string;
  children: React.ReactNode;
  showScrollbar?: boolean;
}

export function ScrollableDialogContent({
  children,
  className,
  maxHeight = "80vh",
  showScrollbar = true,
  ...props
}: ScrollableDialogContentProps) {
  const [scrollPosition, setScrollPosition] = useState([0]);

  return (
    <DialogContent
      className={cn("p-0 overflow-hidden", className)}
      {...props}
    >
      <div className="flex flex-col h-full">
        <ScrollArea 
          className="w-full" 
          style={{ maxHeight }}
          onScrollPositionChange={(position) => {
            setScrollPosition([position.y / 100]);
          }}
        >
          <div className="p-6">{children}</div>
        </ScrollArea>
        
        {showScrollbar && (
          <div className="px-6 pb-4 pt-2">
            <Slider
              value={scrollPosition}
              min={0}
              max={1}
              step={0.01}
              onValueChange={setScrollPosition}
              className="w-full"
              aria-label="Scroll position"
            />
          </div>
        )}
      </div>
    </DialogContent>
  );
}
