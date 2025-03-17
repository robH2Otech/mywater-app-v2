
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function NoDataCard() {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-spotify-darker border-spotify-accent`}>
      <div className="text-center">
        <FileText className={`${isMobile ? 'h-12 w-12 mb-3' : 'h-16 w-16 mb-4'} mx-auto text-gray-400`} />
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-2`}>No Data Available</h3>
        <p className="text-gray-400 mb-4 text-sm md:text-base">
          There is no measurement data available for the selected period.
        </p>
      </div>
    </Card>
  );
}
