import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

// VAPID public key - should be configured in environment or fetched from server
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 
        'serviceWorker' in navigator && 
        'PushManager' in window &&
        'Notification' in window;
      
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        
        // Check existing subscription
        try {
          const registration = await navigator.serviceWorker.ready;
          const existingSub = await (registration as any).pushManager.getSubscription();
          setSubscription(existingSub);
          setIsSubscribed(!!existingSub);
        } catch (error) {
          console.warn('Could not check push subscription:', error);
        }
      }
    };

    checkSupport();
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !user) return false;
    
    setIsLoading(true);
    try {
      // Request permission first
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Se requiere permiso para notificaciones');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const sub = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = sub.toJSON();
      
      // Save subscription to database using correct column names
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: sub.endpoint,
        p256dh_key: subJson.keys?.p256dh || '',
        auth_key: subJson.keys?.auth || '',
        device_type: getDeviceType(),
        user_agent: navigator.userAgent,
        is_active: true,
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,endpoint',
      });

      if (error) throw error;

      setSubscription(sub);
      setIsSubscribed(true);
      toast.success('Notificaciones activadas');
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      toast.error('Error al activar notificaciones');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, requestPermission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription || !user) return false;
    
    setIsLoading(true);
    try {
      await subscription.unsubscribe();
      
      // Remove from database
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);

      setSubscription(null);
      setIsSubscribed(false);
      toast.success('Notificaciones desactivadas');
      return true;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      toast.error('Error al desactivar notificaciones');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription, user]);

  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted') {
      toast.error('Permiso de notificaciones no concedido');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('IP-NEXUS', {
        body: '¡Las notificaciones están funcionando!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'test',
      });
      toast.success('Notificación de prueba enviada');
    } catch (error) {
      console.error('Test notification failed:', error);
      toast.error('Error al enviar notificación de prueba');
    }
  }, [permission]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    requestPermission,
    sendTestNotification,
  };
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}
