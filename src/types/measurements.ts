
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
  isRefreshing: boolean;
  onRefresh: () => void;
  lastRefreshed: Date | null;
}

export interface MeasurementsTableProps {
  measurements: Measurement[];
  isUVCUnit: boolean;
}

export interface EmptyMeasurementsProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export interface UnitMeasurementsProps {
  unitId: string;
  onMeasurementsLoaded?: (measurements: Measurement[]) => void;
}
