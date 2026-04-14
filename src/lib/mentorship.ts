// SISTEMA MENTOR/APRENDIZ - Lazos del Tártaro
import { db } from './firebase';
import { doc, updateDoc, getDoc, increment, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// Aceptar aprendiz
export async function acceptApprentice(mentorId: string, apprenticeId: string): Promise<{ success: boolean; message: string }> {
  try {
    const mentorRef = doc(db, 'users', mentorId);
    const apprenticeRef = doc(db, 'users', apprenticeId);
    
    await updateDoc(apprenticeRef, {
      mentorId,
      apprenticeshipStartedAt: serverTimestamp()
    });
    
    await updateDoc(mentorRef, {
      apprenticeIds: increment(1)
    });

    return { success: true, message: '¡Aprendiz aceptado!' };
  } catch (error) {
    return { success: false, message: 'Error al aceptar aprendiz' };
  }
}

// Verificar si puede ser mentor (nivel 20+)
export async function canBeMentor(userId: string): Promise<boolean> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return false;
  return (userDoc.data().level || 0) >= 20;
}

// Recompensar mentor cuando aprendiz sube de nivel
export async function rewardMentor(mentorId: string, apprenticeLevel: number): Promise<void> {
  const bonusXP = apprenticeLevel * 10;
  const bonusObolos = apprenticeLevel * 5;
  
  await updateDoc(doc(db, 'users', mentorId), {
    xp: increment(bonusXP),
    obolos: increment(bonusObolos)
  });
}

// Completar apprenticeship (aprendiz llega a nivel 10)
export async function completeApprenticeship(mentorId: string, apprenticeId: string): Promise<void> {
  const rewardTitle = 'Graduado del Tártaro';
  
  // Recompensas para ambos
  await updateDoc(doc(db, 'users', mentorId), {
    obolos: increment(500),
    prestigePoints: increment(20),
    titles: increment(1)
  });
  
  await updateDoc(doc(db, 'users', apprenticeId), {
    obolos: increment(500),
    mentorId: null,
    titles: [rewardTitle]
  });
}

// Buscar mentores disponibles
export async function findAvailableMentors(): Promise<any[]> {
  const q = query(
    collection(db, 'users'),
    where('level', '>=', 20)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  })).filter(u => !u.mentorId); // Solo los que no tienen mentor
}
