
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResponsive } from "@/hooks/use-responsive";

interface OptimizedLoadingSkeletonProps {
  type?: "cards" | "table" | "chart" | "form";
  count?: number;
}

export function OptimizedLoadingSkeleton({ 
  type = "cards", 
  count = 3 
}: OptimizedLoadingSkeletonProps) {
  const { isMobile } = useResponsive();

  if (type === "table") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full bg-spotify-accent/20" />
        {[...Array(count)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-12 w-12 rounded bg-spotify-accent/20" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4 bg-spotify-accent/20" />
              <Skeleton className="h-4 w-1/2 bg-spotify-accent/20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <Card className="bg-spotify-darker/95">
        <CardHeader>
          <Skeleton className="h-6 w-1/3 bg-spotify-accent/20" />
        </CardHeader>
        <CardContent>
          <Skeleton className={`bg-spotify-accent/20 ${isMobile ? "h-48" : "h-64"}`} />
        </CardContent>
      </Card>
    );
  }

  if (type === "form") {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24 bg-spotify-accent/20" />
            <Skeleton className="h-10 w-full bg-spotify-accent/20" />
          </div>
        ))}
      </div>
    );
  }

  // Default cards layout
  return (
    <div className={isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="bg-spotify-darker/95">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-1/3 bg-spotify-accent/20 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-spotify-accent/20" />
              <Skeleton className="h-4 w-2/3 bg-spotify-accent/20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
