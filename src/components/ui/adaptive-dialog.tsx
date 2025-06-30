
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/use-responsive";
import { X } from "lucide-react";

const AdaptiveDialog = DialogPrimitive.Root;
const AdaptiveDialogTrigger = DialogPrimitive.Trigger;

const AdaptiveDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
AdaptiveDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const AdaptiveDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    mobileFullScreen?: boolean;
  }
>(({ className, children, mobileFullScreen = true, ...props }, ref) => {
  const { isMobile } = useResponsive();

  return (
    <DialogPrimitive.Portal>
      <AdaptiveDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 bg-background border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          isMobile && mobileFullScreen
            ? "inset-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
            : "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] rounded-lg data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          isMobile && mobileFullScreen
            ? "w-full h-full rounded-none"
            : "w-full max-w-lg max-h-[90vh] overflow-y-auto",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={cn(
          "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
          isMobile ? "h-8 w-8" : "h-6 w-6"
        )}>
          <X className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
AdaptiveDialogContent.displayName = DialogPrimitive.Content.displayName;

const AdaptiveDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isMobile } = useResponsive();
  
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        isMobile ? "p-6 pb-4" : "p-6",
        className
      )}
      {...props}
    />
  );
};
AdaptiveDialogHeader.displayName = "AdaptiveDialogHeader";

const AdaptiveDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isMobile } = useResponsive();
  
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        isMobile ? "p-6 pt-4 gap-3" : "p-6 gap-2",
        className
      )}
      {...props}
    />
  );
};
AdaptiveDialogFooter.displayName = "AdaptiveDialogFooter";

const AdaptiveDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const { isMobile } = useResponsive();
  
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        isMobile ? "text-xl" : "text-lg",
        className
      )}
      {...props}
    />
  );
});
AdaptiveDialogTitle.displayName = DialogPrimitive.Title.displayName;

const AdaptiveDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AdaptiveDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  AdaptiveDialog,
  AdaptiveDialogTrigger,
  AdaptiveDialogContent,
  AdaptiveDialogHeader,
  AdaptiveDialogFooter,
  AdaptiveDialogTitle,
  AdaptiveDialogDescription,
};
