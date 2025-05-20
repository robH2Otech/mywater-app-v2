
export interface Measurement {
  id?: string;
  timestamp: number | Date;
  value: number;
  type: string;
  unit_id: string;
  [key: string]: any;
}

export interface MeasurementsHeaderProps {
  isLoading: boolean;
  measurementCount: number;
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export interface MeasurementsTableProps {
  measurements: Measurement[];
}

export interface EmptyMeasurementsProps {
  unitId: string;
}

export interface UnitMeasurementsProps {
  unitId: string;
  onMeasurementsLoaded?: (measurements: Measurement[]) => void;
}
