
import { useResponsive } from "@/hooks/use-responsive";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResponsiveTableProps {
  headers: string[];
  data: Array<Record<string, any>>;
  mobileCardRenderer?: (item: any, index: number) => React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function ResponsiveTable({ 
  headers, 
  data, 
  mobileCardRenderer,
  className = "",
  compact = false
}: ResponsiveTableProps) {
  const { isMobile, isTablet } = useResponsive();

  // Mobile Card View
  if (isMobile && mobileCardRenderer) {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((item, index) => (
          <Card key={index} className="p-4 bg-spotify-darker/95 border-spotify-accent/50 hover:border-spotify-accent transition-colors">
            {mobileCardRenderer(item, index)}
          </Card>
        ))}
      </div>
    );
  }

  // Tablet/Desktop Table View
  const tableContent = (
    <table className="min-w-full divide-y divide-gray-700">
      <thead>
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              className={cn(
                "text-left font-medium text-gray-400 uppercase tracking-wider",
                compact ? "px-3 py-2 text-2xs" : "px-4 py-3 text-xs",
                isMobile ? "text-2xs px-2 py-2" : ""
              )}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {data.map((item, index) => (
          <tr 
            key={index} 
            className={cn(
              "transition-colors hover:bg-spotify-accent/20",
              index % 2 === 0 ? 'bg-spotify-dark/50' : 'bg-spotify-darker/50'
            )}
          >
            {Object.values(item).map((value: any, cellIndex) => (
              <td 
                key={cellIndex} 
                className={cn(
                  "whitespace-nowrap text-white",
                  compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm",
                  isMobile ? "text-xs px-2 py-2" : ""
                )}
              >
                {value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  // For tablet, add horizontal scroll if needed
  if (isTablet) {
    return (
      <div className={cn("rounded-lg border border-spotify-accent/50 bg-spotify-darker/95", className)}>
        <ScrollArea className="w-full">
          <div className="min-w-full overflow-x-auto">
            {tableContent}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Desktop view
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-spotify-accent/50 bg-spotify-darker/95", className)}>
      {tableContent}
    </div>
  );
}
