// EVENTOS TEMPORALES / FLASH EVENTS
// Eventos de 24-48h con recompensas especiales

export interface FlashEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  bonus: {
    type: 'xp' | 'drops' | 'obolos' | 'combo' | 'special';
    multiplier: number;
    description: string;
  };
  active: boolean;
}

export const FLASH_EVENTS: FlashEvent[] = [
  {
    id: 'eclipse_hades',
    name: 'Eclipse de Hades',
    description: 'El inframundo se oscurece. Doble XP en todas las trivias.',
    icon: '🌑',
    color: 'from-purple-900 to-black',
    startDate: '2026-04-13T00:00:00Z',
    endDate: '2026-04-14T23:59:59Z',
    bonus: { type: 'xp', multiplier: 2, description: 'Doble XP' },
    active: false
  },
  {
    id: 'marea_almas',
    name: 'Marea de Almas',
    description: 'Las almas fluyen libremente. Mejores drops en pesca y trivias.',
    icon: '🌊',
    color: 'from-blue-900 to-cyan-900',
    startDate: '2026-04-15T00:00:00Z',
    endDate: '2026-04-16T23:59:59Z',
    bonus: { type: 'drops', multiplier: 1.5, description: '+50% drops' },
    active: false
  },
  {
    id: 'noche_espectros',
    name: 'Noche de los Espectros',
    description: 'Los espectros celebran. Recompensas triples en Battle Royale.',
    icon: '👻',
    color: 'from-green-900 to-emerald-900',
    startDate: '2026-04-17T00:00:00Z',
    endDate: '2026-04-18T23:59:59Z',
    bonus: { type: 'obolos', multiplier: 3, description: 'Triple Óbolos' },
    active: false
  },
  {
    id: 'furia_tartaro',
    name: 'Furia del Tártaro',
    description: 'El Tártaro hierve. Combos más fáciles de mantener.',
    icon: '🔥',
    color: 'from-red-900 to-orange-900',
    startDate: '2026-04-19T00:00:00Z',
    endDate: '2026-04-20T23:59:59Z',
    bonus: { type: 'combo', multiplier: 1.5, description: '+50% combo points' },
    active: false
  },
  {
    id: 'bendicion_jueces',
    name: 'Bendición de los Jueces',
    description: 'Los Jueces son generosos. +100% Óbolos en todas las actividades.',
    icon: '⚖️',
    color: 'from-yellow-900 to-amber-900',
    startDate: '2026-04-21T00:00:00Z',
    endDate: '2026-04-22T23:59:59Z',
    bonus: { type: 'obolos', multiplier: 2, description: 'Doble Óbolos' },
    active: false
  },
  {
    id: 'caos_cosmos',
    name: 'Caos del Cosmos',
    description: 'El cosmos se descontrola. Eventos aleatorios cada 5 minutos.',
    icon: '💫',
    color: 'from-pink-900 to-purple-900',
    startDate: '2026-04-23T00:00:00Z',
    endDate: '2026-04-24T23:59:59Z',
    bonus: { type: 'special', multiplier: 1, description: 'Eventos aleatorios' },
    active: false
  }
];

export function getActiveFlashEvents(): FlashEvent[] {
  const now = new Date();
  return FLASH_EVENTS.filter(event => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return now >= start && now <= end;
  });
}

export function getFlashEventMultiplier(eventId: string): number {
  const event = FLASH_EVENTS.find(e => e.id === eventId);
  return event?.bonus.multiplier || 1;
}

export function getNextFlashEvent(): FlashEvent | null {
  const now = new Date();
  const futureEvents = FLASH_EVENTS
    .filter(e => new Date(e.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  return futureEvents[0] || null;
}
