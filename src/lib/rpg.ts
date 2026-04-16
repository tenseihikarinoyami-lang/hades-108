export type Rarity = 'bronce' | 'plata' | 'oro' | 'espectro' | 'divino';
export type GearType = 'weapon' | 'armor' | 'artifact';
export type Element = 'Fuego' | 'Hielo' | 'Rayo' | 'Oscuridad' | 'Neutral';
export type SetType = 'Wyvern' | 'Griffon' | 'Garuda' | 'Hades' | 'Ninguno' | 
  'Chronos' | 'Caos' | 'Nyx' | 'Erebus' | 'Tartarus' |
  'Gaia' | 'Uranus' | 'Pontus' | 'Ourea' | 'Hemera' |
  'Aether' | 'Eros' | 'Ananke' | 'Phanes' | 'Thalassa' |
  'Moros' | 'Thanatos' | 'Hypnos' | 'Nemesis' | 'Eris';
export type SpecterClass = 'Violencia' | 'Defensa' | 'Sabiduría' | 'Ninguna';

export interface Gem {
  id: string;
  name: string;
  type: 'damage' | 'health' | 'time';
  value: number;
  color: string;
}

export interface SetBonusEffect {
  title: string;
  description: string;
  bonuses: {
    damageMultiplier: number;
    healthBonus: number;
    timeBonus: number;
    lootChanceBonus: number;
    obolosMultiplier: number;
    barrierShields: number;
  };
}

export const CLASS_BONUSES: Record<SpecterClass, { damage: number, health: number, time: number, name: string, desc: string }> = {
  'Violencia': { damage: 1.5, health: 0.8, time: 1.0, name: 'Estrella de la Violencia', desc: '+50% Daño de Arma, -20% Vida de Armadura' },
  'Defensa': { damage: 0.8, health: 1.5, time: 1.0, name: 'Estrella de la Defensa', desc: '+50% Vida de Armadura, -20% Daño de Arma' },
  'Sabiduría': { damage: 1.0, health: 1.0, time: 1.5, name: 'Estrella de la Sabiduría', desc: '+50% Tiempo de Artefacto' },
  'Ninguna': { damage: 1.0, health: 1.0, time: 1.0, name: 'Alma Sin Estrella', desc: 'Sin bonificaciones' }
};

export const getLevelFromXP = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;
export const getXPForNextLevel = (level: number) => Math.pow(level, 2) * 100;

export interface Equipment {
  id: string;
  name: string;
  type: GearType;
  rarity: Rarity;
  stats: {
    damage?: number; // Puntos extra por respuesta
    health?: number; // Vida extra inicial
    time?: number;   // Segundos extra
  };
  element: Element;
  set: SetType;
  sockets?: number;
  gems?: Gem[];
  enchantment?: {
    name: string;
    stat: string;
    value: number;
    level: number;
  };
}

const WEAPONS = ['Guadaña', 'Látigo', 'Espada', 'Lanza', 'Tridente'];
const ARMORS = ['Sapuris', 'Coraza', 'Manto', 'Yelmo'];
const ARTIFACTS = ['Rosario', 'Anillo', 'Amuleto', 'Orbe', 'Reliquia'];
const ADJECTIVES = ['Oscuro', 'Maldito', 'del Inframundo', 'Sangriento', 'Letal', 'Eterno', 'del Cocytos', 'de Hades'];
const ELEMENTS: Element[] = ['Fuego', 'Hielo', 'Rayo', 'Oscuridad', 'Neutral'];
const SETS: SetType[] = ['Wyvern', 'Griffon', 'Garuda', 'Hades', 'Ninguno'];

export const RARITY_COLORS: Record<Rarity, string> = {
  bronce: 'text-orange-700 border-orange-700',
  plata: 'text-slate-300 border-slate-300',
  oro: 'text-yellow-400 border-yellow-400',
  espectro: 'text-purple-500 border-purple-500',
  divino: 'text-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.5)]'
};

export const rollLoot = (isBoss: boolean = false): Equipment | null => {
  // 100% chance on boss for testing/fun, 25% on normal questions
  const chance = isBoss ? 1.0 : 0.25; 
  if (Math.random() > chance) return null;

  const rarityRoll = Math.random();
  let rarity: Rarity = 'bronce';
  
  if (rarityRoll > 0.95) rarity = 'divino';
  else if (rarityRoll > 0.85) rarity = 'espectro';
  else if (rarityRoll > 0.60) rarity = 'oro';
  else if (rarityRoll > 0.30) rarity = 'plata';

  const typeRoll = Math.random();
  let type: GearType = 'weapon';
  let nameBase = '';

  if (typeRoll > 0.66) {
    type = 'artifact';
    nameBase = ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)];
  } else if (typeRoll > 0.33) {
    type = 'armor';
    nameBase = ARMORS[Math.floor(Math.random() * ARMORS.length)];
  } else {
    type = 'weapon';
    nameBase = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
  }

  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const name = `${nameBase} ${adjective}`;

  // Generate stats based on rarity
  const multiplier = rarity === 'divino' ? 5 : rarity === 'espectro' ? 4 : rarity === 'oro' ? 3 : rarity === 'plata' ? 2 : 1;
  
  const stats: any = {};
  if (type === 'weapon') stats.damage = Math.floor(Math.random() * 5 * multiplier) + multiplier;
  if (type === 'armor') stats.health = Math.floor(Math.random() * 20 * multiplier) + (10 * multiplier);
  if (type === 'artifact') stats.time = Math.floor(Math.random() * 2 * multiplier) + 1;

  const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
  const set = Math.random() > 0.7 ? SETS[Math.floor(Math.random() * (SETS.length - 1))] : 'Ninguno';

  let sockets = 0;
  if (rarity === 'divino') {
    sockets = Math.floor(Math.random() * 3) + 1; // 1 to 3 sockets
  } else if (rarity === 'espectro') {
    sockets = Math.random() > 0.5 ? 1 : 0;
  }

  return {
    id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name,
    type,
    rarity,
    stats,
    element,
    set,
    sockets,
    gems: []
  };
};

export const rollGem = (): Gem => {
  const types: ('damage' | 'health' | 'time')[] = ['damage', 'health', 'time'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let name = '';
  let color = '';
  let value = 0;

  if (type === 'damage') {
    name = 'Rubí de Fuerza';
    color = 'text-red-500';
    value = Math.floor(Math.random() * 20) + 10;
  } else if (type === 'health') {
    name = 'Esmeralda de Vitalidad';
    color = 'text-green-500';
    value = Math.floor(Math.random() * 50) + 20;
  } else {
    name = 'Zafiro de Tiempo';
    color = 'text-blue-500';
    value = Math.floor(Math.random() * 3) + 1;
  }

  return {
    id: `gem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name,
    type,
    value,
    color
  };
};

export const getElementMultiplier = (attackElement: Element, defenseElement: Element): number => {
  if (attackElement === 'Neutral' || defenseElement === 'Neutral') return 1.0;
  
  const weaknesses: Record<Element, Element> = {
    'Fuego': 'Hielo', // Fuego es débil contra Hielo (en este universo)
    'Hielo': 'Rayo',
    'Rayo': 'Oscuridad',
    'Oscuridad': 'Fuego',
    'Neutral': 'Neutral'
  };

  if (weaknesses[attackElement] === defenseElement) return 0.5; // Resistido
  if (weaknesses[defenseElement] === attackElement) return 1.5; // Súper efectivo
  return 1.0;
};

export const calculateSetBonus = (equipped: Record<string, Equipment | null | undefined>): SetType | null => {
  if (!equipped.weapon || !equipped.armor || !equipped.artifact) return null;
  
  const set1 = equipped.weapon.set;
  const set2 = equipped.armor.set;
  const set3 = equipped.artifact.set;

  if (set1 !== 'Ninguno' && set1 === set2 && set2 === set3) {
    return set1;
  }
  return null;
};

export const SET_BONUS_EFFECTS: Record<Exclude<SetType, 'Ninguno'>, SetBonusEffect> = {
  Wyvern: {
    title: 'Furia del Tribunal',
    description: '+15% dano y +5% probabilidad de botin.',
    bonuses: { damageMultiplier: 1.15, healthBonus: 0, timeBonus: 0, lootChanceBonus: 0.05, obolosMultiplier: 1, barrierShields: 0 }
  },
  Griffon: {
    title: 'Hilos del Veredicto',
    description: '+5 segundos de tiempo y +10% obolos.',
    bonuses: { damageMultiplier: 1, healthBonus: 0, timeBonus: 5, lootChanceBonus: 0, obolosMultiplier: 1.1, barrierShields: 0 }
  },
  Garuda: {
    title: 'Aleteo Supremo',
    description: '+25 HP y 1 barrera espectral adicional.',
    bonuses: { damageMultiplier: 1, healthBonus: 25, timeBonus: 0, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 1 }
  },
  Hades: {
    title: 'Mandato del Inframundo',
    description: '+10% dano, +20 HP, +2s y +10% obolos.',
    bonuses: { damageMultiplier: 1.1, healthBonus: 20, timeBonus: 2, lootChanceBonus: 0, obolosMultiplier: 1.1, barrierShields: 0 }
  },
  Chronos: {
    title: 'Reloj Primordial',
    description: '+8 segundos de tiempo y +10% dano.',
    bonuses: { damageMultiplier: 1.1, healthBonus: 0, timeBonus: 8, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 0 }
  },
  Caos: {
    title: 'Entropia Absoluta',
    description: '+20% dano y +5% botin.',
    bonuses: { damageMultiplier: 1.2, healthBonus: 0, timeBonus: 0, lootChanceBonus: 0.05, obolosMultiplier: 1, barrierShields: 0 }
  },
  Nyx: {
    title: 'Velo de la Noche',
    description: '+15 HP y 1 barrera.',
    bonuses: { damageMultiplier: 1, healthBonus: 15, timeBonus: 0, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 1 }
  },
  Erebus: {
    title: 'Profundidad Sombria',
    description: '+12% dano y +12% obolos.',
    bonuses: { damageMultiplier: 1.12, healthBonus: 0, timeBonus: 0, lootChanceBonus: 0, obolosMultiplier: 1.12, barrierShields: 0 }
  },
  Tartarus: {
    title: 'Abismo Inamovible',
    description: '+35 HP.',
    bonuses: { damageMultiplier: 1, healthBonus: 35, timeBonus: 0, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 0 }
  },
  Gaia: {
    title: 'Corazon de la Tierra',
    description: '+30 HP y +5% botin.',
    bonuses: { damageMultiplier: 1, healthBonus: 30, timeBonus: 0, lootChanceBonus: 0.05, obolosMultiplier: 1, barrierShields: 0 }
  },
  Uranus: {
    title: 'Boveda Celeste',
    description: '+6 segundos de tiempo.',
    bonuses: { damageMultiplier: 1, healthBonus: 0, timeBonus: 6, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 0 }
  },
  Pontus: {
    title: 'Marea Originaria',
    description: '+4 segundos y +10% obolos.',
    bonuses: { damageMultiplier: 1, healthBonus: 0, timeBonus: 4, lootChanceBonus: 0, obolosMultiplier: 1.1, barrierShields: 0 }
  },
  Ourea: {
    title: 'Cumbre Antigua',
    description: '+25 HP y +8% dano.',
    bonuses: { damageMultiplier: 1.08, healthBonus: 25, timeBonus: 0, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 0 }
  },
  Hemera: {
    title: 'Alba Eterna',
    description: '+5 segundos y +5% botin.',
    bonuses: { damageMultiplier: 1, healthBonus: 0, timeBonus: 5, lootChanceBonus: 0.05, obolosMultiplier: 1, barrierShields: 0 }
  },
  Aether: {
    title: 'Aliento del Eter',
    description: '+12% dano y +4 segundos.',
    bonuses: { damageMultiplier: 1.12, healthBonus: 0, timeBonus: 4, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 0 }
  },
  Eros: {
    title: 'Impulso Primigenio',
    description: '+15% dano.',
    bonuses: { damageMultiplier: 1.15, healthBonus: 0, timeBonus: 0, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 0 }
  },
  Ananke: {
    title: 'Sello del Destino',
    description: '+1 barrera y +10% obolos.',
    bonuses: { damageMultiplier: 1, healthBonus: 0, timeBonus: 0, lootChanceBonus: 0, obolosMultiplier: 1.1, barrierShields: 1 }
  },
  Phanes: {
    title: 'Primera Llama',
    description: '+10% dano y +3 segundos.',
    bonuses: { damageMultiplier: 1.1, healthBonus: 0, timeBonus: 3, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 0 }
  },
  Thalassa: {
    title: 'Abismo de Marea',
    description: '+20 HP y +3 segundos.',
    bonuses: { damageMultiplier: 1, healthBonus: 20, timeBonus: 3, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 0 }
  },
  Moros: {
    title: 'Augurio Final',
    description: '+18% dano.',
    bonuses: { damageMultiplier: 1.18, healthBonus: 0, timeBonus: 0, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 0 }
  },
  Thanatos: {
    title: 'Marca de la Muerte',
    description: '+15% dano y +15% obolos.',
    bonuses: { damageMultiplier: 1.15, healthBonus: 0, timeBonus: 0, lootChanceBonus: 0, obolosMultiplier: 1.15, barrierShields: 0 }
  },
  Hypnos: {
    title: 'Sueno Invencible',
    description: '+1 barrera y +4 segundos.',
    bonuses: { damageMultiplier: 1, healthBonus: 0, timeBonus: 4, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 1 }
  },
  Nemesis: {
    title: 'Retribucion',
    description: '+10% dano y +10 HP.',
    bonuses: { damageMultiplier: 1.1, healthBonus: 10, timeBonus: 0, lootChanceBonus: 0, obolosMultiplier: 1, barrierShields: 0 }
  },
  Eris: {
    title: 'Discordia',
    description: '+8% dano y +5% botin.',
    bonuses: { damageMultiplier: 1.08, healthBonus: 0, timeBonus: 0, lootChanceBonus: 0.05, obolosMultiplier: 1, barrierShields: 0 }
  }
};

export const getSetBonusEffect = (set: SetType | null | undefined): SetBonusEffect | null => {
  if (!set || set === 'Ninguno') return null;
  return SET_BONUS_EFFECTS[set];
};

export const UPGRADE_COSTS: Record<Rarity, { obolos: number, starFragments: number, next: Rarity | null }> = {
  bronce: { obolos: 50, starFragments: 1, next: 'plata' },
  plata: { obolos: 150, starFragments: 3, next: 'oro' },
  oro: { obolos: 500, starFragments: 10, next: 'espectro' },
  espectro: { obolos: 2000, starFragments: 50, next: 'divino' },
  divino: { obolos: 0, starFragments: 0, next: null }
};

export const upgradeEquipment = (item: Equipment): Equipment => {
  const cost = UPGRADE_COSTS[item.rarity];
  if (!cost.next) return item;

  const newRarity = cost.next;
  const multiplier = newRarity === 'divino' ? 5 : newRarity === 'espectro' ? 4 : newRarity === 'oro' ? 3 : newRarity === 'plata' ? 2 : 1;
  
  const stats: any = {};
  if (item.type === 'weapon') stats.damage = (item.stats.damage || 0) + Math.floor(Math.random() * 5 * multiplier) + multiplier;
  if (item.type === 'armor') stats.health = (item.stats.health || 0) + Math.floor(Math.random() * 20 * multiplier) + (10 * multiplier);
  if (item.type === 'artifact') stats.time = (item.stats.time || 0) + Math.floor(Math.random() * 2 * multiplier) + 1;

  return {
    ...item,
    rarity: newRarity,
    stats
  };
};

export const ENCHANTMENTS = [
  { name: 'Filo de Almas', stat: 'damage', bonus: 10 },
  { name: 'Coraza de Éter', stat: 'health', bonus: 50 },
  { name: 'Cronos Fugaz', stat: 'time', bonus: 2 },
  { name: 'Ira de Ares', stat: 'damage', bonus: 25 },
  { name: 'Manto de Nyx', stat: 'health', bonus: 100 }
];
