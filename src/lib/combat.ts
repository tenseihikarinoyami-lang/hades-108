import { getSpecterBonuses, resolveSpecterForProfile, type SpecterBonuses, type SpecterDefinition } from '@/data/specters';
import { calculateSetBonus, getSetBonusEffect, type Equipment, type SetBonusEffect, type SetType } from '@/lib/rpg';

type CombatProfile = {
  specterId?: string;
  specterName?: string;
  equippedGear?: {
    weapon?: Equipment | null;
    armor?: Equipment | null;
    artifact?: Equipment | null;
  };
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
  bonuses: CombatBonuses;
} => {
  const activeSpecter = resolveSpecterForProfile(profile || undefined);
  const specterBonuses = getSpecterBonuses(profile || undefined);
  const activeSetBonus = calculateSetBonus(profile?.equippedGear || {});
  const activeSetEffect = getSetBonusEffect(activeSetBonus);
  const setBonuses = activeSetEffect?.bonuses || DEFAULT_SET_MULTIPLIERS;

  return {
    activeSpecter,
    activeSetBonus,
    activeSetEffect,
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
