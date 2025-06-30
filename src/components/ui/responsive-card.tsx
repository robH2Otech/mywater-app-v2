
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/lib/utils";

interface ResponsiveCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: "default" | "compact" | "feature";
}

export function ResponsiveCard({ 
  title, 
  children, 
  className = "",
  contentClassName = "",
  variant = "default"
}: ResponsiveCardProps) {
  const { isMobile, isTablet } = useResponsive();

  const getCardClasses = () => {
    const baseClasses = "bg-spotify-darker/95 backdrop-blur-sm border-spotify-accent/50 shadow-lg hover:shadow-xl transition-all duration-300";
    
    switch (variant) {
      case "compact":
        return cn(baseClasses, isMobile ? "rounded-lg" : "rounded-xl");
      case "feature":
        return cn(baseClasses, "bg-gradient-to-br from-mywater-accent/10 to-mywater-secondary/10 border-mywater-accent/30", isMobile ? "rounded-lg" : "rounded-xl");
      default:
        return cn(baseClasses, isMobile ? "rounded-lg" : "rounded-xl");
    }
  };

  const getPadding = () => {
    if (variant === "compact") {
      return isMobile ? "p-3" : "p-4";
    }
    return isMobile ? "p-4" : "p-6";
  };

  return (
    <Card className={cn(getCardClasses(), className)}>
      {title && (
        <CardHeader className={cn(getPadding(), "pb-2")}>
          <CardTitle className={cn(
            "text-white",
            isMobile ? 'text-lg' : 'text-xl lg:text-2xl'
          )}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(
        getPadding(),
        title ? (isMobile ? 'pt-2' : 'pt-0') : '',
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  );
}
