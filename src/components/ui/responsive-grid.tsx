
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/use-responsive";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  mobileColumns?: 1 | 2;
  tabletColumns?: 2 | 3 | 4;
  desktopColumns?: 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
}

export function ResponsiveGrid({
  children,
  className,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = "md"
}: ResponsiveGridProps) {
  const { isMobile, isTablet } = useResponsive();

  const getGridCols = () => {
    if (isMobile) return `grid-cols-${mobileColumns}`;
    if (isTablet) return `grid-cols-${tabletColumns}`;
    return `grid-cols-${desktopColumns}`;
  };

  const getGap = () => {
    switch (gap) {
      case "sm": return "gap-2 md:gap-3";
      case "lg": return "gap-4 md:gap-6 lg:gap-8";
      default: return "gap-3 md:gap-4 lg:gap-6";
    }
  };

  return (
    <div className={cn(
      "grid",
      getGridCols(),
      getGap(),
      className
    )}>
      {children}
    </div>
  );
}
