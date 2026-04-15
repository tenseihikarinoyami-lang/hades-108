// SISTEMA MENTOR/APRENDIZ - Lazos del Tártaro
import { db } from './firebase';
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, increment, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';

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
      apprenticeIds: arrayUnion(apprenticeId)
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
    apprenticeIds: arrayRemove(apprenticeId)
  });
  
  await updateDoc(doc(db, 'users', apprenticeId), {
    obolos: increment(500),
    mentorId: null,
    titles: arrayUnion(rewardTitle)
  });
}

// Buscar mentores disponibles
export async function findAvailableMentors(): Promise<any[]> {
  const q = query(
    collection(db, 'users'),
    where('level', '>=', 20)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((snapshotDoc) => ({
      uid: snapshotDoc.id,
      ...snapshotDoc.data()
    }) as { uid: string; mentorId?: string | null; [key: string]: any })
    .filter((user) => !user.mentorId); // Solo los que no tienen mentor
}
