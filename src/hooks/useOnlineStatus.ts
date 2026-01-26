import { useState, useEffect } from 'react';

// Real network check to avoid false positives in iframe environments
async function checkRealConnectivity(): Promise<boolean> {
  try {
    // Try to fetch a small resource to verify actual connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch {
    // If fetch fails, fall back to navigator.onLine
    return navigator.onLine;
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true); // Assume online initially
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Initial check
    checkRealConnectivity().then(setIsOnline);

    const handleOnline = async () => {
      const reallyOnline = await checkRealConnectivity();
      setIsOnline(reallyOnline);
      if (reallyOnline && wasOffline) {
        window.dispatchEvent(new CustomEvent('app:back-online'));
      }
    };

    const handleOffline = async () => {
      // Double-check with real connectivity test
      const reallyOffline = !(await checkRealConnectivity());
      if (reallyOffline) {
        setIsOnline(false);
        setWasOffline(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

export function useOfflineIndicator() {
  const { isOnline } = useOnlineStatus();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true);
    } else {
      const timeout = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline]);

  return { isOnline, showIndicator };
}
