
import { DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ScrollableDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  maxHeight?: string;
  children: React.ReactNode;
}

export function ScrollableDialogContent({
  children,
  className,
  maxHeight = "80vh",
  ...props
}: ScrollableDialogContentProps) {
  return (
    <DialogContent
      className={cn("p-0 overflow-hidden", className)}
      {...props}
    >
      <ScrollArea className={`w-full max-h-[${maxHeight}]`}>
        <div className="p-6">{children}</div>
      </ScrollArea>
    </DialogContent>
  );
}
