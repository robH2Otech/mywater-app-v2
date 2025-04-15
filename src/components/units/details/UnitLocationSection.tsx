
import React from 'react';
import { UnitLocationLink } from '@/components/units/UnitLocationLink';
import { UnitData } from '@/types/analytics';

interface UnitLocationSectionProps {
  unit: UnitData;
  unitId: string;
}

export function UnitLocationSection({ unit, unitId }: UnitLocationSectionProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-white">{unit.name || 'Unnamed Unit'}</h2>
      {unit.iccid && <UnitLocationLink unitId={unitId} iccid={unit.iccid} />}
    </div>
  );
}
