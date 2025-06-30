
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/use-responsive";

interface ResponsiveHeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function ResponsiveHeading({ children, level, className }: ResponsiveHeadingProps) {
  const { isMobile } = useResponsive();
  
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  const getResponsiveClasses = () => {
    const baseClasses = "font-semibold tracking-tight";
    
    switch (level) {
      case 1:
        return cn(
          baseClasses,
          isMobile ? "text-2xl" : "text-3xl lg:text-4xl",
          "leading-tight"
        );
      case 2:
        return cn(
          baseClasses,
          isMobile ? "text-xl" : "text-2xl lg:text-3xl",
          "leading-tight"
        );
      case 3:
        return cn(
          baseClasses,
          isMobile ? "text-lg" : "text-xl lg:text-2xl",
          "leading-snug"
        );
      case 4:
        return cn(
          baseClasses,
          isMobile ? "text-base" : "text-lg lg:text-xl",
          "leading-snug"
        );
      case 5:
        return cn(
          baseClasses,
          isMobile ? "text-sm" : "text-base lg:text-lg",
          "leading-normal"
        );
      case 6:
        return cn(
          baseClasses,
          isMobile ? "text-xs" : "text-sm lg:text-base",
          "leading-normal"
        );
      default:
        return baseClasses;
    }
  };

  return (
    <Component className={cn(getResponsiveClasses(), className)}>
      {children}
    </Component>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  className?: string;
}

export function ResponsiveText({ children, size = "base", className }: ResponsiveTextProps) {
  const { isMobile } = useResponsive();
  
  const getResponsiveClasses = () => {
    switch (size) {
      case "xs":
        return isMobile ? "text-2xs" : "text-xs";
      case "sm":
        return isMobile ? "text-xs" : "text-sm";
      case "base":
        return isMobile ? "text-sm" : "text-base";
      case "lg":
        return isMobile ? "text-base" : "text-lg";
      case "xl":
        return isMobile ? "text-lg" : "text-xl";
      default:
        return "text-base";
    }
  };

  return (
    <p className={cn(getResponsiveClasses(), "leading-relaxed", className)}>
      {children}
    </p>
  );
}
