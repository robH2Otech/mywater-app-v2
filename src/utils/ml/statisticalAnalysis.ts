
/**
 * Statistical Analysis Utilities for ML-based Predictive Maintenance
 */

/**
 * Calculate the moving average for a series of values
 * @param values Array of numeric values
 * @param windowSize Size of the moving window
 * @returns Array of moving averages
 */
export const calculateMovingAverage = (values: number[], windowSize: number): number[] => {
  if (values.length < windowSize) {
    return values; // Not enough data for moving average
  }
  
  const result: number[] = [];
  
  for (let i = 0; i <= values.length - windowSize; i++) {
    const windowValues = values.slice(i, i + windowSize);
    const sum = windowValues.reduce((acc, val) => acc + val, 0);
    const average = sum / windowSize;
    result.push(average);
  }
  
  // Pad the beginning with the first calculated average to maintain array length
  const padding = new Array(windowSize - 1).fill(result[0]);
  return [...padding, ...result];
};

/**
 * Calculate standard deviation for a series of values
 * @param values Array of numeric values
 * @returns Standard deviation value
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length <= 1) {
    return 0; // Not enough data for standard deviation
  }
  
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
  
  return Math.sqrt(variance);
};

/**
 * Apply exponential smoothing to a series of values
 * @param values Array of numeric values
 * @param alpha Smoothing factor (0 < alpha < 1)
 * @returns Smoothed values
 */
export const applyExponentialSmoothing = (values: number[], alpha: number): number[] => {
  if (values.length === 0) {
    return [];
  }
  
  // Alpha should be between 0 and 1
  const smoothingFactor = Math.max(0, Math.min(1, alpha));
  
  const result: number[] = [values[0]]; // First value remains the same
  
  for (let i = 1; i < values.length; i++) {
    const smoothedValue = smoothingFactor * values[i] + (1 - smoothingFactor) * result[i - 1];
    result.push(smoothedValue);
  }
  
  return result;
};

/**
 * Detect anomalies in a series of values using standard deviation
 * @param values Array of numeric values
 * @param movingAverages Array of moving averages
 * @param stdDevThreshold Number of standard deviations for threshold (typically 2-3)
 * @returns Array of indices where anomalies were detected
 */
export const detectAnomalies = (
  values: number[], 
  movingAverages: number[], 
  stdDevThreshold: number
): number[] => {
  const anomalies: number[] = [];
  const stdDev = calculateStandardDeviation(values);
  
  for (let i = 0; i < values.length; i++) {
    const deviation = Math.abs(values[i] - movingAverages[i]);
    if (deviation > stdDevThreshold * stdDev) {
      anomalies.push(i);
    }
  }
  
  return anomalies;
};

/**
 * Simple linear regression for predicting future values
 * @param xValues Array of x values (typically timestamps or indices)
 * @param yValues Array of y values
 * @returns Object with slope, intercept, and prediction function
 */
export const linearRegression = (xValues: number[], yValues: number[]) => {
  if (xValues.length !== yValues.length || xValues.length === 0) {
    throw new Error('Input arrays must be of equal length and non-empty');
  }
  
  const n = xValues.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumXX += xValues[i] * xValues[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const predict = (x: number) => slope * x + intercept;
  
  return {
    slope,
    intercept,
    predict
  };
};

/**
 * Calculate confidence level for a prediction (0-100%)
 * @param predictionError Average prediction error
 * @param dataPoints Number of data points
 * @returns Confidence percentage
 */
export const calculateConfidenceLevel = (predictionError: number, dataPoints: number): number => {
  // Simple confidence calculation based on error and data points
  // More data points and smaller errors increase confidence
  const baseConfidence = Math.max(0, 100 - (predictionError * 10));
  const dataFactor = Math.min(1, Math.log10(dataPoints) / 2);
  
  return Math.round(baseConfidence * dataFactor);
};
