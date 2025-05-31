
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";

interface ResponsiveTableProps {
  headers: string[];
  data: Array<Record<string, any>>;
  mobileCardRenderer?: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export function ResponsiveTable({ 
  headers, 
  data, 
  mobileCardRenderer,
  className = "" 
}: ResponsiveTableProps) {
  const isMobile = useIsMobile();

  if (isMobile && mobileCardRenderer) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item, index) => (
          <Card key={index} className="p-4 bg-spotify-darker border-spotify-accent">
            {mobileCardRenderer(item, index)}
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-spotify-dark' : 'bg-spotify-darker'}>
              {Object.values(item).map((value: any, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 whitespace-nowrap text-sm text-white">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
