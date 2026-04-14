// CLOUD FUNCTIONS ANTI-CHEAT - Validación server-side
// NOTA: En producción, esto debe ir en Cloud Functions de Firebase
// Aquí está la lógica que se debe implementar en el backend

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  penalty?: number;
}

// Validar resultado de trivia
export function validateTriviaResult(result: any): ValidationResult {
  const { score, timeSpent, correctAnswers, totalQuestions } = result;

  // Check 1: Score imposible
  const maxPossibleScore = totalQuestions * 50 * 3; // max 50 puntos x3 combo
  if (score > maxPossibleScore) {
    return { valid: false, reason: 'Score imposible', penalty: 0.5 };
  }

  // Check 2: Tiempo imposible (menos de 0.5s por pregunta)
  const avgTimePerQuestion = timeSpent / totalQuestions;
  if (avgTimePerQuestion < 500) {
    return { valid: false, reason: 'Tiempo sospechosamente rápido', penalty: 0.3 };
  }

  // Check 3: Ratio de aciertos perfecto con tiempo récord
  const accuracy = correctAnswers / totalQuestions;
  if (accuracy === 1.0 && timeSpent < totalQuestions * 1000) {
    return { valid: false, reason: 'Demasiado perfecto', penalty: 0.2 };
  }

  return { valid: true };
}

// Validar compra/venta
export function validateTransaction(transaction: any): ValidationResult {
  const { type, amount, userBalance, itemValue } = transaction;

  if (type === 'sell') {
    if (amount > itemValue * 1.5) {
      return { valid: false, reason: 'Valor de venta inflado', penalty: 0.5 };
    }
  }

  if (type === 'buy') {
    if (userBalance < amount) {
      return { valid: false, reason: 'Balance insuficiente', penalty: 0 };
    }
  }

  return { valid: true };
}

// Rate limiting - Verificar frecuencia de acciones
const actionTimestamps: Record<string, number[]> = {};

export function checkRateLimit(userId: string, action: string, maxPerMinute: number): ValidationResult {
  const key = `${userId}_${action}`;
  const now = Date.now();

  if (!actionTimestamps[key]) {
    actionTimestamps[key] = [];
  }

  // Limpiar timestamps antiguos (más de 1 minuto)
  actionTimestamps[key] = actionTimestamps[key].filter(t => now - t < 60000);

  if (actionTimestamps[key].length >= maxPerMinute) {
    return { valid: false, reason: 'Rate limit excedido', penalty: 0.1 };
  }

  actionTimestamps[key].push(now);
  return { valid: true };
}

// Detectar patrones anómalos
export function detectAnomalousPatterns(stats: any): ValidationResult {
  const { winRate, avgResponseTime, sessionLength, dailyPlaytime } = stats;

  // Winrate 100% con muchas partidas
  if (winRate === 1.0 && stats.totalGames > 20) {
    return { valid: false, reason: 'Winrate sospechoso', penalty: 0.3 };
  }

  // Sesiones de 24+ horas (posible bot)
  if (sessionLength > 24 * 60 * 60 * 1000) {
    return { valid: false, reason: 'Sesión demasiado larga', penalty: 0.2 };
  }

  // Juego continuo sin descansos
  if (dailyPlaytime > 20 * 60 * 60 * 1000) {
    return { valid: false, reason: 'Tiempo de juego anómalo', penalty: 0.1 };
  }

  return { valid: true };
}

// Aplicar penalización
export async function applyPenalty(userId: string, penalty: number, reason: string): Promise<void> {
  const { db } = await import('./firebase');
  const { doc, updateDoc, increment } = await import('firebase/firestore');

  await updateDoc(doc(db, 'users', userId), {
    cheatFlags: increment(1),
    lastCheatFlagReason: reason,
    penaltyScore: increment(penalty * 100)
  });

  // Si tiene muchas flags, banear temporalmente
  const userDoc = await import('firebase/firestore').then(m => m.getDoc(doc(db, 'users', userId)));
  if (userDoc.exists() && (userDoc.data().cheatFlags || 0) > 5) {
    await updateDoc(doc(db, 'users', userId), {
      temporaryBan: true,
      banUntil: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
    });
  }
}
