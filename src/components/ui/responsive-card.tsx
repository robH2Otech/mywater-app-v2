
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ResponsiveCard({ 
  title, 
  children, 
  className = "",
  contentClassName = ""
}: ResponsiveCardProps) {
  const isMobile = useIsMobile();

  return (
    <Card className={`bg-spotify-darker border-spotify-accent ${className}`}>
      {title && (
        <CardHeader className={isMobile ? "p-4 pb-2" : "p-6 pb-4"}>
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} text-white`}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'} ${title ? (isMobile ? 'pt-2' : 'pt-0') : ''} ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}
