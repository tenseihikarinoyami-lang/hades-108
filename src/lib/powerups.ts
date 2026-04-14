// POWER-UPS SYSTEM - Mejoras de gameplay para trivias
export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number; // segundos
  effect: 'double_xp' | 'shield' | 'time_freeze' | 'auto_answer' | 'health_boost' | 'combo_boost';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const AVAILABLE_POWER_UPS: PowerUp[] = [
  { id: 'pu_1', name: 'Sabiduría de Atenea', description: 'Doble XP por 30 segundos', icon: '🦉', duration: 30, effect: 'double_xp', rarity: 'rare' },
  { id: 'pu_2', name: 'Escudo Divino', description: 'Inmunidad por 10 segundos', icon: '🛡️', duration: 10, effect: 'shield', rarity: 'epic' },
  { id: 'pu_3', name: 'Tiempo de Cronos', description: 'Congela el tiempo por 5 segundos', icon: '⏱️', duration: 5, effect: 'time_freeze', rarity: 'rare' },
  { id: 'pu_4', name: 'Oráculo de Delfos', description: 'Respuesta automática correcta', icon: '🔮', duration: 1, effect: 'auto_answer', rarity: 'legendary' },
  { id: 'pu_5', name: 'Sangre de Zeus', description: '+50 HP adicional', icon: '⚡', duration: 0, effect: 'health_boost', rarity: 'common' },
  { id: 'pu_6', name: 'Furia de Ares', description: 'Combo se mantiene al fallar', icon: '🔥', duration: 15, effect: 'combo_boost', rarity: 'epic' }
];

// Aplicar power-up
export function applyPowerUp(powerUp: PowerUp, gameState: any): any {
  switch (powerUp.effect) {
    case 'double_xp':
      return { ...gameState, xpMultiplier: 2 };
    case 'shield':
      return { ...gameState, isInvincible: true };
    case 'time_freeze':
      return { ...gameState, isTimeStopped: true };
    case 'auto_answer':
      return { ...gameState, autoAnswer: true };
    case 'health_boost':
      return { ...gameState, health: (gameState.health || 100) + 50 };
    case 'combo_boost':
      return { ...gameState, comboProtected: true };
    default:
      return gameState;
  }
}
