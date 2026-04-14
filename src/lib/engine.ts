import { db } from './firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { UserProfile } from '../context/AuthContext';
import { toast } from 'sonner';
import { audio } from './audio';

export const checkAndAwardBadges = async (uid: string, profile: UserProfile) => {
  if (!profile.stats) return;

  const newBadges: string[] = [];
  const currentBadges = profile.badges || [];

  // Badge: Primera Sangre
  if (profile.stats.triviasWon >= 1 && !currentBadges.includes('Primera Sangre')) {
    newBadges.push('Primera Sangre');
  }

  // Badge: Fidelidad Absoluta
  if (profile.stats.loginStreak >= 7 && !currentBadges.includes('Fidelidad Absoluta')) {
    newBadges.push('Fidelidad Absoluta');
  }

  // Badge: Voz del Cocytos
  if (profile.stats.messagesSent >= 100 && !currentBadges.includes('Voz del Cocytos')) {
    newBadges.push('Voz del Cocytos');
  }

  // Badge: Asesino de Dioses
  if (profile.stats.triviasWon >= 10 && !currentBadges.includes('Asesino de Dioses')) {
    newBadges.push('Asesino de Dioses');
  }

  // Badge: Coleccionista
  if ((profile.gearInventory?.length || 0) >= 5 && !currentBadges.includes('Coleccionista')) {
    newBadges.push('Coleccionista');
  }

  if (newBadges.length > 0) {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      badges: [...currentBadges, ...newBadges]
    });

    newBadges.forEach(badge => {
      audio.playSFX('success');
      toast.success(`¡Insignia Desbloqueada: ${badge}!`, {
        description: "Revisa tu perfil de Espectro.",
        style: { background: 'rgba(0, 240, 255, 0.1)', border: '1px solid #00f0ff', color: '#fff' }
      });
    });
  }
};

export const updateMissionProgress = async (uid: string, profile: UserProfile, missionId: string) => {
  if (!profile.dailyMissions) return;

  const missionIndex = profile.dailyMissions.findIndex(m => m.id === missionId);
  if (missionIndex === -1) return;

  const mission = profile.dailyMissions[missionIndex];
  if (mission.completed) return;

  const newProgress = mission.progress + 1;
  const isCompleted = newProgress >= mission.target;

  const updatedMissions = [...profile.dailyMissions];
  updatedMissions[missionIndex] = {
    ...mission,
    progress: newProgress,
    completed: isCompleted
  };

  const docRef = doc(db, 'users', uid);
  const updates: any = {
    dailyMissions: updatedMissions
  };

  if (isCompleted) {
    updates.score = increment(50);
    updates.obolos = increment(10);
    updates.passPoints = increment(50); // Award Battle Pass points
    audio.playSFX('success');
    toast.success(`¡Misión Completada: ${mission.title}!`, {
      description: "Has ganado +50 Puntos, +10 Óbolos y +50 Puntos de Pase.",
      style: { background: 'rgba(0, 240, 255, 0.1)', border: '1px solid #00f0ff', color: '#fff' }
    });
  }

  // Update Firestore
  await updateDoc(docRef, updates);

  // IMPORTANT: Also update the local profile state in AuthContext
  // This ensures the UI reflects the changes immediately
  // The calling component should refresh the profile or we update it here
  return updatedMissions;
};

export const incrementStat = async (uid: string, statName: 'messagesSent' | 'triviasPlayed' | 'triviasWon') => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    [`stats.${statName}`]: increment(1)
  });
};
