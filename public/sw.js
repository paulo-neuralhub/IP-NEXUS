const CACHE_NAME = 'ip-nexus-v1';
const STATIC_CACHE = 'ip-nexus-static-v1';
const DYNAMIC_CACHE = 'ip-nexus-dynamic-v1';
const API_CACHE = 'ip-nexus-api-v1';

// Recursos estáticos a cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Rutas de API a cachear
const API_ROUTES = [
  '/rest/v1/matters',
  '/rest/v1/deadlines',
  '/rest/v1/contacts',
  '/rest/v1/subscription_plans',
];

// Instalación
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE)
            .map((key) => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch con estrategias de caché
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar peticiones que no son HTTP/HTTPS
  if (!request.url.startsWith('http')) return;
  
  // Estrategia para API de Supabase
  if (url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Estrategia para assets estáticos
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Estrategia para navegación (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Por defecto: network first
  event.respondWith(networkFirst(request));
});

// Estrategia Cache First
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Página offline para navegación
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || fetchPromise;
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = { title: 'IP-NEXUS', body: 'Nueva notificación' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/app/dashboard',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ],
    tag: data.tag || 'default',
    renotify: true,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const url = event.notification.data?.url || '/app/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Buscar ventana existente
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Abrir nueva ventana
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  
  if (event.tag === 'sync-pending-changes') {
    event.waitUntil(syncPendingChanges());
  }
  
  if (event.tag === 'sync-deadlines') {
    event.waitUntil(syncDeadlines());
  }
});

// Sincronizar cambios pendientes
async function syncPendingChanges() {
  try {
    const db = await openIndexedDB();
    const pendingChanges = await getAllPendingChanges(db);
    
    for (const change of pendingChanges) {
      try {
        await fetch(change.url, {
          method: change.method,
          headers: change.headers,
          body: JSON.stringify(change.body),
        });
        await deletePendingChange(db, change.id);
      } catch (error) {
        console.error('[SW] Failed to sync change:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Sincronizar plazos para notificaciones
async function syncDeadlines() {
  try {
    // Obtener plazos próximos y programar notificaciones
    const response = await fetch('/api/deadlines/upcoming');
    const deadlines = await response.json();
    
    for (const deadline of deadlines) {
      const dueDate = new Date(deadline.due_date);
      const now = new Date();
      const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 7 && daysUntil > 0) {
        await self.registration.showNotification('Plazo Próximo', {
          body: `${deadline.title} vence en ${daysUntil} días`,
          icon: '/icons/icon-192x192.png',
          tag: `deadline-${deadline.id}`,
          data: { url: `/app/docket/${deadline.matter_id}` },
        });
      }
    }
  } catch (error) {
    console.error('[SW] Deadline sync failed:', error);
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ip-nexus-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-changes')) {
        db.createObjectStore('pending-changes', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllPendingChanges(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending-changes', 'readonly');
    const store = tx.objectStore('pending-changes');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingChange(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending-changes', 'readwrite');
    const store = tx.objectStore('pending-changes');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Periodic Background Sync (si está disponible)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-deadlines') {
    event.waitUntil(syncDeadlines());
  }
});

console.log('[SW] Service Worker loaded');
