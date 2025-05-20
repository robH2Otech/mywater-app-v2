
import React, { useState, useEffect } from 'react';
import { MeasurementsTable } from './measurements/MeasurementsTable';
import { MeasurementsHeader } from './measurements/MeasurementsHeader';
import { EmptyMeasurements } from './measurements/EmptyMeasurements';
import { useRealtimeMeasurements } from '@/hooks/measurements/useRealtimeMeasurements';
import { SampleDataGenerator } from './measurements/SampleDataGenerator';

interface UnitMeasurementsProps {
  unitId: string;
  onMeasurementsLoaded?: (measurements: any[]) => void;
}

export function UnitMeasurements({ unitId, onMeasurementsLoaded }: UnitMeasurementsProps) {
  const { measurements, isLoading, error } = useRealtimeMeasurements(unitId);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    // When measurements are loaded, pass them to the parent component if the callback exists
    if (measurements && measurements.length > 0 && onMeasurementsLoaded) {
      onMeasurementsLoaded(measurements);
    }
  }, [measurements, onMeasurementsLoaded]);

  const filteredMeasurements = measurements || [];

  if (error) {
    return <div className="text-red-500 p-4">Error loading measurements: {error.message}</div>;
  }

  return (
    <div className="flex flex-col">
      <MeasurementsHeader 
        isLoading={isLoading} 
        measurementCount={filteredMeasurements.length} 
        timeRange={timeRange} 
        setTimeRange={setTimeRange}
      />
      
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading measurements...</p>
        </div>
      ) : filteredMeasurements.length > 0 ? (
        <MeasurementsTable measurements={filteredMeasurements} />
      ) : (
        <EmptyMeasurements unitId={unitId} />
      )}
      
      {/* Hidden component that can generate sample data if needed */}
      <SampleDataGenerator />
    </div>
  );
}
