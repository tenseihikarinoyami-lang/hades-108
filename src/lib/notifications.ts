// NOTIFICACIONES PUSH - Firebase Cloud Messaging
import { app, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const messaging = getMessaging(app);

// Solicitar permiso y obtener token
export async function requestNotificationPermission(userId: string): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      // Guardar token en Firestore
      if (token) {
        await updateDoc(doc(db, 'users', userId), {
          fcmToken: token,
          notificationsEnabled: true
        });
      }
      
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

// Escuchar mensajes cuando la app está en foreground
export function setupForegroundListener() {
  onMessage(messaging, (payload) => {
    console.log('Mensaje recibido en foreground:', payload);
    // Aquí puedes mostrar un toast o notificación custom
    if (payload.notification) {
      const { title, body } = payload.notification;
      // Usar toast nativo o librería como sonner
      console.log(`${title}: ${body}`);
    }
  });
}

// Suscribirse a tema (para notificaciones masivas)
export async function subscribeToTopic(topic: string) {
  // Esto se hace desde Cloud Functions
  console.log(`Suscribir a tema: ${topic}`);
}

// Enviar notificación desde cliente (se debe hacer desde Cloud Functions en producción)
export async function sendNotification(userId: string, title: string, body: string) {
  // En producción, esto llama a una Cloud Function
  console.log(`Enviar notificación a ${userId}: ${title} - ${body}`);
}
