import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="bg-spotify-darker">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-1/3 bg-spotify-accent" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-2/3 bg-spotify-accent" />
              <Skeleton className="h-4 w-1/2 bg-spotify-accent" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}