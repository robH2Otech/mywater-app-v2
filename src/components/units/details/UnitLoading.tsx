
import React from 'react';
import { Card } from '@/components/ui/card';

export function UnitLoading() {
  return (
    <div className="container mx-auto p-3 md:p-6 max-w-4xl">
      <Card className="bg-spotify-darker border-spotify-accent p-4 md:p-6">
        <div className="animate-pulse space-y-3 md:space-y-4">
          <div className="h-6 md:h-8 bg-spotify-accent rounded w-1/3"></div>
          <div className="h-24 md:h-32 bg-spotify-accent rounded"></div>
          <div className="h-48 md:h-64 bg-spotify-accent rounded"></div>
        </div>
      </Card>
    </div>
  );
}
