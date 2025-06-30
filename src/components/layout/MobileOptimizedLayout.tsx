
import { ReactNode } from "react";
import { useResponsive } from "@/hooks/use-responsive";
import { ResponsiveLayout } from "./ResponsiveLayout";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Plus } from "lucide-react";

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  showFAB?: boolean;
  onFABClick?: () => void;
  fabIcon?: ReactNode;
  fabLabel?: string;
}

export function MobileOptimizedLayout({ 
  children, 
  showFAB = false,
  onFABClick,
  fabIcon = <Plus className="h-6 w-6" />,
  fabLabel = "Add new"
}: MobileOptimizedLayoutProps) {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveLayout>
      <div className="relative">
        {children}
        
        {showFAB && onFABClick && (
          <FloatingActionButton
            icon={fabIcon}
            onClick={onFABClick}
            show={isMobile}
            label={fabLabel}
          />
        )}
      </div>
    </ResponsiveLayout>
  );
}
