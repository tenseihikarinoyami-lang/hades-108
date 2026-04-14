// EMAIL REMINDERS - Recordatorios por email
// En producción, usar Firebase Extensions + SendGrid
import { db } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export interface EmailTemplate {
  id: string;
  subject: string;
  body: (data: any) => string;
  trigger: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    subject: '¡Bienvenido al Inframundo, Espectro!',
    body: (data) => `
      Hola ${data.displayName},
      
      Tu viaje en el Inframundo ha comenzado. Aquí tienes algunos tips:
      
      1. Juega tu primera trivia para obtener equipo
      2. Únete a un guild para beneficios exclusivos
      3. Completa misiones diarias para recompensas
      
      ¡Que Hades te guíe!
    `,
    trigger: 'user_created'
  },
  {
    id: 'daily_reminder',
    subject: 'El Inframundo te espera, espectro',
    body: (data) => `
      Hola ${data.displayName},
      
      Tus misiones diarias te esperan:
      - Juega 3 trivias
      - Envía 5 mensajes en Cocytos
      
      ¡No dejes que se reseteen!
      
      Saldo actual: ${data.obolos || 0} Óbolos
    `,
    trigger: 'daily_reminder'
  },
  {
    id: 'inactive_2days',
    subject: 'Tu gloria se desvanece...',
    body: (data) => `
      ${data.displayName},
      
      Han pasado 2 días desde tu última visita. El Inframundo no es para los débiles.
      
      Tus misiones diarias han sido reseteadas. ¡Es hora de demostrar tu poder!
      
      Recompensa de retorno: +50 Óbolos
    `,
    trigger: 'inactive_2days'
  },
  {
    id: 'inactive_7days',
    subject: '¿Has abandonado el Inframundo?',
    body: (data) => `
      ${data.displayName},
      
      Una semana sin verte. Los otros espectros preguntan por ti.
      
      Regresa ahora y recibe:
      - 200 Óbolos
      - 1 Poción de Tiempo
      - 1 Fragmento de Memoria
      
      ¡Tu guild te necesita!
    `,
    trigger: 'inactive_7days'
  },
  {
    id: 'event_starting',
    subject: '¡Nuevo evento comienza!',
    body: (data) => `
      Espectro ${data.displayName},
      
      El evento "${data.eventName}" ha comenzado.
      
      ${data.eventDescription}
      
      ¡No te lo pierdas!
    `,
    trigger: 'event_starting'
  }
];

// Enviar email (en producción, llamar a Cloud Function)
export async function sendEmail(userId: string, templateId: string, data: any): Promise<boolean> {
  try {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (!template) return false;
    
    // En producción, enviar a Firebase Extensions (SendGrid)
    console.log(`Email enviado a ${userId}: ${template.subject}`);
    
    // Registrar envío
    await updateDoc(doc(db, 'users', userId), {
      lastEmailSent: templateId,
      lastEmailSentAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Verificar y enviar recordatorios automáticos
export async function checkAndSendReminders(): Promise<void> {
  const usersRef = collection(db, 'users');
  
  // Usuarios inactivos 2+ días
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const q2d = query(usersRef, where('lastLoginDate', '<=', twoDaysAgo));
  const inactive2d = await getDocs(q2d);
  
  inactive2d.forEach(async (doc) => {
    const lastEmailSent = doc.data().lastEmailSentAt;
    if (!lastEmailSent || new Date(lastEmailSent) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      await sendEmail(doc.id, 'inactive_2days', doc.data());
    }
  });
  
  // Usuarios inactivos 7+ días
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const q7d = query(usersRef, where('lastLoginDate', '<=', sevenDaysAgo));
  const inactive7d = await getDocs(q7d);
  
  inactive7d.forEach(async (doc) => {
    const lastEmailSent = doc.data().lastEmailSentAt;
    if (!lastEmailSent || new Date(lastEmailSent) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) {
      await sendEmail(doc.id, 'inactive_7days', doc.data());
    }
  });
}
