import { useState, useEffect } from 'react';

// Check if we're in Lovable preview environment
function isLovablePreview(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.includes('lovable.app') || 
         hostname.includes('lovableproject.com') ||
         hostname === 'localhost';
}

export function useOnlineStatus() {
  // Always assume online initially, especially in preview environments
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // In Lovable preview, always trust we're online to avoid false negatives
    if (isLovablePreview()) {
      setIsOnline(true);
      return;
    }

    // For production, use navigator.onLine
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        window.dispatchEvent(new CustomEvent('app:back-online'));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
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
    // Never show offline indicator in Lovable preview
    if (isLovablePreview()) {
      setShowIndicator(false);
      return;
    }

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
