import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Helper function para guardar datos de perfil de manera segura.
 * Actualiza Firestore Y el estado local de React simultáneamente.
 * 
 * @param uid - User ID de Firebase
 * @param updateProfileFn - Función updateProfile del AuthContext
 * @param data - Datos a actualizar
 */
export async function saveUserProfile(
  uid: string,
  updateProfileFn: (data: any) => Promise<void>,
  data: Record<string, any>
): Promise<void> {
  try {
    // Actualizar Firestore
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, data);
    
    // Sincronizar con estado local de React
    await updateProfileFn(data);
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

/**
 * Helper para increment seguro de campos numéricos.
 * Usa Firebase increment para evitar race conditions.
 */
export { increment } from 'firebase/firestore';
