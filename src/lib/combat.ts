import { getSpecterBonuses, getSpecterCollectionProgress, getSpecterAwakeningLevel, resolveSpecterForProfile, type SpecterBonuses, type SpecterDefinition } from '@/data/specters';
import { calculateSetBonus, getSetBonusEffect, type Element, type Equipment, type SetBonusEffect, type SetType } from '@/lib/rpg';

type CombatProfile = {
  specterId?: string;
  specterName?: string;
  discoveredSpecters?: string[];
  specterAwakenings?: Record<string, number>;
  equippedGear?: {
    weapon?: Equipment | null;
    armor?: Equipment | null;
    artifact?: Equipment | null;
  };
};

type CombatContextInput = {
  mode?: string;
  enemyElement?: Element | null;
  enemyTags?: string[];
};

export interface CombatBonuses extends SpecterBonuses {
  setName: SetType | null;
  setEffect: SetBonusEffect | null;
}

const DEFAULT_SET_MULTIPLIERS = {
  damageMultiplier: 1,
  healthBonus: 0,
  timeBonus: 0,
  lootChanceBonus: 0,
  obolosMultiplier: 1,
  barrierShields: 0,
};

export const getCombatContext = (profile?: CombatProfile | null): {
  activeSpecter: SpecterDefinition | null;
  activeSetBonus: SetType | null;
  activeSetEffect: SetBonusEffect | null;
  awakeningLevel: number;
  collectionProgress: ReturnType<typeof getSpecterCollectionProgress>;
  bonuses: CombatBonuses;
} => getCombatContextFor(profile);

export const getCombatContextFor = (profile?: CombatProfile | null, context?: CombatContextInput): {
  activeSpecter: SpecterDefinition | null;
  activeSetBonus: SetType | null;
  activeSetEffect: SetBonusEffect | null;
  awakeningLevel: number;
  collectionProgress: ReturnType<typeof getSpecterCollectionProgress>;
  bonuses: CombatBonuses;
} => {
  const activeSpecter = resolveSpecterForProfile(profile || undefined);
  const specterBonuses = getSpecterBonuses(profile || undefined, context);
  const activeSetBonus = calculateSetBonus(profile?.equippedGear || {});
  const activeSetEffect = getSetBonusEffect(activeSetBonus);
  const setBonuses = activeSetEffect?.bonuses || DEFAULT_SET_MULTIPLIERS;
  const awakeningLevel = getSpecterAwakeningLevel(profile || undefined, activeSpecter);
  const collectionProgress = getSpecterCollectionProgress(profile || undefined);

  return {
    activeSpecter,
    activeSetBonus,
    activeSetEffect,
    awakeningLevel,
    collectionProgress,
    bonuses: {
      damageMultiplier: specterBonuses.damageMultiplier * setBonuses.damageMultiplier,
      bonusHealth: specterBonuses.bonusHealth + setBonuses.healthBonus,
      bonusTime: specterBonuses.bonusTime + setBonuses.timeBonus,
      lootChanceBonus: specterBonuses.lootChanceBonus + setBonuses.lootChanceBonus,
      memoryDropBonus: specterBonuses.memoryDropBonus,
      dodgeChance: specterBonuses.dodgeChance,
      startingShields: specterBonuses.startingShields + setBonuses.barrierShields,
      comboBonus: specterBonuses.comboBonus,
      obolosMultiplier: specterBonuses.obolosMultiplier * setBonuses.obolosMultiplier,
      setName: activeSetBonus,
      setEffect: activeSetEffect,
    },
  };
};
