import { createContext, useContext, ReactNode } from 'react';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

type AnalyticsContextType = ReturnType<typeof useAnalyticsTracking>;

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Analytics Provider - Provides analytics tracking context to the app.
 * Wraps the app to enable useAnalytics() hook anywhere.
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const analytics = useAnalyticsTracking();
  
  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access analytics tracking functions.
 * Must be used within AnalyticsProvider.
 */
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

/**
 * Safe version that doesn't throw if used outside provider.
 * Returns no-op functions instead.
 */
export function useAnalyticsSafe(): AnalyticsContextType | null {
  return useContext(AnalyticsContext);
}
