// SEASONAL RANKINGS - Clasificaciones mensuales
import { db } from './firebase';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, increment, where, serverTimestamp, addDoc } from 'firebase/firestore';

export interface SeasonalEntry {
  uid: string;
  specterName: string;
  score: number;
  rank: number;
  updatedAt: any;
}

export const SEASON_RANKS = [
  { name: 'Hades', minScore: 10000, reward: { title: 'Hades', obolos: 5000, fragments: 10 } },
  { name: 'Juez', minScore: 7500, reward: { title: 'Juez del Inframundo', obolos: 3000, fragments: 5 } },
  { name: 'General', minScore: 5000, reward: { title: 'General', obolos: 2000, fragments: 3 } },
  { name: 'Espectro Élite', minScore: 3000, reward: { title: 'Espectro Élite', obolos: 1000, fragments: 2 } },
  { name: 'Guerrero', minScore: 1000, reward: { title: 'Guerrero', obolos: 500, fragments: 1 } },
];

// Obtener ranking de temporada actual
export async function getSeasonalRankings(topN: number = 50): Promise<SeasonalEntry[]> {
  try {
    const now = new Date();
    const seasonId = `${now.getFullYear()}-${now.getMonth() + 1}`;
    
    const q = query(
      collection(db, `seasons/${seasonId}/rankings`),
      orderBy('score', 'desc'),
      limit(topN)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc, idx) => ({
      uid: doc.id,
      ...doc.data(),
      rank: idx + 1
    } as SeasonalEntry));
  } catch (error) {
    console.error('Error getting seasonal rankings:', error);
    return [];
  }
}

// Actualizar score de temporada
export async function updateSeasonalScore(userId: string, specterName: string, score: number): Promise<void> {
  try {
    const now = new Date();
    const seasonId = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const docRef = doc(db, `seasons/${seasonId}/rankings`, userId);
    
    await updateDoc(docRef, {
      score: increment(score),
      specterName,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    // Si no existe, crear
    try {
      const now = new Date();
      const seasonId = `${now.getFullYear()}-${now.getMonth() + 1}`;
      await addDoc(collection(db, `seasons/${seasonId}/rankings`), {
        uid: userId,
        specterName,
        score,
        updatedAt: serverTimestamp()
      });
    } catch (createError) {
      console.error('Error creating seasonal entry:', createError);
    }
  }
}

// Calcular rango actual del usuario
export function calculateSeasonalRank(score: number): string {
  for (const rank of SEASON_RANKS) {
    if (score >= rank.minScore) return rank.name;
  }
  return 'Espectro';
}

// Obtener recompensas de rango
export function getRankRewards(rank: string) {
  return SEASON_RANKS.find(r => r.name === rank)?.reward || null;
}
