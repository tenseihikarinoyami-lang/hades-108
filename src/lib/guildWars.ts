// GUILD WARS - Guerra entre Guilds
import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, serverTimestamp, increment } from 'firebase/firestore';

export interface GuildWar {
  id: string;
  challengerGuildId: string;
  defenderGuildId: string;
  startDate: any;
  endDate: any;
  status: 'pending' | 'active' | 'completed';
  challengerScore: number;
  defenderScore: number;
  winnerId?: string;
}

// Desafiar guild a guerra
export async function challengeGuild(challengerGuildId: string, defenderGuildId: string): Promise<{ success: boolean; message: string }> {
  try {
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días
    
    await addDoc(collection(db, 'guildWars'), {
      challengerGuildId,
      defenderGuildId,
      startDate: serverTimestamp(),
      endDate,
      status: 'active',
      challengerScore: 0,
      defenderScore: 0
    });

    return { success: true, message: '¡Guerra declarada!' };
  } catch (error) {
    return { success: false, message: 'Error al desafiar' };
  }
}

// Enviar puntaje de miembro
export async function submitWarScore(warId: string, guildId: string, score: number): Promise<void> {
  const warDoc = await getDoc(doc(db, 'guildWars', warId));
  if (!warDoc.exists()) return;

  const war = warDoc.data() as GuildWar;
  const field = war.challengerGuildId === guildId ? 'challengerScore' : 'defenderScore';
  
  await updateDoc(doc(db, 'guildWars', warId), {
    [field]: increment(score)
  });
}

// Obtener guerras activas
export async function getActiveGuildWars(): Promise<GuildWar[]> {
  const q = query(collection(db, 'guildWars'), where('status', '==', 'active'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GuildWar));
}
