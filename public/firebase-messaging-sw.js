// Firebase Cloud Messaging Service Worker
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging/sw';

// Inicializar Firebase (solo las credenciales necesarias para messaging)
const app = initializeApp({
  apiKey: "AIzaSyBtidUxVxZeTpBJg90aWL8VEC5XQndJZCM",
  authDomain: "hades-f3f3e.firebaseapp.com",
  projectId: "hades-f3f3e",
  storageBucket: "hades-f3f3e.firebasestorage.app",
  messagingSenderId: "697437888110",
  appId: "1:697437888110:web:afa06960754c4ee088d07f"
});

const messaging = getMessaging(app);

// Manejar notificaciones en background
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  const options = {
    body: data.notification.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.data || {},
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.notification.title, options)
  );
});

// Manejar click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
