import { useState, useEffect, useCallback } from 'react';
import { registerServiceWorker, isPWAInstalled } from '@/lib/pwa/register-sw';
import { logger } from '@/lib/logger';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isPWAInstalled());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  useEffect(() => {
    // Registrar Service Worker
    registerServiceWorker();
    
    // Escuchar evento de instalación
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };
    
    // Escuchar cambios de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Escuchar actualizaciones disponibles
    const handleUpdate = () => setUpdateAvailable(true);
    
    // Escuchar instalación completada
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sw-update-available', handleUpdate);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-update-available', handleUpdate);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      logger.error('PWA install error', { error });
      return false;
    }
  }, [deferredPrompt]);
  
  const update = useCallback(() => {
    window.location.reload();
  }, []);
  
  return {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    install,
    update,
  };
}
