
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImpactDetailsProps {
  details: { label: string; value: string }[];
}

export function ImpactDetails({ details }: ImpactDetailsProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card className="p-4 bg-spotify-darker">
      <ScrollArea className={`${isMobile ? "h-[300px]" : "h-[350px]"}`}>
        <div className="space-y-2 p-1">
          {details.map((item, index) => (
            <div key={index} className="flex justify-between text-sm border-b border-gray-800 pb-2">
              <span className="text-gray-400">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
