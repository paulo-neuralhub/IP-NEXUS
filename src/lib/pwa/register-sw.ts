import { logger } from '@/lib/logger';

export async function registerServiceWorker() {
  // IMPORTANT:
  // In Lovable preview/dev builds the app is served from a Vite-like dev output
  // (e.g. /node_modules/.vite/deps/*). Registering a Service Worker there can
  // cache *mixed* JS chunks across refreshes and trigger React "dispatcher null"
  // errors (useRef/useState/useEffect).
  // لذلك: en DEV deshabilitamos el SW y limpiamos cualquier registro previo.
  if (import.meta.env.DEV) {
    try {
      await unregisterServiceWorker();
    } catch {
      // ignore
    }
    return null;
  }

  if (!('serviceWorker' in navigator)) {
    logger.debug('Service Worker not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    
    logger.debug('Service Worker registered:', registration.scope);
    
    // Verificar actualizaciones
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nueva versión disponible
            dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });
    
    // Verificar actualizaciones periódicamente
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Cada hora
    
    return registration;
  } catch (error) {
    logger.error('Service Worker registration failed', { error });
    return null;
  }
}

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }
}

export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}
