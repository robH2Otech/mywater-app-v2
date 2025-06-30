import { useEffect } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  route: string;
}

export function usePerformanceMonitor(pageName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    // Measure initial render
    const measureRender = () => {
      const renderTime = performance.now() - startTime;
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`${pageName} render time:`, renderTime.toFixed(2), 'ms');
      }
      
      // Track performance metrics (could send to analytics in production)
      const metrics: PerformanceMetrics = {
        loadTime: startTime,
        renderTime,
        route: window.location.pathname
      };
      
      // Store metrics for potential analytics
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const existingMetrics = JSON.parse(
            localStorage.getItem('performance_metrics') || '[]'
          );
          existingMetrics.push(metrics);
          
          // Keep only last 50 entries
          if (existingMetrics.length > 50) {
            existingMetrics.splice(0, existingMetrics.length - 50);
          }
          
          localStorage.setItem('performance_metrics', JSON.stringify(existingMetrics));
        } catch (error) {
          // Ignore localStorage errors
        }
      }
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRender);
  }, [pageName]);
}
