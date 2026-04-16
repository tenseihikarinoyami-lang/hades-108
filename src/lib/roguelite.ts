import type { SpecterBonuses } from '@/data/specters';

export type RogueliteMode = 'tower' | 'labyrinth';

export interface RunRelic {
  id: string;
  name: string;
  description: string;
  tier: 'minor' | 'major' | 'mythic';
  mode: RogueliteMode | 'universal';
  bonuses: Partial<SpecterBonuses> & {
    starFragmentBonus?: number;
    scoreMultiplier?: number;
    healingBonus?: number;
    trapReduction?: number;
  };
}

export interface RunRelicBonuses {
  damageMultiplier: number;
  bonusHealth: number;
  bonusTime: number;
  lootChanceBonus: number;
  memoryDropBonus: number;
  dodgeChance: number;
  startingShields: number;
  comboBonus: number;
  obolosMultiplier: number;
  starFragmentBonus: number;
  scoreMultiplier: number;
  healingBonus: number;
  trapReduction: number;
}

const DEFAULT_RUN_RELIC_BONUSES: RunRelicBonuses = {
  damageMultiplier: 1,
  bonusHealth: 0,
  bonusTime: 0,
  lootChanceBonus: 0,
  memoryDropBonus: 0,
  dodgeChance: 0,
  startingShields: 0,
  comboBonus: 0,
  obolosMultiplier: 1,
  starFragmentBonus: 0,
  scoreMultiplier: 1,
  healingBonus: 0,
  trapReduction: 0,
};

export const RUN_RELIC_POOL: RunRelic[] = [
  { id: 'blood-lantern', name: 'Farol de Sangre', description: '+8% dano en la run.', tier: 'minor', mode: 'tower', bonuses: { damageMultiplier: 1.08 } },
  { id: 'hourglass-shard', name: 'Esquirla de Chronos', description: '+2s al reloj por combate.', tier: 'minor', mode: 'universal', bonuses: { bonusTime: 2 } },
  { id: 'ashen-shell', name: 'Caparazon Cenizo', description: '+18 HP al maximo temporal.', tier: 'minor', mode: 'universal', bonuses: { bonusHealth: 18 } },
  { id: 'greed-sigil', name: 'Sigilo del Recaudador', description: '+12% obolos al final de la run.', tier: 'minor', mode: 'universal', bonuses: { obolosMultiplier: 1.12 } },
  { id: 'mnemosine-thread', name: 'Hilo de Mnemosine', description: '+6% memoria en rutas profundas.', tier: 'major', mode: 'labyrinth', bonuses: { memoryDropBonus: 0.06 } },
  { id: 'phantom-cache', name: 'Alijo Fantasma', description: '+10% probabilidad de botin.', tier: 'major', mode: 'universal', bonuses: { lootChanceBonus: 0.1 } },
  { id: 'black-feather', name: 'Pluma Negra', description: '+7% evasion temporal.', tier: 'major', mode: 'universal', bonuses: { dodgeChance: 0.07 } },
  { id: 'sealed-aegis', name: 'Egida Sellada', description: '+1 barrera al inicio del tramo.', tier: 'major', mode: 'universal', bonuses: { startingShields: 1 } },
  { id: 'moon-salve', name: 'Unguento Lunar', description: 'La curacion de santuarios mejora en +20.', tier: 'major', mode: 'labyrinth', bonuses: { healingBonus: 20 } },
  { id: 'trap-mapper', name: 'Cartografo de Trampas', description: 'Reduce el dano de trampas en 10.', tier: 'major', mode: 'labyrinth', bonuses: { trapReduction: 10, bonusTime: 1 } },
  { id: 'tower-tribute', name: 'Tributo de la Torre', description: '+2 fragmentos estelares por jefe de piso.', tier: 'major', mode: 'tower', bonuses: { starFragmentBonus: 2 } },
  { id: 'relentless-rhythm', name: 'Ritmo Implacable', description: '+0.2 combo y +5% dano.', tier: 'major', mode: 'tower', bonuses: { comboBonus: 0.2, damageMultiplier: 1.05 } },
  { id: 'oracle-eye', name: 'Ojo del Oraculo', description: '+15% puntuacion temporal en Laberinto.', tier: 'major', mode: 'labyrinth', bonuses: { scoreMultiplier: 1.15 } },
  { id: 'hades-pact', name: 'Pacto de Hades', description: '+10% dano, +10% botin y +1 barrera.', tier: 'mythic', mode: 'universal', bonuses: { damageMultiplier: 1.1, lootChanceBonus: 0.1, startingShields: 1 } },
];

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededShuffle = <T,>(items: T[], seed: string) => {
  const clone = [...items];
  let hash = hashString(seed);

  for (let index = clone.length - 1; index > 0; index -= 1) {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507);
    const target = hash % (index + 1);
    [clone[index], clone[target]] = [clone[target], clone[index]];
  }

  return clone;
};

export const getRelicOffers = (
  mode: RogueliteMode,
  depth: number,
  ownedRelics: string[] = [],
  seedSuffix: string = ''
) => {
  const available = RUN_RELIC_POOL.filter((relic) => (relic.mode === mode || relic.mode === 'universal') && !ownedRelics.includes(relic.id));
  const prioritized = available.filter((relic) => (depth >= 10 ? relic.tier !== 'minor' : true));
  const source = prioritized.length >= 3 ? prioritized : available;
  return seededShuffle(source, `${mode}:${depth}:${seedSuffix}`).slice(0, 3);
};

export const applyRunRelicBonuses = (relics: RunRelic[]): RunRelicBonuses =>
  relics.reduce<RunRelicBonuses>((accumulator, relic) => ({
    damageMultiplier: accumulator.damageMultiplier * (relic.bonuses.damageMultiplier || 1),
    bonusHealth: accumulator.bonusHealth + (relic.bonuses.bonusHealth || 0),
    bonusTime: accumulator.bonusTime + (relic.bonuses.bonusTime || 0),
    lootChanceBonus: accumulator.lootChanceBonus + (relic.bonuses.lootChanceBonus || 0),
    memoryDropBonus: accumulator.memoryDropBonus + (relic.bonuses.memoryDropBonus || 0),
    dodgeChance: accumulator.dodgeChance + (relic.bonuses.dodgeChance || 0),
    startingShields: accumulator.startingShields + (relic.bonuses.startingShields || 0),
    comboBonus: accumulator.comboBonus + (relic.bonuses.comboBonus || 0),
    obolosMultiplier: accumulator.obolosMultiplier * (relic.bonuses.obolosMultiplier || 1),
    starFragmentBonus: accumulator.starFragmentBonus + (relic.bonuses.starFragmentBonus || 0),
    scoreMultiplier: accumulator.scoreMultiplier * (relic.bonuses.scoreMultiplier || 1),
    healingBonus: accumulator.healingBonus + (relic.bonuses.healingBonus || 0),
    trapReduction: accumulator.trapReduction + (relic.bonuses.trapReduction || 0),
  }), { ...DEFAULT_RUN_RELIC_BONUSES });
