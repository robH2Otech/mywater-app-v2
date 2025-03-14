
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="bg-spotify-darker rounded-xl">
          <CardContent className="p-4">
            <Skeleton className="h-6 w-1/3 bg-spotify-accent rounded-lg" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-2/3 bg-spotify-accent rounded-lg" />
              <Skeleton className="h-4 w-1/2 bg-spotify-accent rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
