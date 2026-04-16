export interface WeeklyEvent {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  affectedModes: string[];
  bonuses: string[];
  color: string;
  effect: {
    damageMultiplier?: number;
    lootChanceBonus?: number;
    memoryDropBonus?: number;
    obolosMultiplier?: number;
    scoreMultiplier?: number;
  };
}

const WEEKLY_EVENTS: WeeklyEvent[] = [
  {
    id: 'judges-favor',
    name: 'Favor de los Jueces',
    subtitle: 'Semana de economia y botin',
    description: 'Los jueces del Inframundo multiplican el valor del saqueo y del equipo raro.',
    affectedModes: ['Arena', 'Torre', 'Laberinto', 'Subasta'],
    bonuses: ['+20% obolos', '+10% botin raro', 'Mercado negro fortalecido'],
    color: 'from-yellow-900/40 to-amber-700/10',
    effect: { obolosMultiplier: 1.2, lootChanceBonus: 0.1 },
  },
  {
    id: 'mnemosine-week',
    name: 'Resonancia de Mnemosine',
    subtitle: 'Semana de memoria y codex',
    description: 'Los fragmentos de memoria y el progreso del codex responden con mayor facilidad.',
    affectedModes: ['Laberinto', 'Primordiales', 'Campaign'],
    bonuses: ['+15% memoria', '+1 recompensa de codex en jefes', 'Rutas secretas mas estables'],
    color: 'from-cyan-900/40 to-blue-700/10',
    effect: { memoryDropBonus: 0.15, scoreMultiplier: 1.05 },
  },
  {
    id: 'ashen-war',
    name: 'Guerra de Cenizas',
    subtitle: 'Semana de combates y clasificaciones',
    description: 'Los modos competitivos aceleran el score y las facciones pelean por prestigio.',
    affectedModes: ['Arena', 'Battle Royale', 'Holy War', 'Ranking'],
    bonuses: ['+15% score competitivo', 'Top semanal destacado', 'Mas presion en PvP'],
    color: 'from-red-900/40 to-rose-700/10',
    effect: { damageMultiplier: 1.05, scoreMultiplier: 1.15 },
  },
  {
    id: 'sanctuary-siege',
    name: 'Asedio del Santuario',
    subtitle: 'Semana de incursiones y jefes',
    description: 'Los jefes diarios y el jefe de mundo concentran la atencion del inframundo.',
    affectedModes: ['Raids', 'World Boss', 'Primordiales'],
    bonuses: ['+10% dano cooperativo', 'Dossier de jefe enriquecido', 'Mas recompensas por contribucion'],
    color: 'from-purple-900/40 to-fuchsia-700/10',
    effect: { damageMultiplier: 1.1, lootChanceBonus: 0.08 },
  },
];

const getWeekSeed = (date: Date = new Date()) => {
  const firstDay = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const elapsedDays = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);
  return Math.floor((elapsedDays + firstDay.getUTCDay()) / 7);
};

export const getCurrentWeeklyEvent = (date: Date = new Date()) =>
  WEEKLY_EVENTS[getWeekSeed(date) % WEEKLY_EVENTS.length];

export const getWeeklyEventForMode = (mode: string, date: Date = new Date()) => {
  const event = getCurrentWeeklyEvent(date);
  return event.affectedModes.some((entry) => entry.toLowerCase() === mode.toLowerCase()) ? event : null;
};

export const getUpcomingWeeklyEvents = (date: Date = new Date(), count: number = 3) =>
  Array.from({ length: count }, (_, index) => WEEKLY_EVENTS[(getWeekSeed(date) + index + 1) % WEEKLY_EVENTS.length]);
