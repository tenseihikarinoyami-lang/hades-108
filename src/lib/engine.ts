import { db } from './firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { UserProfile } from '../context/AuthContext';
import { toast } from 'sonner';
import { audio } from './audio';
import { ACHIEVEMENTS, Achievement } from '../data/achievements';

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

  // ACHIEVEMENT SYSTEM - Check all achievements
  await checkAchievements(uid, profile);
};

// ACHIEVEMENT SYSTEM
export const checkAchievements = async (uid: string, profile: UserProfile) => {
  const unlockedAchiements = profile.achievements || [];
  const newAchievements: string[] = [];
  const docRef = doc(db, 'users', uid);
  let totalPrestigePoints = profile.prestigePoints || 0;
  const newTitles: string[] = [...(profile.titles || [])];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedAchievements.includes(achievement.id)) continue;

    let currentValue = 0;

    // Get current value based on achievement
    switch (achievement.id.split('_')[0]) {
      case 'combat':
        if (achievement.id.includes('1')) currentValue = profile.stats?.triviasWon || 0;
        if (achievement.id.includes('2')) currentValue = profile.stats?.triviasWon || 0;
        if (achievement.id.includes('3')) currentValue = profile.stats?.triviasWon || 0;
        if (achievement.id.includes('6') || achievement.id.includes('7')) currentValue = profile.maxCombo || 0;
        if (achievement.id.includes('11')) currentValue = profile.highestTowerFloor || 0;
        break;
      case 'social':
        if (achievement.id.includes('1')) currentValue = profile.stats?.messagesSent || 0;
        if (achievement.id.includes('9')) currentValue = profile.referralCount || 0;
        break;
      case 'explore':
        currentValue = profile.pagesVisited || 0;
        break;
      case 'collect':
        currentValue = profile.gearInventory?.length || 0;
        if (achievement.id.includes('8') || achievement.id.includes('9')) currentValue = profile.memoryFragments || 0;
        if (achievement.id.includes('10') || achievement.id.includes('11')) currentValue = profile.obolos || 0;
        break;
      case 'mastery':
        if (achievement.id.includes('1') || achievement.id.includes('2') || achievement.id.includes('3') || achievement.id.includes('4')) {
          currentValue = profile.level || 0;
        }
        if (achievement.id.includes('5') || achievement.id.includes('6')) currentValue = profile.stats?.loginStreak || 0;
        break;
    }

    if (currentValue >= achievement.requirement) {
      newAchievements.push(achievement.id);
      if (achievement.reward.prestigePoints) {
        totalPrestigePoints += achievement.reward.prestigePoints;
      }
      if (achievement.reward.title && !newTitles.includes(achievement.reward.title)) {
        newTitles.push(achievement.reward.title);
      }

      // Toast notification
      audio.playSFX('success');
      toast.success(`🏆 ¡Logro Desbloqueado: ${achievement.name}!`, {
        description: `${achievement.description} - +${achievement.reward.prestigePoints || 0} Puntos de Prestigio`,
        style: { background: 'rgba(255, 215, 0, 0.2)', border: '2px solid gold', color: '#fff' },
        duration: 5000
      });
    }
  }

  if (newAchievements.length > 0) {
    const updates: any = {
      achievements: [...unlockedAchievements, ...newAchievements],
      prestigePoints: totalPrestigePoints,
      titles: newTitles
    };

    if (newAchievements.some(id => id.includes('collect'))) {
      updates.obolos = increment(newAchievements.reduce((sum, id) => {
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        return sum + (ach?.reward.obolos || 0);
      }, 0));
    }

    await updateDoc(docRef, updates);
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
