
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

interface UnitErrorProps {
  error: Error;
}

export function UnitError({ error }: UnitErrorProps) {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-3 md:p-6 max-w-4xl">
      <Card className="bg-spotify-darker border-spotify-accent p-4 md:p-6">
        <div className="text-red-400 p-3 md:p-4">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Error loading unit details</h2>
          <p className="text-sm md:text-base">{error.message || "An unknown error occurred"}</p>
          <button 
            onClick={() => navigate("/units")} 
            className="mt-3 md:mt-4 bg-spotify-accent px-3 py-1.5 md:px-4 md:py-2 rounded hover:bg-spotify-accent-hover text-sm md:text-base"
          >
            Back to Units
          </button>
        </div>
      </Card>
    </div>
  );
}
