
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AnomalyDetection, PredictionModel, MaintenancePrediction, MLDashboardStats } from "@/types/ml";
import { useToast } from "@/hooks/use-toast";
import { ProcessedMeasurement } from "@/hooks/measurements/types/measurementTypes";
import { processAnomalies } from "@/utils/ml/anomalyDetection";
import { predictMaintenance } from "@/utils/ml/predictiveMaintenance";

// Default prediction model configuration
const DEFAULT_MODEL: PredictionModel = {
  id: "default-predictive-model",
  name: "Default Predictive Model",
  description: "Basic statistical model for anomaly detection and predictive maintenance",
  version: "v1",
  configParams: {
    movingAverageWindow: 7,
    standardDeviationThreshold: 2.5,
    smoothingFactor: 0.3,
    predictionDays: 30
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: "system",
  isActive: true
};

export function useMLOperations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch active prediction model
  const { data: activeModel = DEFAULT_MODEL, isLoading: isModelLoading } = useQuery({
    queryKey: ["ml-model", "active"],
    queryFn: async () => {
      try {
        const modelsCollection = collection(db, "prediction_models");
        const modelsQuery = query(
          modelsCollection,
          where("isActive", "==", true),
          orderBy("updatedAt", "desc"),
          limit(1)
        );
        
        const modelSnapshot = await getDocs(modelsQuery);
        
        if (modelSnapshot.empty) {
          // No active model found, create default model
          const modelRef = doc(db, "prediction_models", DEFAULT_MODEL.id);
          await setDoc(modelRef, DEFAULT_MODEL);
          return DEFAULT_MODEL;
        }
        
        return {
          id: modelSnapshot.docs[0].id,
          ...modelSnapshot.docs[0].data()
        } as PredictionModel;
      } catch (error) {
        console.error("Error fetching ML model:", error);
        return DEFAULT_MODEL;
      }
    }
  });
  
  // Fetch existing anomalies
  const { data: anomalies = [], isLoading: isAnomaliesLoading } = useQuery({
    queryKey: ["ml-anomalies"],
    queryFn: async () => {
      try {
        const anomaliesCollection = collection(db, "anomaly_detections");
        const anomaliesQuery = query(
          anomaliesCollection,
          where("status", "in", ["new", "reviewing", "confirmed"]),
          orderBy("detectionDate", "desc")
        );
        
        const anomaliesSnapshot = await getDocs(anomaliesQuery);
        
        return anomaliesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AnomalyDetection[];
      } catch (error) {
        console.error("Error fetching anomalies:", error);
        return [];
      }
    }
  });
  
  // Fetch maintenance predictions
  const { data: predictions = [], isLoading: isPredictionsLoading } = useQuery({
    queryKey: ["ml-predictions"],
    queryFn: async () => {
      try {
        const predictionsCollection = collection(db, "maintenance_predictions");
        const predictionsQuery = query(
          predictionsCollection,
          where("status", "in", ["predicted", "scheduled"]),
          orderBy("predictedDate", "asc")
        );
        
        const predictionsSnapshot = await getDocs(predictionsQuery);
        
        return predictionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MaintenancePrediction[];
      } catch (error) {
        console.error("Error fetching predictions:", error);
        return [];
      }
    }
  });
  
  // Fetch dashboard stats
  const { data: mlStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["ml-stats"],
    queryFn: async () => {
      try {
        const totalAnomaliesQuery = query(
          collection(db, "anomaly_detections")
        );
        const activeAnomaliesQuery = query(
          collection(db, "anomaly_detections"),
          where("status", "in", ["new", "reviewing"])
        );
        const predictionsQuery = query(
          collection(db, "maintenance_predictions"),
          where("status", "in", ["predicted", "scheduled"])
        );
        const upcomingMaintenanceQuery = query(
          collection(db, "maintenance_predictions"),
          where("status", "==", "predicted"),
          where("priority", "in", ["high", "medium"])
        );
        const unitsQuery = query(collection(db, "units"));
        
        // Execute all queries in parallel
        const [
          totalAnomaliesSnapshot,
          activeAnomaliesSnapshot,
          predictionsSnapshot,
          upcomingMaintenanceSnapshot,
          unitsSnapshot
        ] = await Promise.all([
          getDocs(totalAnomaliesQuery),
          getDocs(activeAnomaliesQuery),
          getDocs(predictionsQuery),
          getDocs(upcomingMaintenanceQuery),
          getDocs(unitsQuery)
        ]);
        
        return {
          totalAnomaliesDetected: totalAnomaliesSnapshot.size,
          activeAnomalies: activeAnomaliesSnapshot.size,
          predictedMaintenanceTasks: predictionsSnapshot.size,
          upcomingMaintenanceTasks: upcomingMaintenanceSnapshot.size,
          averageModelAccuracy: activeModel.accuracy || 75, // Default accuracy if not set
          monitoredUnits: unitsSnapshot.size
        } as MLDashboardStats;
      } catch (error) {
        console.error("Error fetching ML stats:", error);
        return {
          totalAnomaliesDetected: 0,
          activeAnomalies: 0,
          predictedMaintenanceTasks: 0,
          upcomingMaintenanceTasks: 0,
          averageModelAccuracy: 75,
          monitoredUnits: 0
        };
      }
    }
  });
  
  // Process measurements to detect anomalies
  const processUnitMeasurements = useCallback(async (
    unitId: string,
    unitName: string,
    measurements: ProcessedMeasurement[]
  ) => {
    setIsProcessing(true);
    
    try {
      // 1. Detect anomalies
      const detectedAnomalies = processAnomalies(
        measurements,
        activeModel,
        unitId,
        unitName
      );
      
      // 2. Store new anomalies in database
      if (detectedAnomalies.length > 0) {
        const anomaliesCollection = collection(db, "anomaly_detections");
        
        for (const anomaly of detectedAnomalies) {
          await addDoc(anomaliesCollection, anomaly);
        }
        
        // Only show toast for significant findings
        if (detectedAnomalies.some(a => a.severity === "high")) {
          toast({
            title: "Anomalies Detected",
            description: `${detectedAnomalies.length} anomalies found in unit ${unitName}`,
            variant: "destructive"
          });
        }
      }
      
      // 3. Invalidate anomalies query to refresh data
      queryClient.invalidateQueries({ queryKey: ["ml-anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["ml-stats"] });
      
      return detectedAnomalies;
    } catch (error) {
      console.error("Error processing unit measurements:", error);
      toast({
        title: "Error",
        description: "Failed to process measurements for anomaly detection",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [activeModel, queryClient, toast]);
  
  // Update anomaly status mutation
  const updateAnomalyStatus = useMutation({
    mutationFn: async ({ 
      anomalyId, 
      status, 
      notes 
    }: { 
      anomalyId: string; 
      status: AnomalyDetection['status']; 
      notes?: string 
    }) => {
      const anomalyRef = doc(db, "anomaly_detections", anomalyId);
      await updateDoc(anomalyRef, {
        status,
        notes: notes || "",
        updatedAt: new Date().toISOString()
      });
      return { anomalyId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ml-anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["ml-stats"] });
      toast({
        title: "Anomaly Updated",
        description: "The anomaly status has been updated successfully"
      });
    }
  });
  
  // Generate predictions for a unit
  const generatePredictions = useCallback(async (
    unit: any,
    measurements: ProcessedMeasurement[]
  ) => {
    setIsProcessing(true);
    
    try {
      // 1. Generate predictions
      const maintenancePredictions = predictMaintenance(
        unit,
        measurements,
        activeModel
      );
      
      // 2. Store new predictions in database
      if (maintenancePredictions.length > 0) {
        const predictionsCollection = collection(db, "maintenance_predictions");
        
        // Check for existing predictions for this unit
        const existingQuery = query(
          predictionsCollection,
          where("unitId", "==", unit.id),
          where("status", "in", ["predicted", "scheduled"])
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        const existingMap = new Map();
        existingSnapshot.docs.forEach(doc => {
          const data = doc.data();
          existingMap.set(data.maintenanceType, {
            id: doc.id,
            ...data
          });
        });
        
        // Store each prediction, updating existing ones if needed
        for (const prediction of maintenancePredictions) {
          const existing = existingMap.get(prediction.maintenanceType);
          
          if (existing) {
            // Update existing prediction if the new one is more urgent
            if (
              prediction.priority === "high" || 
              (prediction.priority === "medium" && existing.priority !== "high")
            ) {
              const predictionRef = doc(db, "maintenance_predictions", existing.id);
              await updateDoc(predictionRef, {
                predictedDate: prediction.predictedDate,
                priority: prediction.priority,
                confidence: prediction.confidence,
                estimatedDaysRemaining: prediction.estimatedDaysRemaining,
                updatedAt: new Date().toISOString()
              });
            }
          } else {
            // Add new prediction
            await addDoc(predictionsCollection, prediction);
          }
        }
        
        // Only show toast for significant findings
        if (maintenancePredictions.some(p => p.priority === "high")) {
          toast({
            title: "Maintenance Predictions Generated",
            description: `${maintenancePredictions.length} maintenance tasks predicted for ${unit.name}`
          });
        }
      }
      
      // 3. Invalidate predictions query to refresh data
      queryClient.invalidateQueries({ queryKey: ["ml-predictions"] });
      queryClient.invalidateQueries({ queryKey: ["ml-stats"] });
      
      return maintenancePredictions;
    } catch (error) {
      console.error("Error generating maintenance predictions:", error);
      toast({
        title: "Error",
        description: "Failed to generate maintenance predictions",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [activeModel, queryClient, toast]);
  
  // Update prediction status mutation
  const updatePredictionStatus = useMutation({
    mutationFn: async ({ 
      predictionId, 
      status, 
      scheduledDate, 
      assignedTo, 
      notes 
    }: { 
      predictionId: string; 
      status: MaintenancePrediction['status']; 
      scheduledDate?: string;
      assignedTo?: string;
      notes?: string 
    }) => {
      const predictionRef = doc(db, "maintenance_predictions", predictionId);
      
      const updateData: any = { status };
      
      if (scheduledDate) updateData.scheduledDate = scheduledDate;
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (notes) updateData.notes = notes;
      
      if (status === "completed") {
        updateData.completedDate = new Date().toISOString();
      }
      
      await updateDoc(predictionRef, updateData);
      return { predictionId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ml-predictions"] });
      queryClient.invalidateQueries({ queryKey: ["ml-stats"] });
      toast({
        title: "Prediction Updated",
        description: "The maintenance prediction has been updated successfully"
      });
    }
  });
  
  // Initialize model if needed
  const initializeModel = useCallback(async () => {
    try {
      const modelsCollection = collection(db, "prediction_models");
      const modelQuery = query(modelsCollection);
      const modelSnapshot = await getDocs(modelQuery);
      
      if (modelSnapshot.empty) {
        // Create default model
        await setDoc(doc(db, "prediction_models", DEFAULT_MODEL.id), DEFAULT_MODEL);
        console.log("Default ML model created");
      }
    } catch (error) {
      console.error("Error initializing ML model:", error);
    }
  }, []);
  
  const isLoading = isModelLoading || isAnomaliesLoading || isPredictionsLoading || isStatsLoading || isProcessing;
  
  return {
    activeModel,
    anomalies,
    predictions,
    mlStats,
    isLoading,
    processUnitMeasurements,
    updateAnomalyStatus,
    generatePredictions,
    updatePredictionStatus,
    initializeModel
  };
}
