export type SpecterFaction = 'Wyvern' | 'Griffon' | 'Garuda';

export type SpecterCrest =
  | 'wing'
  | 'claw'
  | 'crown'
  | 'horn'
  | 'eye'
  | 'fang'
  | 'web'
  | 'shell'
  | 'flame'
  | 'moon'
  | 'blade'
  | 'wave'
  | 'root'
  | 'mask'
  | 'storm'
  | 'beetle'
  | 'serpent'
  | 'feather';

export type SpecterAbilityArchetype =
  | 'assault'
  | 'bulwark'
  | 'tempo'
  | 'shadow'
  | 'relic'
  | 'memory'
  | 'combo'
  | 'tribute'
  | 'barrier';

export interface SpecterBonuses {
  damageMultiplier: number;
  bonusHealth: number;
  bonusTime: number;
  lootChanceBonus: number;
  memoryDropBonus: number;
  dodgeChance: number;
  startingShields: number;
  comboBonus: number;
  obolosMultiplier: number;
}

export interface SpecterDefinition {
  id: string;
  name: string;
  title: string;
  beast: string;
  faction: SpecterFaction;
  factionLabel: string;
  legion: string;
  crest: SpecterCrest;
  ability: {
    name: string;
    description: string;
    archetype: SpecterAbilityArchetype;
    bonuses: SpecterBonuses;
  };
  logo: string;
}

type SpecterSeed = [string, string, string, SpecterFaction, SpecterCrest, SpecterAbilityArchetype];

const DEFAULT_BONUSES: SpecterBonuses = {
  damageMultiplier: 1,
  bonusHealth: 0,
  bonusTime: 0,
  lootChanceBonus: 0,
  memoryDropBonus: 0,
  dodgeChance: 0,
  startingShields: 0,
  comboBonus: 0,
  obolosMultiplier: 1,
};

const FACTION_LABELS: Record<SpecterFaction, string> = {
  Wyvern: 'Ejercito de Wyvern',
  Griffon: 'Ejercito de Griffon',
  Garuda: 'Ejercito de Garuda',
};

const FACTION_PALETTES: Record<SpecterFaction, string[][]> = {
  Wyvern: [
    ['#ff4d6d', '#ff8a00', '#ffd166'],
    ['#ef476f', '#f94144', '#f9c74f'],
    ['#d62828', '#f77f00', '#fcbf49'],
    ['#b5179e', '#f72585', '#ffb703'],
  ],
  Griffon: [
    ['#4cc9f0', '#4361ee', '#d8f3ff'],
    ['#577590', '#277da1', '#90e0ef'],
    ['#3a86ff', '#00b4d8', '#caf0f8'],
    ['#4895ef', '#560bad', '#bde0fe'],
  ],
  Garuda: [
    ['#fca311', '#ff595e', '#ffd166'],
    ['#ffba08', '#faa307', '#ffd6a5'],
    ['#f9844a', '#f94144', '#f9c74f'],
    ['#fb8500', '#ff006e', '#ffd166'],
  ],
};

const ABILITY_TEMPLATES: Record<
  SpecterAbilityArchetype,
  {
    prefix: string;
    description: (beast: string) => string;
    bonuses: Partial<SpecterBonuses>;
  }
> = {
  assault: {
    prefix: 'Garra',
    description: (beast) => `La furia de ${beast} aumenta un 12% tu potencia ofensiva en Arena y Torre.`,
    bonuses: { damageMultiplier: 1.12 },
  },
  bulwark: {
    prefix: 'Caparazon',
    description: (beast) => `El caparazon de ${beast} te concede +18 de vida inicial en modos de combate.`,
    bonuses: { bonusHealth: 18 },
  },
  tempo: {
    prefix: 'Velo',
    description: (beast) => `El impulso de ${beast} te da +3 segundos al inicio de cada pregunta o piso.`,
    bonuses: { bonusTime: 3 },
  },
  shadow: {
    prefix: 'Sombra',
    description: (beast) => `La sombra de ${beast} te concede 12% de probabilidad de evadir dano.`,
    bonuses: { dodgeChance: 0.12 },
  },
  relic: {
    prefix: 'Instinto',
    description: (beast) => `El instinto de ${beast} aumenta un 12% la probabilidad de obtener equipo.`,
    bonuses: { lootChanceBonus: 0.12 },
  },
  memory: {
    prefix: 'Eco',
    description: (beast) => `El eco de ${beast} aumenta un 8% la probabilidad de hallar fragmentos de memoria.`,
    bonuses: { memoryDropBonus: 0.08 },
  },
  combo: {
    prefix: 'Frenesi',
    description: (beast) => `El frenesi de ${beast} potencia tus rachas y agrega +0.25 al multiplicador de combo.`,
    bonuses: { comboBonus: 0.25 },
  },
  tribute: {
    prefix: 'Tributo',
    description: (beast) => `El sello de ${beast} aumenta un 18% los obolos obtenidos al finalizar la partida.`,
    bonuses: { obolosMultiplier: 1.18 },
  },
  barrier: {
    prefix: 'Egida',
    description: (beast) => `La egida de ${beast} te otorga 1 barrera espectral al comienzo de cada run.`,
    bonuses: { startingShields: 1 },
  },
};

const SPECTER_SEEDS: SpecterSeed[] = [
  ['radamanthys-wyvern', 'Radamanthys', 'Wyvern', 'Wyvern', 'wing', 'assault'],
  ['valentine-harpia', 'Valentine', 'Harpia', 'Wyvern', 'feather', 'combo'],
  ['gordon-minotauro', 'Gordon', 'Minotauro', 'Wyvern', 'horn', 'bulwark'],
  ['sylphid-basilisco', 'Sylphid', 'Basilisco', 'Wyvern', 'serpent', 'barrier'],
  ['giganto-ciclope', 'Giganto', 'Ciclope', 'Wyvern', 'eye', 'assault'],
  ['phlegyas-licaon', 'Phlegyas', 'Licaon', 'Wyvern', 'fang', 'combo'],
  ['aster-manticora', 'Aster', 'Manticora', 'Wyvern', 'blade', 'assault'],
  ['drakon-quimera', 'Drakon', 'Quimera', 'Wyvern', 'flame', 'assault'],
  ['kael-cerbero', 'Kael', 'Cerbero', 'Wyvern', 'fang', 'barrier'],
  ['brontes-toro', 'Brontes', 'Toro', 'Wyvern', 'horn', 'bulwark'],
  ['morvain-kraken', 'Morvain', 'Kraken', 'Wyvern', 'wave', 'relic'],
  ['hydros-hydra', 'Hydros', 'Hydra', 'Wyvern', 'serpent', 'assault'],
  ['vhalor-escorpion', 'Vhalor', 'Escorpion', 'Wyvern', 'blade', 'assault'],
  ['darius-roc', 'Darius', 'Roc', 'Wyvern', 'wing', 'tempo'],
  ['kraven-jabali', 'Kraven', 'Jabali', 'Wyvern', 'fang', 'bulwark'],
  ['azrael-golem', 'Azrael', 'Golem', 'Wyvern', 'shell', 'bulwark'],
  ['balthar-tifon', 'Balthar', 'Tifon', 'Wyvern', 'storm', 'assault'],
  ['nergal-coyote', 'Nergal', 'Coyote', 'Wyvern', 'fang', 'shadow'],
  ['zethar-jaguar', 'Zethar', 'Jaguar', 'Wyvern', 'claw', 'combo'],
  ['ikar-buitre', 'Ikar', 'Buitre', 'Wyvern', 'feather', 'tribute'],
  ['orkus-bison', 'Orkus', 'Bison', 'Wyvern', 'horn', 'bulwark'],
  ['ragnar-sabueso', 'Ragnar', 'Sabueso', 'Wyvern', 'fang', 'shadow'],
  ['surtur-fenix-negra', 'Surtur', 'Fenix Negra', 'Wyvern', 'flame', 'combo'],
  ['obsidian-leviatan', 'Obsidian', 'Leviatan', 'Wyvern', 'wave', 'relic'],
  ['maelor-dragon-negro', 'Maelor', 'Dragon Negro', 'Wyvern', 'wing', 'assault'],
  ['dagr-lobo-carmesi', 'Dagr', 'Lobo Carmesi', 'Wyvern', 'claw', 'combo'],
  ['torvak-rinoceronte', 'Torvak', 'Rinoceronte', 'Wyvern', 'horn', 'bulwark'],
  ['valnor-mamut', 'Valnor', 'Mamut', 'Wyvern', 'shell', 'bulwark'],
  ['sargon-vulture', 'Sargon', 'Vulture', 'Wyvern', 'feather', 'tribute'],
  ['kharon-tiburon', 'Kharon', 'Tiburon', 'Wyvern', 'wave', 'relic'],
  ['zevrak-anfisbena', 'Zevrak', 'Anfisbena', 'Wyvern', 'serpent', 'barrier'],
  ['fenrir-hiena', 'Fenrir', 'Hiena', 'Wyvern', 'claw', 'shadow'],
  ['volkr-karkinos', 'Volkr', 'Karkinos', 'Wyvern', 'shell', 'bulwark'],
  ['hadran-anzu', 'Hadran', 'Anzu', 'Wyvern', 'wing', 'tempo'],
  ['mortus-salamandra', 'Mortus', 'Salamandra', 'Wyvern', 'flame', 'memory'],
  ['talos-carnero', 'Talos', 'Carnero', 'Wyvern', 'horn', 'bulwark'],

  ['minos-grifo', 'Minos', 'Grifo', 'Griffon', 'claw', 'tempo'],
  ['lune-balrog', 'Lune', 'Balrog', 'Griffon', 'mask', 'tempo'],
  ['pharaoh-esfinge', 'Pharaoh', 'Esfinge', 'Griffon', 'crown', 'tribute'],
  ['queen-alraune', 'Queen', 'Alraune', 'Griffon', 'root', 'relic'],
  ['myu-papillon', 'Myu', 'Papillon', 'Griffon', 'wing', 'shadow'],
  ['niobe-deep', 'Niobe', 'Deep', 'Griffon', 'wave', 'memory'],
  ['raimi-worm', 'Raimi', 'Worm', 'Griffon', 'serpent', 'relic'],
  ['cube-dullahan', 'Cube', 'Dullahan', 'Griffon', 'mask', 'barrier'],
  ['stand-beetle', 'Stand', 'Beetle', 'Griffon', 'beetle', 'bulwark'],
  ['zelos-frog', 'Zelos', 'Frog', 'Griffon', 'wave', 'shadow'],
  ['rune-mandragora', 'Rune', 'Mandragora', 'Griffon', 'root', 'memory'],
  ['fedor-gorgona', 'Fedor', 'Gorgona', 'Griffon', 'eye', 'barrier'],
  ['orfeo-sirena', 'Orfeo', 'Sirena', 'Griffon', 'wave', 'combo'],
  ['nysos-aracne', 'Nysos', 'Aracne', 'Griffon', 'web', 'relic'],
  ['helgor-cuervo', 'Helgor', 'Cuervo', 'Griffon', 'feather', 'tribute'],
  ['sephir-lamia', 'Sephir', 'Lamia', 'Griffon', 'serpent', 'shadow'],
  ['dorian-banshee', 'Dorian', 'Banshee', 'Griffon', 'moon', 'memory'],
  ['malphas-cuervo', 'Malphas', 'Cuervo', 'Griffon', 'wing', 'tempo'],
  ['thesan-libelula', 'Thesan', 'Libelula', 'Griffon', 'wing', 'tempo'],
  ['caedis-quimera-astral', 'Caedis', 'Quimera Astral', 'Griffon', 'storm', 'assault'],
  ['ilyas-buho', 'Ilyas', 'Buho', 'Griffon', 'eye', 'memory'],
  ['variel-escarabajo', 'Variel', 'Escarabajo', 'Griffon', 'beetle', 'bulwark'],
  ['ozymandias-chacal', 'Ozymandias', 'Chacal', 'Griffon', 'fang', 'tribute'],
  ['selket-escorpion', 'Selket', 'Escorpion', 'Griffon', 'blade', 'assault'],
  ['morfeo-polilla-lunar', 'Morfeo', 'Polilla Lunar', 'Griffon', 'moon', 'barrier'],
  ['tarvos-alce', 'Tarvos', 'Alce', 'Griffon', 'crown', 'bulwark'],
  ['nereus-hipocampo', 'Nereus', 'Hipocampo', 'Griffon', 'wave', 'tempo'],
  ['rasalas-medusa', 'Rasalas', 'Medusa', 'Griffon', 'eye', 'barrier'],
  ['lucien-zorro-niveo', 'Lucien', 'Zorro Niveo', 'Griffon', 'claw', 'shadow'],
  ['enoch-cuervo-blanco', 'Enoch', 'Cuervo Blanco', 'Griffon', 'feather', 'memory'],
  ['sabnak-basilisco-real', 'Sabnak', 'Basilisco Real', 'Griffon', 'serpent', 'barrier'],
  ['cassiel-draco-celeste', 'Cassiel', 'Draco Celeste', 'Griffon', 'wing', 'tempo'],
  ['belisario-mantarraya-lunar', 'Belisario', 'Mantarraya Lunar', 'Griffon', 'wave', 'tempo'],
  ['xamiel-caracol', 'Xamiel', 'Caracol', 'Griffon', 'shell', 'bulwark'],
  ['uriel-quetzal', 'Uriel', 'Quetzal', 'Griffon', 'feather', 'combo'],
  ['amon-sierpe', 'Amon', 'Sierpe', 'Griffon', 'serpent', 'shadow'],

  ['aiacos-garuda', 'Aiacos', 'Garuda', 'Garuda', 'wing', 'tempo'],
  ['kagaho-bennu', 'Kagaho', 'Bennu', 'Garuda', 'flame', 'combo'],
  ['caronte-aqueronte', 'Caronte', 'Aqueronte', 'Garuda', 'wave', 'tribute'],
  ['alastor-halcon', 'Alastor', 'Halcon', 'Garuda', 'wing', 'tempo'],
  ['nerek-pegaso-negro', 'Nerek', 'Pegaso Negro', 'Garuda', 'wing', 'combo'],
  ['vritra-cobra', 'Vritra', 'Cobra', 'Garuda', 'serpent', 'assault'],
  ['thanir-cuervo-ceniza', 'Thanir', 'Cuervo Ceniza', 'Garuda', 'feather', 'memory'],
  ['sariel-quetzal-negro', 'Sariel', 'Quetzal Negro', 'Garuda', 'feather', 'tempo'],
  ['ikaros-anzu', 'Ikaros', 'Anzu', 'Garuda', 'wing', 'relic'],
  ['vorian-harpia-nocturna', 'Vorian', 'Harpia Nocturna', 'Garuda', 'feather', 'shadow'],
  ['zephyros-condor', 'Zephyros', 'Condor', 'Garuda', 'wing', 'tribute'],
  ['akmon-fenix-sombria', 'Akmon', 'Fenix Sombria', 'Garuda', 'flame', 'combo'],
  ['belthor-lince', 'Belthor', 'Lince', 'Garuda', 'claw', 'combo'],
  ['namaru-murcielago', 'Namaru', 'Murcielago', 'Garuda', 'moon', 'shadow'],
  ['eolos-albatros', 'Eolos', 'Albatros', 'Garuda', 'wave', 'tempo'],
  ['xandor-halcon-tormenta', 'Xandor', 'Halcon de Tormenta', 'Garuda', 'storm', 'assault'],
  ['ryuzen-onix', 'Ryuzen', 'Onix', 'Garuda', 'serpent', 'barrier'],
  ['malthus-grulla', 'Malthus', 'Grulla', 'Garuda', 'feather', 'tempo'],
  ['darien-tigre-negro', 'Darien', 'Tigre Negro', 'Garuda', 'claw', 'assault'],
  ['sabir-cormoran', 'Sabir', 'Cormoran', 'Garuda', 'wave', 'relic'],
  ['korvus-cuervo', 'Korvus', 'Cuervo', 'Garuda', 'feather', 'memory'],
  ['orias-aguila-negra', 'Orias', 'Aguila Negra', 'Garuda', 'wing', 'combo'],
  ['tempus-colibri', 'Tempus', 'Colibri', 'Garuda', 'feather', 'tempo'],
  ['iblis-buitre-real', 'Iblis', 'Buitre Real', 'Garuda', 'feather', 'tribute'],
  ['sahel-alcaravan', 'Sahel', 'Alcaravan', 'Garuda', 'wing', 'tempo'],
  ['nurak-dragon-marino', 'Nurak', 'Dragon Marino', 'Garuda', 'wave', 'relic'],
  ['pavor-pavoreal', 'Pavor', 'Pavoreal', 'Garuda', 'feather', 'barrier'],
  ['teseo-leon-alado', 'Teseo', 'Leon Alado', 'Garuda', 'wing', 'bulwark'],
  ['argen-sable', 'Argen', 'Sable', 'Garuda', 'claw', 'assault'],
  ['nox-quimera-aerea', 'Nox', 'Quimera Aerea', 'Garuda', 'storm', 'assault'],
  ['balior-petrel', 'Balior', 'Petrel', 'Garuda', 'wave', 'tempo'],
  ['zarek-draco-aereo', 'Zarek', 'Draco Aereo', 'Garuda', 'wing', 'assault'],
  ['vael-cernicalo', 'Vael', 'Cernicalo', 'Garuda', 'wing', 'tempo'],
  ['onuris-mantis-aerea', 'Onuris', 'Mantis Aerea', 'Garuda', 'blade', 'combo'],
  ['kairon-hipogrifo', 'Kairon', 'Hipogrifo', 'Garuda', 'wing', 'barrier'],
  ['ereb-garza-negra', 'Ereb', 'Garza Negra', 'Garuda', 'feather', 'shadow'],
];

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const svgToDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const pickPalette = (faction: SpecterFaction, seed: string) => {
  const palettes = FACTION_PALETTES[faction];
  return palettes[hashString(seed) % palettes.length];
};

const getInitials = (title: string, beast: string) => `${title.charAt(0)}${beast.replace(/[^A-Za-z]/g, '').charAt(0) || 'S'}`.toUpperCase();

const renderCrest = (crest: SpecterCrest, primary: string, secondary: string) => {
  switch (crest) {
    case 'wing':
      return `
        <path d="M44 78 L80 44 L76 96 L44 118 Z" fill="${primary}" opacity="0.85" />
        <path d="M156 78 L120 44 L124 96 L156 118 Z" fill="${primary}" opacity="0.85" />
      `;
    case 'feather':
      return `
        <path d="M64 62 Q84 32 94 78 Q74 88 64 62 Z" fill="${primary}" opacity="0.88" />
        <path d="M136 62 Q116 32 106 78 Q126 88 136 62 Z" fill="${secondary}" opacity="0.88" />
        <path d="M100 56 L100 128" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.6" />
      `;
    case 'claw':
      return `
        <path d="M72 48 L88 112" stroke="${primary}" stroke-width="10" stroke-linecap="round" />
        <path d="M100 42 L106 112" stroke="${secondary}" stroke-width="10" stroke-linecap="round" />
        <path d="M128 48 L120 112" stroke="${primary}" stroke-width="10" stroke-linecap="round" />
      `;
    case 'crown':
      return `
        <path d="M56 98 L74 56 L100 84 L126 56 L144 98 L144 114 L56 114 Z" fill="${primary}" opacity="0.88" />
      `;
    case 'horn':
      return `
        <path d="M66 54 Q40 80 58 112 Q76 94 82 68 Z" fill="${primary}" opacity="0.9" />
        <path d="M134 54 Q160 80 142 112 Q124 94 118 68 Z" fill="${secondary}" opacity="0.9" />
      `;
    case 'eye':
      return `
        <ellipse cx="100" cy="88" rx="46" ry="24" fill="none" stroke="${primary}" stroke-width="8" />
        <circle cx="100" cy="88" r="12" fill="${secondary}" />
      `;
    case 'fang':
      return `
        <path d="M74 56 L92 118 L102 84 Z" fill="${primary}" opacity="0.9" />
        <path d="M126 56 L98 84 L108 118 Z" fill="${secondary}" opacity="0.9" />
      `;
    case 'web':
      return `
        <circle cx="100" cy="88" r="40" fill="none" stroke="${primary}" stroke-width="4" opacity="0.8" />
        <path d="M60 88 H140 M100 48 V128 M72 60 L128 116 M72 116 L128 60" stroke="${secondary}" stroke-width="4" opacity="0.75" />
      `;
    case 'shell':
      return `
        <path d="M100 42 Q58 58 58 102 Q58 124 100 136 Q142 124 142 102 Q142 58 100 42 Z" fill="${primary}" opacity="0.88" />
        <path d="M100 48 V128 M76 64 H124 M70 88 H130" stroke="#ffffff" stroke-width="4" opacity="0.38" />
      `;
    case 'flame':
      return `
        <path d="M104 40 Q128 70 114 92 Q136 90 132 120 Q118 136 100 136 Q74 136 66 112 Q66 88 86 78 Q82 56 104 40 Z" fill="${primary}" opacity="0.9" />
      `;
    case 'moon':
      return `
        <circle cx="96" cy="86" r="34" fill="${primary}" opacity="0.88" />
        <circle cx="112" cy="80" r="30" fill="#12051f" opacity="0.95" />
      `;
    case 'blade':
      return `
        <path d="M100 40 L118 88 L100 136 L82 88 Z" fill="${primary}" opacity="0.88" />
        <path d="M70 110 L130 66" stroke="${secondary}" stroke-width="8" stroke-linecap="round" />
      `;
    case 'wave':
      return `
        <path d="M52 102 Q72 82 92 102 T132 102 T148 102" fill="none" stroke="${primary}" stroke-width="8" stroke-linecap="round" />
        <path d="M52 122 Q72 102 92 122 T132 122 T148 122" fill="none" stroke="${secondary}" stroke-width="8" stroke-linecap="round" opacity="0.8" />
      `;
    case 'root':
      return `
        <path d="M100 46 V124 M100 76 L72 112 M100 86 L128 118 M100 98 L82 128 M100 104 L118 130" stroke="${primary}" stroke-width="7" stroke-linecap="round" />
      `;
    case 'mask':
      return `
        <path d="M68 52 H132 L124 118 Q100 138 76 118 Z" fill="${primary}" opacity="0.88" />
        <circle cx="86" cy="84" r="8" fill="#12051f" />
        <circle cx="114" cy="84" r="8" fill="#12051f" />
      `;
    case 'storm':
      return `
        <path d="M112 42 L82 88 H100 L88 136 L126 82 H106 Z" fill="${primary}" opacity="0.92" />
      `;
    case 'beetle':
      return `
        <ellipse cx="100" cy="90" rx="30" ry="42" fill="${primary}" opacity="0.9" />
        <path d="M100 48 V132 M74 74 L56 58 M126 74 L144 58 M74 110 L56 126 M126 110 L144 126" stroke="${secondary}" stroke-width="5" stroke-linecap="round" />
      `;
    case 'serpent':
      return `
        <path d="M124 52 Q74 52 76 84 Q78 104 108 102 Q134 100 132 126" fill="none" stroke="${primary}" stroke-width="10" stroke-linecap="round" />
        <circle cx="132" cy="126" r="6" fill="${secondary}" />
      `;
    default:
      return `
        <circle cx="100" cy="88" r="42" fill="${primary}" opacity="0.86" />
      `;
  }
};

const buildAbility = (beast: string, archetype: SpecterAbilityArchetype) => {
  const template = ABILITY_TEMPLATES[archetype];
  return {
    name: `${template.prefix} de ${beast}`,
    description: template.description(beast),
    archetype,
    bonuses: {
      ...DEFAULT_BONUSES,
      ...template.bonuses,
    },
  };
};

const buildLegion = (faction: SpecterFaction, index: number) => {
  const position = index + 1;
  const tier = position <= 12 ? 'Masei Celeste' : 'Masei Terrestre';
  const order = position <= 12 ? position : position - 12;
  return `${tier} ${order.toString().padStart(2, '0')}`;
};

export const generateSpecterLogo = (
  specter: Pick<SpecterDefinition, 'id' | 'title' | 'beast' | 'faction' | 'crest'>
) => {
  const [primary, secondary, accent] = pickPalette(specter.faction, specter.id);
  const initials = getInitials(specter.title, specter.beast);
  const crest = renderCrest(specter.crest, primary, secondary);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${specter.title} de ${specter.beast}">
      <defs>
        <linearGradient id="bg-${specter.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#12051f" />
          <stop offset="52%" stop-color="#220a38" />
          <stop offset="100%" stop-color="#06010d" />
        </linearGradient>
        <linearGradient id="ring-${specter.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="28" fill="url(#bg-${specter.id})" />
      <polygon points="100,16 164,52 164,128 100,184 36,128 36,52" fill="none" stroke="url(#ring-${specter.id})" stroke-width="8" />
      <polygon points="100,30 150,58 150,122 100,170 50,122 50,58" fill="${accent}" opacity="0.08" />
      <g>${crest}</g>
      <circle cx="100" cy="146" r="26" fill="#0c0216" opacity="0.78" />
      <text x="100" y="154" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#f8fbff" letter-spacing="2">${initials}</text>
      <circle cx="100" cy="100" r="72" fill="none" stroke="${accent}" stroke-width="2" opacity="0.28" />
    </svg>
  `;
  return svgToDataUri(svg);
};

const createSpecter = (seed: SpecterSeed, index: number): SpecterDefinition => {
  const [id, title, beast, faction, crest, archetype] = seed;
  const definition: SpecterDefinition = {
    id,
    name: `${title} de ${beast}`,
    title,
    beast,
    faction,
    factionLabel: FACTION_LABELS[faction],
    legion: buildLegion(faction, index % 36),
    crest,
    ability: buildAbility(beast, archetype),
    logo: '',
  };
  definition.logo = generateSpecterLogo(definition);
  return definition;
};

export const SPECTER_CATALOG = SPECTER_SEEDS.map((seed, index) => createSpecter(seed, index));

export const SPECTERS_BY_FACTION: Record<SpecterFaction, SpecterDefinition[]> = {
  Wyvern: SPECTER_CATALOG.filter((specter) => specter.faction === 'Wyvern'),
  Griffon: SPECTER_CATALOG.filter((specter) => specter.faction === 'Griffon'),
  Garuda: SPECTER_CATALOG.filter((specter) => specter.faction === 'Garuda'),
};

export const getSpecterById = (specterId?: string | null) =>
  SPECTER_CATALOG.find((specter) => specter.id === specterId) || null;

export const getSpecterByName = (specterName?: string | null) =>
  SPECTER_CATALOG.find((specter) => specter.name === specterName) || null;

export const resolveSpecterForProfile = (profile?: { specterId?: string; specterName?: string }) =>
  getSpecterById(profile?.specterId) || getSpecterByName(profile?.specterName) || null;

export const getSpecterBonuses = (profile?: { specterId?: string; specterName?: string }) =>
  resolveSpecterForProfile(profile)?.ability.bonuses || DEFAULT_BONUSES;
