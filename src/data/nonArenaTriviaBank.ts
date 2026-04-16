import type { GeneratedTrivia } from '@/lib/gemini';

import {
  NON_ARENA_TRIVIA_RECORDS,
  type NonArenaCharacter,
  type NonArenaDifficulty,
  type NonArenaMedium,
  type NonArenaRecord,
} from '@/data/nonArenaTriviaRecords';

type BankQuestion = GeneratedTrivia & {
  id: string;
  difficulty: NonArenaDifficulty;
  medium: NonArenaMedium;
  tags: string[];
};

type TriviaRequest = {
  count?: number;
  difficulty?: string;
  exactDifficulty?: boolean;
  tags?: string[];
  mediums?: NonArenaMedium[];
  seed?: string;
};

const DIFFICULTY_ORDER: NonArenaDifficulty[] = ['facil', 'media', 'dificil', 'extrema', 'divina'];

const DIFFICULTY_LABELS: Record<NonArenaDifficulty, string> = {
  facil: 'Facil',
  media: 'Media',
  dificil: 'Dificil',
  extrema: 'Extrema',
  divina: 'Divina',
};

const BACKGROUNDS: Record<NonArenaMedium, string> = {
  saint: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
  mitologia: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?w=1200&q=80',
  anime: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80',
  manga: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&q=80',
  manhwa: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80',
  manhua: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
  videojuego: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createSeededRandom = (seed: string) => {
  let state = hashString(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 10000) / 10000;
  };
};

const shuffle = <T>(items: T[], seed: string) => {
  const random = createSeededRandom(seed);
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [clone[index], clone[target]] = [clone[target], clone[index]];
  }
  return clone;
};

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

const pickDistractors = (
  sourceRecord: NonArenaRecord,
  values: string[],
  correct: string,
  seed: string,
  fallbackValues: string[] = []
) => {
  const pool = unique([...values, ...fallbackValues]).filter((value) => value !== correct);
  const shuffled = shuffle(pool, seed);
  const options = unique([correct, ...shuffled.slice(0, 3)]);
  if (options.length < 4) {
    return unique([correct, ...shuffle(unique([...values, ...fallbackValues]), `${seed}:fill`)]).slice(0, 4);
  }
  return shuffle(options, `${seed}:${sourceRecord.id}`);
};

const difficultyValue = (difficulty?: string) => {
  const normalized = normalize(difficulty || 'media');
  if (normalized.includes('divin')) return 'divina';
  if (normalized.includes('extrem') || normalized.includes('dios')) return 'extrema';
  if (normalized.includes('dific') || normalized.includes('espectro')) return 'dificil';
  if (normalized.includes('media') || normalized.includes('plata')) return 'media';
  return 'facil';
};

const sameOrLowerDifficulty = (question: BankQuestion, requested: NonArenaDifficulty, exact: boolean) => {
  if (exact) return question.difficulty === requested;
  return DIFFICULTY_ORDER.indexOf(question.difficulty) <= DIFFICULTY_ORDER.indexOf(requested);
};

const universeTemplates = {
  forward: [
    (record: NonArenaRecord, label: string) => `En ${record.title}, ¿quien ocupa el rol de ${label}?`,
    (record: NonArenaRecord, label: string) => `¿Que opcion describe el ${label} principal de ${record.title}?`,
    (record: NonArenaRecord, label: string) => `Dentro de ${record.title}, identifica el ${label} correcto.`,
    (record: NonArenaRecord, label: string) => `¿Cual es el ${label} asociado a ${record.title}?`,
    (record: NonArenaRecord, label: string) => `Selecciona el ${label} correcto para ${record.title}.`,
  ],
  reverse: [
    (_record: NonArenaRecord, value: string, label: string) => `¿En que obra aparece "${value}" como ${label}?`,
    (_record: NonArenaRecord, value: string, label: string) => `¿"${value}" pertenece a cual titulo como ${label}?`,
    (_record: NonArenaRecord, value: string, label: string) => `Identifica la obra donde "${value}" cumple el papel de ${label}.`,
    (_record: NonArenaRecord, value: string, label: string) => `¿A que franquicia corresponde "${value}" dentro del ${label}?`,
    (_record: NonArenaRecord, value: string, label: string) => `Selecciona el titulo que usa "${value}" como ${label}.`,
  ],
};

const characterTemplates = {
  forward: [
    (record: NonArenaRecord, character: NonArenaCharacter, label: string) => `En ${record.title}, ¿cual es el ${label} de ${character.name}?`,
    (record: NonArenaRecord, character: NonArenaCharacter, label: string) => `¿Que opcion identifica el ${label} de ${character.name} en ${record.title}?`,
    (record: NonArenaRecord, character: NonArenaCharacter, label: string) => `Dentro de ${record.title}, selecciona el ${label} correcto de ${character.name}.`,
    (record: NonArenaRecord, character: NonArenaCharacter, label: string) => `¿Con que ${label} se relaciona ${character.name} en ${record.title}?`,
    (record: NonArenaRecord, character: NonArenaCharacter, label: string) => `Elige el ${label} exacto de ${character.name} en ${record.title}.`,
  ],
  reverse: [
    (record: NonArenaRecord, value: string, label: string) => `En ${record.title}, ¿que personaje se asocia con "${value}" como ${label}?`,
    (record: NonArenaRecord, value: string, label: string) => `¿Quien posee "${value}" dentro del ${label} de ${record.title}?`,
    (record: NonArenaRecord, value: string, label: string) => `Selecciona al personaje de ${record.title} cuyo ${label} es "${value}".`,
    (record: NonArenaRecord, value: string, label: string) => `¿A que personaje de ${record.title} pertenece "${value}" como ${label}?`,
    (record: NonArenaRecord, value: string, label: string) => `Identifica al personaje cuyo ${label} es "${value}" en ${record.title}.`,
  ],
};

const UNIVERSE_FACTS: Array<{ key: keyof NonArenaRecord; label: string }> = [
  { key: 'hero', label: 'protagonista' },
  { key: 'rival', label: 'rival' },
  { key: 'ally', label: 'aliado' },
  { key: 'organization', label: 'faccion principal' },
  { key: 'location', label: 'escenario central' },
  { key: 'artifact', label: 'artefacto clave' },
  { key: 'power', label: 'poder dominante' },
  { key: 'mentor', label: 'mentor' },
  { key: 'antagonist', label: 'antagonista' },
  { key: 'theme', label: 'tema central' },
  { key: 'genre', label: 'genero' },
];

const CHARACTER_FACTS: Array<{ key: keyof NonArenaCharacter; label: string }> = [
  { key: 'role', label: 'rol' },
  { key: 'ability', label: 'habilidad' },
  { key: 'affiliation', label: 'afiliacion' },
];

const allUniverseValues = (key: keyof NonArenaRecord) =>
  NON_ARENA_TRIVIA_RECORDS.map((record) => String(record[key])).filter(Boolean);

const allCharacterValues = (key: keyof NonArenaCharacter) =>
  NON_ARENA_TRIVIA_RECORDS.flatMap((record) => record.characters.map((character) => character[key])).filter(Boolean);

const buildQuestion = (params: {
  id: string;
  q: string;
  correct: string;
  values: string[];
  fallbackValues?: string[];
  record: NonArenaRecord;
}) => {
  const options = pickDistractors(params.record, params.values, params.correct, params.id, params.fallbackValues);
  const answer = options.findIndex((option) => option === params.correct);
  return {
    id: params.id,
    q: params.q,
    options,
    answer,
    bgImage: BACKGROUNDS[params.record.medium],
    category: `${params.record.medium}:${params.record.difficulty}`,
    source: 'local' as const,
    difficulty: params.record.difficulty,
    medium: params.record.medium,
    tags: params.record.tags,
  } satisfies BankQuestion;
};

const buildUniverseQuestions = (record: NonArenaRecord) => {
  const questions: BankQuestion[] = [];

  UNIVERSE_FACTS.forEach(({ key, label }) => {
    const correct = String(record[key]);
    const universeValues = allUniverseValues(key);

    universeTemplates.forward.forEach((template, index) => {
      questions.push(
        buildQuestion({
          id: `${record.id}:${String(key)}:forward:${index}`,
          q: template(record, label),
          correct,
          values: universeValues,
          record,
        })
      );
    });

    universeTemplates.reverse.forEach((template, index) => {
      questions.push(
        buildQuestion({
          id: `${record.id}:${String(key)}:reverse:${index}`,
          q: template(record, correct, label),
          correct: record.title,
          values: NON_ARENA_TRIVIA_RECORDS.map((entry) => entry.title),
          record,
        })
      );
    });
  });

  return questions;
};

const buildCharacterQuestions = (record: NonArenaRecord) => {
  const questions: BankQuestion[] = [];
  const sameRecordNames = record.characters.map((character) => character.name);

  record.characters.forEach((character, characterIndex) => {
    CHARACTER_FACTS.forEach(({ key, label }) => {
      const correct = String(character[key]);
      const values = allCharacterValues(key);

      characterTemplates.forward.forEach((template, index) => {
        questions.push(
          buildQuestion({
            id: `${record.id}:character:${characterIndex}:${String(key)}:forward:${index}`,
            q: template(record, character, label),
            correct,
            values,
            record,
          })
        );
      });

      characterTemplates.reverse.forEach((template, index) => {
        questions.push(
          buildQuestion({
            id: `${record.id}:character:${characterIndex}:${String(key)}:reverse:${index}`,
            q: template(record, correct, label),
            correct: character.name,
            values: sameRecordNames,
            fallbackValues: NON_ARENA_TRIVIA_RECORDS.flatMap((entry) => entry.characters.map((candidate) => candidate.name)),
            record,
          })
        );
      });
    });
  });

  return questions;
};

const NON_ARENA_BANK: BankQuestion[] = NON_ARENA_TRIVIA_RECORDS.flatMap((record) => [
  ...buildUniverseQuestions(record),
  ...buildCharacterQuestions(record),
]);

const CAMPAIGN_TAGS: Record<string, string[]> = {
  'descenso:1': ['descenso', 'basico', 'olympo'],
  'descenso:2': ['descenso', 'rivers', 'underworld'],
  'descenso:3': ['descenso', 'judges', 'underworld'],
  'descenso:4': ['descenso', 'punishments', 'tartaro'],
  'descenso:5': ['descenso', 'primordials', 'cosmos'],
  'descenso:6': ['descenso', 'heroes', 'epica'],
  'descenso:7': ['descenso', 'hades', 'persephone'],
  'titanes:1': ['titanes', 'titans', 'otris'],
  'titanes:2': ['titanes', 'pre-olympian', 'genealogia'],
  'titanes:3': ['titanes', 'weapons', 'forge'],
  'titanes:4': ['titanes', 'genealogy', 'lineage'],
  'titanes:5': ['titanes', 'monsters', 'boss'],
  'ira:1': ['ira', 'zeus', 'thunder'],
  'ira:2': ['ira', 'poseidon', 'sea'],
  'ira:3': ['descenso', 'hades', 'underworld'],
  'ira:4': ['ira', 'athena', 'strategy'],
  'ira:5': ['ira', 'chaos', 'final'],
};

const LEGEND_TAGS: Record<string, string[]> = {
  lost_canvas: ['saint', 'lost-canvas', 'pegaso'],
  sanctuary: ['saint', 'sanctuary', 'bronce'],
  asgard: ['saint', 'asgard', 'nordico'],
  poseidon: ['saint', 'poseidon', 'marino'],
  hades: ['saint', 'hades', 'inframundo'],
  soul_of_gold: ['saint', 'soul-of-gold', 'dorados'],
};

const pickQuestions = (pool: BankQuestion[], count: number, seed: string) => {
  const selected = shuffle(pool, seed);
  const uniqueQuestions: BankQuestion[] = [];
  const seen = new Set<string>();

  selected.forEach((question) => {
    if (!seen.has(question.q) && uniqueQuestions.length < count) {
      uniqueQuestions.push(question);
      seen.add(question.q);
    }
  });

  if (uniqueQuestions.length >= count) {
    return uniqueQuestions;
  }

  const fallback = shuffle(NON_ARENA_BANK, `${seed}:fallback`);
  fallback.forEach((question) => {
    if (!seen.has(question.q) && uniqueQuestions.length < count) {
      uniqueQuestions.push(question);
      seen.add(question.q);
    }
  });

  return uniqueQuestions.slice(0, count);
};

export const NON_ARENA_TRIVIA_STATS = {
  recordCount: NON_ARENA_TRIVIA_RECORDS.length,
  totalQuestions: NON_ARENA_BANK.length,
  questionsByDifficulty: DIFFICULTY_ORDER.reduce<Record<NonArenaDifficulty, number>>((accumulator, difficulty) => {
    accumulator[difficulty] = NON_ARENA_BANK.filter((question) => question.difficulty === difficulty).length;
    return accumulator;
  }, { facil: 0, media: 0, dificil: 0, extrema: 0, divina: 0 }),
};

export const getNonArenaTriviaPack = ({
  count = 5,
  difficulty = 'media',
  exactDifficulty = false,
  tags = [],
  mediums,
  seed = 'general',
}: TriviaRequest): GeneratedTrivia[] => {
  const requestedDifficulty = difficultyValue(difficulty);
  const normalizedTags = tags.map(normalize);

  let pool = NON_ARENA_BANK.filter((question) => sameOrLowerDifficulty(question, requestedDifficulty, exactDifficulty));

  if (mediums?.length) {
    pool = pool.filter((question) => mediums.includes(question.medium));
  }

  if (normalizedTags.length) {
    const tagged = pool.filter((question) => question.tags.some((tag) => normalizedTags.includes(normalize(tag))));
    if (tagged.length >= count) {
      pool = tagged;
    }
  }

  if (pool.length < count) {
    pool = NON_ARENA_BANK.filter((question) => question.medium !== 'saint' || mediums?.includes('saint') || normalizedTags.some((tag) => question.tags.includes(tag)));
  }

  return pickQuestions(pool, count, `${seed}:${requestedDifficulty}`).map(({ id, difficulty: _difficulty, medium: _medium, tags: _tags, ...question }) => question);
};

export const getCampaignLevelTrivia = (sagaId: string, levelId: number, count: number, difficulty?: string) =>
  getNonArenaTriviaPack({
    count,
    difficulty: difficulty || DIFFICULTY_LABELS[difficultyValue(difficulty)],
    exactDifficulty: true,
    tags: CAMPAIGN_TAGS[`${sagaId}:${levelId}`] || ['descenso', 'myth'],
    mediums: ['mitologia'],
    seed: `campaign:${sagaId}:${levelId}:${Date.now()}`,
  });

export const getLegendChapterTrivia = (
  sagaId: string,
  chapter: number,
  totalChapters: number,
  baseDifficulty: string,
  count: number
) => {
  const baseIndex = DIFFICULTY_ORDER.indexOf(difficultyValue(baseDifficulty));
  const progressStep = totalChapters <= 1 ? 0 : Math.min(2, Math.floor(((chapter - 1) / totalChapters) * 3));
  const scaledDifficulty = DIFFICULTY_ORDER[Math.min(DIFFICULTY_ORDER.length - 1, baseIndex + progressStep)];

  return getNonArenaTriviaPack({
    count,
    difficulty: scaledDifficulty,
    exactDifficulty: false,
    tags: LEGEND_TAGS[sagaId] || ['saint'],
    mediums: ['saint'],
    seed: `legend:${sagaId}:${chapter}:${Date.now()}`,
  });
};

export const getTowerTrivia = (floor: number, count: number) =>
  getNonArenaTriviaPack({
    count,
    difficulty: floor > 20 ? 'divina' : floor > 12 ? 'extrema' : floor > 6 ? 'dificil' : 'media',
    tags: floor % 5 === 0 ? ['boss'] : ['tower'],
    mediums: ['anime', 'manga', 'manhwa', 'manhua', 'videojuego'],
    seed: `tower:${floor}:${Date.now()}`,
  });

export const getLabyrinthTrivia = (room: number, count: number) =>
  getNonArenaTriviaPack({
    count,
    difficulty: room > 15 ? 'extrema' : room > 8 ? 'dificil' : 'media',
    tags: ['labyrinth'],
    mediums: ['anime', 'manga', 'manhwa', 'manhua', 'videojuego', 'mitologia'],
    seed: `labyrinth:${room}:${Date.now()}`,
  });

export const getBossTrivia = (seed: string, count: number) =>
  getNonArenaTriviaPack({
    count,
    difficulty: 'divina',
    tags: ['boss'],
    mediums: ['anime', 'manga', 'manhwa', 'manhua', 'videojuego'],
    seed: `${seed}:${Date.now()}`,
  });

export const getBattleRoyaleTrivia = (round: number, count: number) =>
  getNonArenaTriviaPack({
    count,
    difficulty: round > 8 ? 'extrema' : round > 4 ? 'dificil' : 'media',
    tags: ['royale'],
    mediums: ['anime', 'manhwa', 'videojuego', 'manga'],
    seed: `battle-royale:${round}:${Date.now()}`,
  });

export const getPvPTrivia = (count: number) =>
  getNonArenaTriviaPack({
    count,
    difficulty: 'dificil',
    tags: ['strategy', 'tower', 'royale'],
    mediums: ['anime', 'manga', 'manhwa', 'manhua', 'videojuego'],
    seed: `pvp:${Date.now()}`,
  });
