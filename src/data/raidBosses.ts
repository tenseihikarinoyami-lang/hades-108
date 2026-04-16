import type { Element } from '@/lib/rpg';

export interface DailyRaidBoss {
  id: string;
  name: string;
  maxHealth: number;
  element: Element;
  questionTheme: string;
  imageUrl: string;
}

type BossArtSeed = {
  id: string;
  name: string;
  element: Element;
  accent: string;
  accentSoft: string;
  symbol: 'sun' | 'wave' | 'skull' | 'spear' | 'clock' | 'moon' | 'storm';
  questionTheme: string;
  maxHealth: number;
};

const svgToDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const renderBossSymbol = (symbol: BossArtSeed['symbol'], accent: string, accentSoft: string) => {
  switch (symbol) {
    case 'sun':
      return `
        <circle cx="300" cy="188" r="56" fill="${accent}" opacity="0.95" />
        <circle cx="300" cy="188" r="86" fill="none" stroke="${accentSoft}" stroke-width="10" opacity="0.55" />
        <path d="M300 74 V112 M300 264 V302 M186 188 H224 M376 188 H414 M222 110 L248 136 M352 240 L378 266 M222 266 L248 240 M352 136 L378 110" stroke="${accentSoft}" stroke-width="10" stroke-linecap="round" />
      `;
    case 'wave':
      return `
        <path d="M132 212 Q190 150 248 212 T364 212 T468 212" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" />
        <path d="M132 252 Q190 190 248 252 T364 252 T468 252" fill="none" stroke="${accentSoft}" stroke-width="16" stroke-linecap="round" opacity="0.85" />
      `;
    case 'skull':
      return `
        <path d="M300 108 C236 108 188 154 188 216 C188 262 214 296 252 312 V342 H348 V312 C386 296 412 262 412 216 C412 154 364 108 300 108 Z" fill="${accent}" opacity="0.92" />
        <circle cx="260" cy="210" r="18" fill="#0c0216" />
        <circle cx="340" cy="210" r="18" fill="#0c0216" />
        <rect x="272" y="256" width="56" height="18" rx="8" fill="#0c0216" />
      `;
    case 'spear':
      return `
        <path d="M302 92 L346 182 L302 166 L258 182 Z" fill="${accent}" />
        <rect x="292" y="160" width="16" height="170" rx="8" fill="${accentSoft}" />
        <path d="M214 286 L386 286" stroke="${accentSoft}" stroke-width="14" stroke-linecap="round" opacity="0.7" />
      `;
    case 'clock':
      return `
        <circle cx="300" cy="202" r="112" fill="none" stroke="${accent}" stroke-width="16" />
        <circle cx="300" cy="202" r="68" fill="none" stroke="${accentSoft}" stroke-width="10" opacity="0.7" />
        <path d="M300 202 L300 144 M300 202 L350 232" stroke="${accentSoft}" stroke-width="14" stroke-linecap="round" />
      `;
    case 'moon':
      return `
        <circle cx="280" cy="196" r="98" fill="${accent}" opacity="0.9" />
        <circle cx="326" cy="176" r="88" fill="#07020d" />
        <circle cx="388" cy="134" r="12" fill="${accentSoft}" />
        <circle cx="430" cy="176" r="8" fill="${accentSoft}" opacity="0.9" />
        <circle cx="404" cy="228" r="10" fill="${accentSoft}" opacity="0.8" />
      `;
    case 'storm':
      return `
        <path d="M316 88 L248 208 H302 L274 330 L370 190 H314 L344 88 Z" fill="${accent}" />
        <path d="M180 146 L228 190 M390 136 L432 180 M176 276 L230 248 M384 270 L430 242" stroke="${accentSoft}" stroke-width="12" stroke-linecap="round" opacity="0.8" />
      `;
    default:
      return '';
  }
};

const createBossImage = (boss: BossArtSeed) => {
  const initials = boss.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" role="img" aria-label="${boss.name}">
      <defs>
        <linearGradient id="bg-${boss.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#09010f" />
          <stop offset="55%" stop-color="#16041f" />
          <stop offset="100%" stop-color="#030106" />
        </linearGradient>
        <linearGradient id="ring-${boss.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${boss.accent}" />
          <stop offset="100%" stop-color="${boss.accentSoft}" />
        </linearGradient>
      </defs>
      <rect width="600" height="360" rx="36" fill="url(#bg-${boss.id})" />
      <circle cx="300" cy="184" r="146" fill="none" stroke="url(#ring-${boss.id})" stroke-width="6" opacity="0.28" />
      <circle cx="300" cy="184" r="126" fill="none" stroke="${boss.accentSoft}" stroke-width="2" opacity="0.18" />
      ${renderBossSymbol(boss.symbol, boss.accent, boss.accentSoft)}
      <text x="300" y="324" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#f8fbff" letter-spacing="4">${initials}</text>
    </svg>
  `;
  return svgToDataUri(svg);
};

const BOSS_SEEDS: BossArtSeed[] = [
  { id: 'athena-war', name: 'Athena, Estratega Celestial', element: 'Neutral', accent: '#7dd3fc', accentSoft: '#e0f2fe', symbol: 'sun', questionTheme: 'boss:athena anime manga estrategia', maxHealth: 120000 },
  { id: 'poseidon-tide', name: 'Poseidon, Marea Infinita', element: 'Hielo', accent: '#38bdf8', accentSoft: '#67e8f9', symbol: 'wave', questionTheme: 'boss:poseidon anime manga manhwa', maxHealth: 128000 },
  { id: 'hades-night', name: 'Hades, Trono del Eclipse', element: 'Oscuridad', accent: '#a855f7', accentSoft: '#c084fc', symbol: 'skull', questionTheme: 'boss:hades manga manhwa oscuro', maxHealth: 136000 },
  { id: 'ares-crimson', name: 'Ares, Filo Carmesi', element: 'Fuego', accent: '#ef4444', accentSoft: '#fb7185', symbol: 'spear', questionTheme: 'boss:ares anime videojuegos combate', maxHealth: 124000 },
  { id: 'chronos-relic', name: 'Chronos, Reloj del Vacio', element: 'Rayo', accent: '#facc15', accentSoft: '#fde68a', symbol: 'clock', questionTheme: 'boss:chronos videojuegos sci-fi anime', maxHealth: 140000 },
  { id: 'nyx-veil', name: 'Nyx, Velo Primordial', element: 'Oscuridad', accent: '#818cf8', accentSoft: '#c4b5fd', symbol: 'moon', questionTheme: 'boss:nyx manga manhua misterio', maxHealth: 132000 },
  { id: 'typhon-storm', name: 'Typhon, Cataclismo Final', element: 'Fuego', accent: '#f97316', accentSoft: '#fdba74', symbol: 'storm', questionTheme: 'boss:typhon anime manga manhua manhwa videojuegos', maxHealth: 150000 },
];

export const DAILY_BOSS_POOL: DailyRaidBoss[] = BOSS_SEEDS.map((boss) => ({
  id: boss.id,
  name: boss.name,
  maxHealth: boss.maxHealth,
  element: boss.element,
  questionTheme: boss.questionTheme,
  imageUrl: createBossImage(boss),
}));

export const getDailyRaidBoss = (referenceDate: Date = new Date()) => {
  const seed = `${referenceDate.getUTCFullYear()}-${referenceDate.getUTCMonth() + 1}-${referenceDate.getUTCDate()}`;
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DAILY_BOSS_POOL[hash % DAILY_BOSS_POOL.length];
};
