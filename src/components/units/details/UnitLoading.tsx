
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface UnitLoadingProps {
  isMyWaterUnit?: boolean;
}

export function UnitLoading({ isMyWaterUnit = false }: UnitLoadingProps) {
  return (
    <div className="container mx-auto p-3 md:p-6 max-w-4xl">
      <Card className="bg-spotify-darker border-spotify-accent p-4 md:p-6">
        <div className="flex flex-col items-center justify-center h-48 md:h-72">
          <Loader2 className="h-8 w-8 text-spotify-accent animate-spin mb-4" />
          <h2 className="text-lg font-medium text-white mb-1">Loading unit details</h2>
          
          {isMyWaterUnit && (
            <p className="text-sm text-gray-400 text-center max-w-md mt-2">
              Loading MYWATER unit data, which may take a moment as we locate the correct data source.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
