// src/core/utils/performanceMonitor.ts
/**
 * Utility for monitoring and measuring performance in the application
 */

// Flag to enable/disable performance monitoring
const ENABLE_MONITORING = process.env.NODE_ENV === 'development';

// Store performance marks and measures
const perfMetrics: Record<string, number[]> = {};

/**
 * Start timing a performance measurement
 * @param label Unique identifier for the measurement
 */
export const startMeasure = (label: string): void => {
  if (!ENABLE_MONITORING) return;
  
  // Use performance API if available
  if (typeof performance !== 'undefined' && performance.mark) {
    const startMark = `${label}-start`;
    performance.mark(startMark);
  } else {
    // Fallback to Date.now()
    perfMetrics[`${label}-start`] = [Date.now()];
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ Starting measurement: ${label}`);
  }
};

/**
 * End timing a performance measurement and log results
 * @param label Identifier matching the startMeasure call
 * @param logToConsole Whether to log results to console
 * @returns Duration in milliseconds
 */
export const endMeasure = (label: string, logToConsole = true): number => {
  if (!ENABLE_MONITORING) return 0;
  
  let duration = 0;
  
  // Use performance API if available
  if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
    const startMark = `${label}-start`;
    const endMark = `${label}-end`;
    
    performance.mark(endMark);
    
    try {
      // Create a measure between start and end marks
      performance.measure(label, startMark, endMark);
      
      // Get all measures with this name
      const entries = performance.getEntriesByName(label, 'measure');
      if (entries.length > 0) {
        duration = entries[entries.length - 1].duration;
      }
      
      // Clean up marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(label);
    } catch (e) {
      console.warn('Performance measurement error:', e);
    }
  } else {
    // Fallback to Date.now()
    const start = perfMetrics[`${label}-start`]?.[0] || 0;
    if (start) {
      duration = Date.now() - start;
      delete perfMetrics[`${label}-start`];
    }
  }
  
  // Store the measurement
  if (!perfMetrics[label]) {
    perfMetrics[label] = [];
  }
  perfMetrics[label].push(duration);
  
  // Log results if enabled
  if (logToConsole && process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  }
  
  return duration;
};

/**
 * Get the average time for a specific measurement
 * @param label Measurement identifier
 * @returns Average duration in milliseconds, or 0 if no measurements
 */
export const getAverageMeasure = (label: string): number => {
  if (!perfMetrics[label] || perfMetrics[label].length === 0) {
    return 0;
  }
  
  const sum = perfMetrics[label].reduce((a, b) => a + b, 0);
  return sum / perfMetrics[label].length;
};

/**
 * Get all recorded metrics
 * @returns Object with all performance metrics
 */
export const getAllMetrics = (): Record<string, { average: number, samples: number }> => {
  const result: Record<string, { average: number, samples: number }> = {};
  
  Object.keys(perfMetrics).forEach(key => {
    if (key.endsWith('-start')) return;
    
    const values = perfMetrics[key];
    if (values && values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      result[key] = {
        average: sum / values.length,
        samples: values.length
      };
    }
  });
  
  return result;
};

/**
 * Clear all performance metrics
 */
export const clearMetrics = (): void => {
  Object.keys(perfMetrics).forEach(key => {
    delete perfMetrics[key];
  });
};

/**
 * Wrap a function with performance measurement
 * @param fn Function to measure
 * @param label Label for the measurement
 * @returns Wrapped function
 */
export function withPerformance<T extends (...args: any[]) => any>(
  fn: T,
  label: string
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    startMeasure(label);
    const result = fn(...args);
    
    // Handle promises
    if (result instanceof Promise) {
      return result.finally(() => {
        endMeasure(label);
      }) as ReturnType<T>;
    }
    
    endMeasure(label);
    return result;
  };
}

// Export a performance monitoring hook for React components
export const usePerformanceMonitor = (componentName: string) => {
  if (!ENABLE_MONITORING) {
    return { startMeasure: () => {}, endMeasure: () => 0 };
  }
  
  return {
    startMeasure: (label: string) => startMeasure(`${componentName}-${label}`),
    endMeasure: (label: string) => endMeasure(`${componentName}-${label}`)
  };
};