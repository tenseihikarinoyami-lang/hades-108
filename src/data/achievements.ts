// SISTEMA DE LOGROS EXPANDIDO - Crónicas del Inframundo
// 100+ logros en 5 categorías

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'combate' | 'social' | 'exploracion' | 'coleccion' | 'maestria';
  icon: string;
  requirement: number;
  reward: {
    prestigePoints?: number;
    title?: string;
    obolos?: number;
    fragments?: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // ═══════════════════════════════════════════
  // COMBATE (25 logros)
  // ═══════════════════════════════════════════
  { id: 'combat_1', name: 'Primera Sangre', description: 'Gana tu primera trivia', category: 'combate', icon: '⚔️', requirement: 1, reward: { prestigePoints: 5, obolos: 50 } },
  { id: 'combat_2', name: 'Asesino de Dioses', description: 'Gana 10 trivias', category: 'combate', icon: '💀', requirement: 10, reward: { prestigePoints: 10, title: 'Asesino de Dioses' } },
  { id: 'combat_3', name: 'Guerrero del Cocytos', description: 'Gana 50 trivias', category: 'combate', icon: '🗡️', requirement: 50, reward: { prestigePoints: 25, obolos: 500 } },
  { id: 'combat_4', name: 'Matador de Jefes', description: 'Derrota 10 jefes finales', category: 'combate', icon: '👹', requirement: 10, reward: { prestigePoints: 15, obolos: 200 } },
  { id: 'combat_5', name: 'Combo x5', description: 'Alcanza un combo de x5', category: 'combate', icon: '🔥', requirement: 5, reward: { prestigePoints: 10 } },
  { id: 'combat_6', name: 'Combo x10', description: 'Alcanza un combo de x10', category: 'combate', icon: '🔥🔥', requirement: 10, reward: { prestigePoints: 20, title: 'Imparable' } },
  { id: 'combat_7', name: 'Combo Legendario', description: 'Alcanza un combo de x15', category: 'combate', icon: '💥', requirement: 15, reward: { prestigePoints: 30, title: 'Leyenda' } },
  { id: 'combat_8', name: 'Perfect Run', description: 'Completa una trivia sin fallar', category: 'combate', icon: '✨', requirement: 1, reward: { prestigePoints: 25, obolos: 300 } },
  { id: 'combat_9', name: 'Velocista', description: 'Responde en menos de 2 segundos 10 veces', category: 'combate', icon: '⚡', requirement: 10, reward: { prestigePoints: 15 } },
  { id: 'combat_10', name: 'Superviviente', description: 'Sobrevive con menos de 10 HP', category: 'combate', icon: '❤️', requirement: 1, reward: { prestigePoints: 10 } },
  { id: 'combat_11', name: 'Torre Piso 10', description: 'Alcanza el piso 10 de la Torre', category: 'combate', icon: '🏰', requirement: 10, reward: { prestigePoints: 20, obolos: 200 } },
  { id: 'combat_12', name: 'Torre Piso 25', description: 'Alcanza el piso 25 de la Torre', category: 'combate', icon: '🏯', requirement: 25, reward: { prestigePoints: 50, title: 'Escalador' } },
  { id: 'combat_13', name: 'Laberinto Completo', description: 'Completa el Laberinto', category: 'combate', icon: '🌀', requirement: 1, reward: { prestigePoints: 30, obolos: 500 } },
  { id: 'combat_14', name: 'Battle Royale Top 10', description: 'Termina entre los 10 primeros', category: 'combate', icon: '🏆', requirement: 1, reward: { prestigePoints: 15 } },
  { id: 'combat_15', name: 'Battle Royale Victoria', description: 'Gana un Battle Royale', category: 'combate', icon: '👑', requirement: 1, reward: { prestigePoints: 50, title: 'Campeón' } },
  { id: 'combat_16', name: 'World Boss Damage', description: 'Inflige 10,000 daño al World Boss', category: 'combate', icon: '🐉', requirement: 10000, reward: { prestigePoints: 25 } },
  { id: 'combat_17', name: 'Raid Completada', description: 'Completa una Raid', category: 'combate', icon: '⚔️', requirement: 1, reward: { prestigePoints: 20 } },
  { id: 'combat_18', name: 'Raid Master', description: 'Completa 10 Raids', category: 'combate', icon: '🎯', requirement: 10, reward: { prestigePoints: 40, title: 'Raider' } },
  { id: 'combat_19', name: 'PvP Victorioso', description: 'Gana 5 duelos PvP', category: 'combate', icon: '🤺', requirement: 5, reward: { prestigePoints: 20 } },
  { id: 'combat_20', name: 'Campaign Capítulo 1', description: 'Completa el Capítulo 1 de Campaign', category: 'combate', icon: '📖', requirement: 1, reward: { prestigePoints: 15 } },
  { id: 'combat_21', name: 'Campaign Completa', description: 'Completa toda la Campaign', category: 'combate', icon: '📚', requirement: 10, reward: { prestigePoints: 100, title: 'Héroe' } },
  { id: 'combat_22', name: 'Saint Mode Saga', description: 'Completa una Saga Saint Mode', category: 'combate', icon: '🌟', requirement: 1, reward: { prestigePoints: 30 } },
  { id: 'combat_23', name: 'Pesca Legendaria', description: 'Pesca un item legendario', category: 'combate', icon: '🎣', requirement: 1, reward: { prestigePoints: 25 } },
  { id: 'combat_24', name: 'Pesca x10', description: 'Pesca 10 items', category: 'combate', icon: '🐟', requirement: 10, reward: { prestigePoints: 15 } },
  { id: 'combat_25', name: 'Conquistador de Territorios', description: 'Conquista tu primer territorio', category: 'combate', icon: '🗺️', requirement: 1, reward: { prestigePoints: 20, obolos: 300 } },

  // ═══════════════════════════════════════════
  // SOCIAL (20 logros)
  // ═══════════════════════════════════════════
  { id: 'social_1', name: 'Voz del Cocytos', description: 'Envía 100 mensajes', category: 'social', icon: '💬', requirement: 100, reward: { prestigePoints: 10 } },
  { id: 'social_2', name: 'Orador', description: 'Envía 1,000 mensajes', category: 'social', icon: '🗣️', requirement: 1000, reward: { prestigePoints: 25, title: 'Orador' } },
  { id: 'social_3', name: 'Primer Amigo', description: 'Agrega tu primer amigo', category: 'social', icon: '👋', requirement: 1, reward: { prestigePoints: 5 } },
  { id: 'social_4', name: 'Popular', description: 'Agrega 10 amigos', category: 'social', icon: '⭐', requirement: 10, reward: { prestigePoints: 15 } },
  { id: 'social_5', name: 'Networking', description: 'Agrega 50 amigos', category: 'social', icon: '🌐', requirement: 50, reward: { prestigePoints: 30, title: 'Conector' } },
  { id: 'social_6', name: 'Guild Fundador', description: 'Fundar una Guild', category: 'social', icon: '🏛️', requirement: 1, reward: { prestigePoints: 20 } },
  { id: 'social_7', name: 'Guild Líder', description: 'Liderar una Guild de 10 miembros', category: 'social', icon: '👑', requirement: 10, reward: { prestigePoints: 30 } },
  { id: 'social_8', name: 'Guild Wars Victoria', description: 'Gana una Guild War', category: 'social', icon: '⚔️', requirement: 1, reward: { prestigePoints: 40, title: 'Estratega' } },
  { id: 'social_9', name: 'Referido Exitoso', description: 'Refiere a tu primer jugador', category: 'social', icon: '🔗', requirement: 1, reward: { prestigePoints: 10 } },
  { id: 'social_10', name: 'Influencer', description: 'Refiere a 10 jugadores', category: 'social', icon: '📢', requirement: 10, reward: { prestigePoints: 30, obolos: 1000 } },
  { id: 'social_11', name: 'Mentor', description: 'Acepta tu primer aprendiz', category: 'social', icon: '🎓', requirement: 1, reward: { prestigePoints: 15 } },
  { id: 'social_12', name: 'Gran Mentor', description: 'Guía a 5 aprendices al nivel 10', category: 'social', icon: '🏅', requirement: 5, reward: { prestigePoints: 40, title: 'Sabio' } },
  { id: 'social_13', name: 'Ayudante', description: 'Completa 10 misiones de Guild', category: 'social', icon: '🤝', requirement: 10, reward: { prestigePoints: 20 } },
  { id: 'social_14', name: 'Donante', description: 'Dona 100 veces al Guild', category: 'social', icon: '💎', requirement: 100, reward: { prestigePoints: 25 } },
  { id: 'social_15', name: 'Event Participant', description: 'Participa en 5 eventos', category: 'social', icon: '🎉', requirement: 5, reward: { prestigePoints: 15 } },
  { id: 'social_16', name: 'Chat Master', description: 'Envía mensajes 30 días seguidos', category: 'social', icon: '📝', requirement: 30, reward: { prestigePoints: 50, title: 'Comunicador' } },
  { id: 'social_17', name: 'Diplomático', description: 'Medía 5 disputas de Guild', category: 'social', icon: '⚖️', requirement: 5, reward: { prestigePoints: 20 } },
  { id: 'social_18', name: 'Organizador', description: 'Organiza 3 eventos de Guild', category: 'social', icon: '📋', requirement: 3, reward: { prestigePoints: 30 } },
  { id: 'social_19', name: 'Alianza', description: 'Forma una alianza entre Guilds', category: 'social', icon: '🤝', requirement: 1, reward: { prestigePoints: 25 } },
  { id: 'social_20', name: 'Leyenda Social', description: 'Alcanza 100 amigos', category: 'social', icon: '🌟', requirement: 100, reward: { prestigePoints: 100, title: 'Leyenda' } },

  // ═══════════════════════════════════════════
  // EXPLORACIÓN (20 logros)
  // ═══════════════════════════════════════════
  { id: 'explore_1', name: 'Primer Paso', description: 'Visita todas las páginas principales', category: 'exploracion', icon: '👣', requirement: 10, reward: { prestigePoints: 10 } },
  { id: 'explore_2', name: 'Explorador Novato', description: 'Visita 15 páginas diferentes', category: 'exploracion', icon: '🔍', requirement: 15, reward: { prestigePoints: 15 } },
  { id: 'explore_3', name: 'Cartógrafo', description: 'Visita todas las páginas 20+ veces', category: 'exploracion', icon: '🗺️', requirement: 20, reward: { prestigePoints: 30 } },
  { id: 'explore_4', name: 'Trivia Arena', description: 'Juega en todas las arenas de trivia', category: 'exploracion', icon: '🎮', requirement: 20, reward: { prestigePoints: 25 } },
  { id: 'explore_5', name: 'Tower Climber', description: 'Alcanza el piso 50 de la Torre', category: 'exploracion', icon: '🗼', requirement: 50, reward: { prestigePoints: 50, title: 'Alpinista' } },
  { id: 'explore_6', name: 'Laberinto Maestro', description: 'Completa el laberinto en menos de 5 minutos', category: 'exploracion', icon: '⏱️', requirement: 1, reward: { prestigePoints: 40 } },
  { id: 'explore_7', name: 'Campaign Speedrun', description: 'Completa Campaign en 1 hora', category: 'exploracion', icon: '⚡', requirement: 1, reward: { prestigePoints: 35 } },
  { id: 'explore_8', name: 'World Boss Slayer', description: 'Participa en 10 World Boss', category: 'exploracion', icon: '🐲', requirement: 10, reward: { prestigePoints: 25 } },
  { id: 'explore_9', name: 'Territorio Conquistado', description: 'Conquista 5 territorios', category: 'exploracion', icon: '🏴', requirement: 5, reward: { prestigePoints: 20 } },
  { id: 'explore_10', name: 'Navegante', description: 'Navega 1000 veces entre páginas', category: 'exploracion', icon: '🧭', requirement: 1000, reward: { prestigePoints: 15 } },
  { id: 'explore_11', name: 'Secret Boss Hunter', description: 'Derrota 5 Secret Bosses', category: 'exploracion', icon: '👾', requirement: 5, reward: { prestigePoints: 30 } },
  { id: 'explore_12', name: 'Boss Primordial', description: 'Derrota un Boss Primordial', category: 'exploracion', icon: '💫', requirement: 1, reward: { prestigePoints: 50, title: 'Primordial' } },
  { id: 'explore_13', name: 'Auction Master', description: 'Completa 10 transacciones en Auction', category: 'exploracion', icon: '🏷️', requirement: 10, reward: { prestigePoints: 20 } },
  { id: 'explore_14', name: 'Forge Master', description: 'Mejora 20 items en el Forge', category: 'exploracion', icon: '🔨', requirement: 20, reward: { prestigePoints: 25 } },
  { id: 'explore_15', name: 'Alchemist', description: 'Crea 10 pociones en Alquimia', category: 'exploracion', icon: '🧪', requirement: 10, reward: { prestigePoints: 20 } },
  { id: 'explore_16', name: 'Pet Lover', description: 'Consigue 5 mascotas diferentes', category: 'exploracion', icon: '🐾', requirement: 5, reward: { prestigePoints: 30 } },
  { id: 'explore_17', name: 'Cosmos Explorer', description: 'Desbloquea 20 nodos de Cosmos', category: 'exploracion', icon: '🌌', requirement: 20, reward: { prestigePoints: 25 } },
  { id: 'explore_18', name: 'Battle Pass Completo', description: 'Completa un Battle Pass entero', category: 'exploracion', icon: '🎫', requirement: 1, reward: { prestigePoints: 40 } },
  { id: 'explore_19', name: 'Ascension', description: 'Completa tu primera Ascensión', category: 'exploracion', icon: '🔺', requirement: 1, reward: { prestigePoints: 50, title: 'Ascendido' } },
  { id: 'explore_20', name: 'Explorador Legendario', description: 'Completa todas las misiones de exploración', category: 'exploracion', icon: '⭐', requirement: 100, reward: { prestigePoints: 100, title: 'Explorador Supremo' } },

  // ═══════════════════════════════════════════
  // COLECCIÓN (20 logros)
  // ═══════════════════════════════════════════
  { id: 'collect_1', name: 'Primer Botín', description: 'Obtén tu primer equipo', category: 'coleccion', icon: '🎁', requirement: 1, reward: { prestigePoints: 5 } },
  { id: 'collect_2', name: 'Coleccionista', description: 'Obtén 10 equipos diferentes', category: 'coleccion', icon: '📦', requirement: 10, reward: { prestigePoints: 15, title: 'Coleccionista' } },
  { id: 'collect_3', name: 'Arsenal Completo', description: 'Obtén 50 equipos diferentes', category: 'coleccion', icon: '🗄️', requirement: 50, reward: { prestigePoints: 30 } },
  { id: 'collect_4', name: 'Raro', description: 'Obtén tu primer item Raro', category: 'coleccion', icon: '💙', requirement: 1, reward: { prestigePoints: 10 } },
  { id: 'collect_5', name: 'Épico', description: 'Obtén tu primer item Épico', category: 'coleccion', icon: '💜', requirement: 1, reward: { prestigePoints: 20 } },
  { id: 'collect_6', name: 'Legendario', description: 'Obtén tu primer item Legendario', category: 'coleccion', icon: '💛', requirement: 1, reward: { prestigePoints: 30, title: 'Legendario' } },
  { id: 'collect_7', name: 'Mítico', description: 'Obtén tu primer item Mítico', category: 'coleccion', icon: '❤️', requirement: 1, reward: { prestigePoints: 50, title: 'Mítico' } },
  { id: 'collect_8', name: 'Fragmentos x10', description: 'Acumula 10 fragmentos de memoria', category: 'coleccion', icon: '🧩', requirement: 10, reward: { prestigePoints: 15 } },
  { id: 'collect_9', name: 'Fragmentos x50', description: 'Acumula 50 fragmentos de memoria', category: 'coleccion', icon: '🧩🧩', requirement: 50, reward: { prestigePoints: 30 } },
  { id: 'collect_10', name: 'Óbolos x1000', description: 'Acumula 1,000 Óbolos', category: 'coleccion', icon: '💰', requirement: 1000, reward: { prestigePoints: 20 } },
  { id: 'collect_11', name: 'Óbolos x10000', description: 'Acumula 10,000 Óbolos', category: 'coleccion', icon: '💰💰', requirement: 10000, reward: { prestigePoints: 40, title: 'Rico' } },
  { id: 'collect_12', name: 'Stardust x100', description: 'Acumula 100 Stardust', category: 'coleccion', icon: '✨', requirement: 100, reward: { prestigePoints: 15 } },
  { id: 'collect_13', name: 'Shadow Essence x50', description: 'Acumula 50 Shadow Essence', category: 'coleccion', icon: '🌑', requirement: 50, reward: { prestigePoints: 20 } },
  { id: 'collect_14', name: 'Gem Collector', description: 'Colecciona 20 gemas diferentes', category: 'coleccion', icon: '💎', requirement: 20, reward: { prestigePoints: 25 } },
  { id: 'collect_15', name: 'Set Completo', description: 'Equipa un set completo', category: 'coleccion', icon: '🛡️', requirement: 1, reward: { prestigePoints: 30 } },
  { id: 'collect_16', name: 'Pet Collector', description: 'Consigue 10 mascotas diferentes', category: 'coleccion', icon: '🐕', requirement: 10, reward: { prestigePoints: 25 } },
  { id: 'collect_17', name: 'Cosmic Master', description: 'Desbloquea todos los nodos de Cosmos', category: 'coleccion', icon: '🌠', requirement: 50, reward: { prestigePoints: 50, title: 'Cósmico' } },
  { id: 'collect_18', name: 'Aura Collector', description: 'Desbloquea 5 auras diferentes', category: 'coleccion', icon: '🌈', requirement: 5, reward: { prestigePoints: 20 } },
  { id: 'collect_19', name: 'Title Hunter', description: 'Consigue 20 títulos diferentes', category: 'coleccion', icon: '📜', requirement: 20, reward: { prestigePoints: 30 } },
  { id: 'collect_20', name: 'Coleccionista Supremo', description: 'Completa el 90% de todas las colecciones', category: 'coleccion', icon: '🏆', requirement: 90, reward: { prestigePoints: 100, title: 'Supremo' } },

  // ═══════════════════════════════════════════
  // MAESTRÍA (20 logros)
  // ═══════════════════════════════════════════
  { id: 'mastery_1', name: 'Nivel 10', description: 'Alcanza nivel 10', category: 'maestria', icon: '📈', requirement: 10, reward: { prestigePoints: 10 } },
  { id: 'mastery_2', name: 'Nivel 25', description: 'Alcanza nivel 25', category: 'maestria', icon: '📈', requirement: 25, reward: { prestigePoints: 25 } },
  { id: 'mastery_3', name: 'Nivel 50', description: 'Alcanza nivel 50', category: 'maestria', icon: '📈', requirement: 50, reward: { prestigePoints: 50, title: 'Maestro' } },
  { id: 'mastery_4', name: 'Nivel 100', description: 'Alcanza nivel 100', category: 'maestria', icon: '📈', requirement: 100, reward: { prestigePoints: 100, title: 'Gran Maestro' } },
  { id: 'mastery_5', name: 'Login Streak x7', description: 'Inicia sesión 7 días seguidos', category: 'maestria', icon: '📅', requirement: 7, reward: { prestigePoints: 15 } },
  { id: 'mastery_6', name: 'Login Streak x30', description: 'Inicia sesión 30 días seguidos', category: 'maestria', icon: '📅', requirement: 30, reward: { prestigePoints: 50, title: 'Leal' } },
  { id: 'mastery_7', name: 'Misiones Diarias x30', description: 'Completa misiones diarias 30 días', category: 'maestria', icon: '✅', requirement: 30, reward: { prestigePoints: 40 } },
  { id: 'mastery_8', name: 'Battle Pass x5', description: 'Completa 5 Battle Pass', category: 'maestria', icon: '🎫', requirement: 5, reward: { prestigePoints: 50 } },
  { id: 'mastery_9', name: 'Seasonal Top 10', description: 'Termina en top 10 de temporada', category: 'maestria', icon: '🏅', requirement: 1, reward: { prestigePoints: 30 } },
  { id: 'mastery_10', name: 'Seasonal Top 3', description: 'Termina en top 3 de temporada', category: 'maestria', icon: '🥇', requirement: 1, reward: { prestigePoints: 60, title: 'Élite' } },
  { id: 'mastery_11', name: 'Ascension x3', description: 'Completa 3 Ascensiones', category: 'maestria', icon: '🔺', requirement: 3, reward: { prestigePoints: 40 } },
  { id: 'mastery_12', name: 'Ascension x10', description: 'Completa 10 Ascensiones', category: 'maestria', icon: '🔺', requirement: 10, reward: { prestigePoints: 80, title: 'Trascendido' } },
  { id: 'mastery_13', name: 'Skill Master', description: 'Maximiza todas las habilidades', category: 'maestria', icon: '🧠', requirement: 100, reward: { prestigePoints: 60 } },
  { id: 'mastery_14', name: 'Faction Master', description: 'Alcanza el rango más alto en tu facción', category: 'maestria', icon: '⚜️', requirement: 1, reward: { prestigePoints: 50, title: 'Facción' } },
  { id: 'mastery_15', name: 'Guild Master', description: 'Lleva tu Guild al top 1', category: 'maestria', icon: '🏛️', requirement: 1, reward: { prestigePoints: 70, title: 'Guild Master' } },
  { id: 'mastery_16', name: 'Referral Master', description: 'Refiere a 100 jugadores', category: 'maestria', icon: '🔗', requirement: 100, reward: { prestigePoints: 50 } },
  { id: 'mastery_17', name: 'Event Champion', description: 'Gana 10 eventos temporales', category: 'maestria', icon: '🎉', requirement: 10, reward: { prestigePoints: 60 } },
  { id: 'mastery_18', name: 'Veterano', description: 'Juega por 6 meses consecutivos', category: 'maestria', icon: '🎖️', requirement: 180, reward: { prestigePoints: 75, title: 'Veterano' } },
  { id: 'mastery_19', name: 'Leyenda Eterna', description: 'Juega por 1 año consecutivo', category: 'maestria', icon: '👑', requirement: 365, reward: { prestigePoints: 150, title: 'Leyenda Eterna' } },
  { id: 'mastery_20', name: 'Maestro Supremo', description: 'Completa todos los logros de maestría', category: 'maestria', icon: '⭐', requirement: 1000, reward: { prestigePoints: 200, title: 'Maestro Supremo' } },
];

// Helper functions
export function getAchievementsByCategory(category: string): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getTotalAchievements(): number {
  return ACHIEVEMENTS.length;
}

export function calculatePrestigePoints(achievements: string[]): number {
  return achievements.reduce((total, id) => {
    const achievement = getAchievementById(id);
    return total + (achievement?.reward.prestigePoints || 0);
  }, 0);
}
