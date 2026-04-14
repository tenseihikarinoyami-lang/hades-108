// CRAFTING RECETA-DRIVEN - Sistema de recetas en Forge
export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  category: 'weapon' | 'armor' | 'potion' | 'artifact';
  rarity: 'comun' | 'raro' | 'epico' | 'legendario';
  materials: {
    stardust: number;
    shadowEssence: number;
    primordialOre: number;
    soulEssence?: number;
  };
  result: {
    type: string;
    name: string;
    stats?: any;
  };
  discovered: boolean;
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'recipe_1',
    name: 'Espada Estelar',
    description: 'Forjada con polvo de estrellas',
    category: 'weapon',
    rarity: 'raro',
    materials: { stardust: 50, shadowEssence: 10, primordialOre: 5 },
    result: { type: 'weapon', name: 'Espada Estelar', stats: { damage: 15 } },
    discovered: false
  },
  {
    id: 'recipe_2',
    name: 'Armadura de Sombras',
    description: 'Protección del inframundo',
    category: 'armor',
    rarity: 'epico',
    materials: { stardust: 100, shadowEssence: 30, primordialOre: 15, soulEssence: 5 },
    result: { type: 'armor', name: 'Armadura de Sombras', stats: { health: 50 } },
    discovered: false
  },
  {
    id: 'recipe_3',
    name: 'Poción de Cronos Avanzada',
    description: '+20 segundos extra',
    category: 'potion',
    rarity: 'comun',
    materials: { stardust: 10, shadowEssence: 2, primordialOre: 0 },
    result: { type: 'consumable', name: 'Poción de Cronos x3', stats: { time_potion: 3 } },
    discovered: false
  },
  {
    id: 'recipe_4',
    name: 'Amuleto Primordial',
    description: 'Poder de los dioses antiguos',
    category: 'artifact',
    rarity: 'legendario',
    materials: { stardust: 200, shadowEssence: 50, primordialOre: 30, soulEssence: 10 },
    result: { type: 'artifact', name: 'Amuleto Primordial', stats: { time: 10, damage: 5, health: 25 } },
    discovered: false
  },
  {
    id: 'recipe_5',
    name: 'Lágrima de Atenea',
    description: 'Curación divina',
    category: 'potion',
    rarity: 'raro',
    materials: { stardust: 30, shadowEssence: 5, primordialOre: 2 },
    result: { type: 'consumable', name: 'Lágrima de Atenea x2', stats: { healing_potion: 2 } },
    discovered: false
  },
  {
    id: 'recipe_6',
    name: 'Escudo del Cocytos',
    description: 'Defensa gélida',
    category: 'armor',
    rarity: 'raro',
    materials: { stardust: 40, shadowEssence: 15, primordialOre: 8 },
    result: { type: 'armor', name: 'Escudo del Cocytos', stats: { health: 25 } },
    discovered: false
  }
];

// Descubrir receta (aleatorio al usar materiales)
export function discoverRandomRecipe(discoveredRecipes: string[]): CraftingRecipe | null {
  const undiscovered = CRAFTING_RECIPES.filter(r => !discoveredRecipes.includes(r.id));
  if (undiscovered.length === 0) return null;
  return undiscovered[Math.floor(Math.random() * undiscovered.length)];
}

// Verificar si tiene materiales suficientes
export function canCraft(recipe: CraftingRecipe, materials: any): boolean {
  return (
    (materials.stardust || 0) >= recipe.materials.stardust &&
    (materials.shadowEssence || 0) >= recipe.materials.shadowEssence &&
    (materials.primordialOre || 0) >= recipe.materials.primordialOre &&
    ((materials.soulEssence || 0) >= (recipe.materials.soulEssence || 0))
  );
}
