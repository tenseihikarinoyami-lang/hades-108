import { db } from './firebase';
import { doc, getDoc, updateDoc, increment, query, collection, where, getDocs } from 'firebase/firestore';

/**
 * SISTEMA DE REFERIDOS - Cadena de Almas
 * Procesa un código de referido cuando un nuevo usuario se registra
 */
export async function processReferralCode(newUserId: string, referralCodeInput: string): Promise<{ success: boolean; message: string }> {
  try {
    const code = referralCodeInput.trim().toUpperCase();
    
    // Buscar usuario con ese código
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', code));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { success: false, message: 'Código de referido inválido' };
    }
    
    if (snapshot.docs[0].id === newUserId) {
      return { success: false, message: 'No puedes usar tu propio código' };
    }
    
    const referrerDoc = snapshot.docs[0];
    const referrerData = referrerDoc.data();
    
    // Actualizar al nuevo usuario
    const newUserRef = doc(db, 'users', newUserId);
    await updateDoc(newUserRef, {
      referredBy: referrerDoc.id,
      obolos: increment(200), // Bonus para el nuevo
      titles: ['Alma Perdida', 'Referido']
    });
    
    // Actualizar al que refirió
    await updateDoc(referrerDoc.ref, {
      referralCount: increment(1),
      obolos: increment(200),
      starFragments: increment(1)
    });
    
    return { 
      success: true, 
      message: `¡Referido exitoso! +200 Óbolos para ambos` 
    };
  } catch (error) {
    console.error('Error processing referral:', error);
    return { success: false, message: 'Error al procesar referido' };
  }
}

/**
 * Obtiene estadísticas de referidos de un usuario
 */
export async function getReferralStats(userId: string): Promise<{ count: number; earnings: number }> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return { count: 0, earnings: 0 };
    
    const data = userDoc.data();
    return {
      count: data.referralCount || 0,
      earnings: (data.referralCount || 0) * 200
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return { count: 0, earnings: 0 };
  }
}
