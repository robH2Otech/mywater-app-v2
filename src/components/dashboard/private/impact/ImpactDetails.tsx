
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImpactDetailsProps {
  details: { label: string; value: string }[];
}

export function ImpactDetails({ details }: ImpactDetailsProps) {
  const isMobile = useIsMobile();
  
  // Filter out the details we want to keep
  const filteredDetails = details.filter(item => {
    const excludedLabels = [
      "Plastic bottles saved",
      "Purified water consumed", 
      "Plastic waste avoided", 
      "CO₂ emissions reduced", 
      "Estimated yearly impact", 
      "5-Year environmental impact",
      "Trees equivalent",
      "Car kilometers equivalent", 
      "Smartphone charges equivalent", 
      "Equivalent to recycling", 
      "Water footprint reduced", 
      "Energy saved", 
      "Money saved on bottled water"
    ];
    
    return !excludedLabels.includes(item.label);
  });
  
  // If there are no details to show after filtering, return null
  if (filteredDetails.length === 0) return null;
  
  return (
    <Card className="p-3 bg-spotify-darker">
      <ScrollArea className={`${isMobile ? "h-[120px]" : "h-[140px]"}`}>
        <div className="space-y-1.5 p-1">
          {filteredDetails.map((item, index) => (
            <div key={index} className="flex justify-between text-sm border-b border-gray-800 pb-1.5">
              <span className="text-gray-400">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
