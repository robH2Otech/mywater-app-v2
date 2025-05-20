
import { Timestamp } from "firebase/firestore";

export type ModelVersion = "v1" | "v2" | "v3";

export interface PredictionModel {
  id: string;
  name: string;
  description?: string;
  version: ModelVersion;
  configParams: {
    movingAverageWindow: number;
    standardDeviationThreshold: number;
    smoothingFactor: number;
    predictionDays: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  accuracy?: number;
}

export interface AnomalyDetection {
  id: string;
  unitId: string;
  unitName: string;
  detectionDate: string;
  type: "flow_rate" | "temperature" | "uvc_hours" | "volume_usage";
  severity: "low" | "medium" | "high";
  value: number;
  expectedValue: number;
  deviationPercentage: number;
  confidence: number;
  status: "new" | "reviewing" | "confirmed" | "false_positive" | "resolved";
  notes?: string;
  resolvedBy?: string;
  resolvedDate?: string;
  modelId: string;
}

export interface MaintenancePrediction {
  id: string;
  unitId: string;
  unitName: string;
  predictedDate: string;
  maintenanceType: "filter_change" | "uvc_replacement" | "general_service";
  confidence: number;
  priority: "low" | "medium" | "high";
  status: "predicted" | "scheduled" | "completed" | "false_prediction";
  estimatedDaysRemaining: number;
  notes?: string;
  assignedTo?: string;
  scheduledDate?: string;
  completedDate?: string;
  modelId: string;
}

export interface MLDashboardStats {
  totalAnomaliesDetected: number;
  activeAnomalies: number;
  predictedMaintenanceTasks: number;
  upcomingMaintenanceTasks: number;
  averageModelAccuracy: number;
  monitoredUnits: number;
}
