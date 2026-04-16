import { GoogleGenAI, Type } from '@google/genai';

import { ENCOUNTER_QUESTION_BANK } from '@/data/encounterQuestions';
import { TRIVIA_DATABASE, type TriviaQuestion } from '@/data/trivias';

const apiKey = process.env.GEMINI_API_KEY?.trim();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface GeneratedTrivia {
  q: string;
  options: string[];
  answer: number;
  bgImage?: string;
  category?: string;
  source?: 'gemini' | 'local';
}

type CatalogQuestion = TriviaQuestion & {
  arenaTitle: string;
  arenaDescription: string;
  levelName: string;
};

const DEFAULT_BG = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80';
const DAILY_SEED = new Date().toISOString().slice(0, 10);
const CATEGORY_ALIASES: Record<string, string[]> = {
  anime: ['anime'],
  manga: ['manga'],
  manhwa: ['manhwa'],
  manhua: ['manhua'],
  videojuego: ['videojuego', 'videojuegos', 'juego', 'games', 'gaming', 'lol', 'runaterra'],
};

const SAINT_KEYWORDS = ['saint seiya', 'pegaso', 'hades', 'atenea', 'caballero', 'espectro', 'santuario', 'poseidon', 'asgard', 'lost canvas', 'omega', 'next dimension'];
const MYTH_KEYWORDS = ['mitologia', 'griega', 'primordial', 'olimpo', 'titán', 'titan', 'inframundo', 'zeus', 'hades', 'poseidon', 'atenea', 'aquiles', 'cerbero'];
const GAME_KEYWORDS = ['videojuego', 'videojuegos', 'lol', 'league', 'runaterra', 'final fantasy', 'nier', 'persona', 'zelda', 'elden ring', 'minecraft'];

const CATALOG_POOL: CatalogQuestion[] = TRIVIA_DATABASE.flatMap((level) =>
  level.arenas.flatMap((arena) =>
    arena.questions.map((question) => ({
      ...question,
      arenaTitle: arena.title,
      arenaDescription: arena.description,
      levelName: level.name,
    }))
  )
);

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const hashString = (value: string) => {
  let hash = 1779033703;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return (hash >>> 0) || 1;
};

const createSeededRandom = (seed: string) => {
  let state = hashString(seed);
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleWithRandom = <T>(items: T[], random: () => number) => {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [clone[index], clone[target]] = [clone[target], clone[index]];
  }
  return clone;
};

const pickBackground = (topic: string) => {
  const normalized = normalizeText(topic);
  if (normalized.includes('saint') || normalized.includes('hades') || normalized.includes('primordial')) {
    return 'https://images.unsplash.com/photo-1505672678657-cc7037095e60?w=1200&q=80';
  }
  if (normalized.includes('videojuego') || normalized.includes('game') || normalized.includes('runaterra')) {
    return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80';
  }
  return DEFAULT_BG;
};

const sanitizeQuestion = (question: GeneratedTrivia, fallbackBg: string): GeneratedTrivia | null => {
  if (!question?.q || !Array.isArray(question.options) || question.options.length !== 4) return null;
  if (typeof question.answer !== 'number' || question.answer < 0 || question.answer > 3) return null;

  return {
    q: question.q,
    options: question.options.slice(0, 4),
    answer: question.answer,
    bgImage: question.bgImage || fallbackBg,
    category: question.category,
    source: question.source || 'gemini',
  };
};

const getDifficultyTargets = (topic: string, difficulty: string) => {
  const combined = normalizeText(`${topic} ${difficulty}`);

  if (combined.includes('dios') || combined.includes('extrema') || combined.includes('extremo') || combined.includes('divina')) {
    return ['Dios', 'Espectro'];
  }
  if (combined.includes('espectro') || combined.includes('dificil')) {
    return ['Espectro', 'Dios', 'Caballero de Plata'];
  }
  if (combined.includes('plata') || combined.includes('media')) {
    return ['Caballero de Plata', 'Caballero de Bronce', 'Espectro'];
  }
  if (combined.includes('bronce')) {
    return ['Caballero de Bronce', 'Humano'];
  }
  return ['Humano', 'Caballero de Bronce', 'Caballero de Plata', 'Espectro', 'Dios'];
};

const getGeneralTopicKeywords = (topic: string) => {
  const normalized = normalizeText(topic);
  if (normalized.includes('saint seiya') || normalized.includes('santuario') || normalized.includes('hades') || normalized.includes('descenso')) {
    return SAINT_KEYWORDS;
  }
  if (normalized.includes('mitologia') || normalized.includes('primordial') || normalized.includes('titan') || normalized.includes('olimpo')) {
    return MYTH_KEYWORDS;
  }
  if (normalized.includes('videojuego') || normalized.includes('runaterra') || normalized.includes('league') || normalized.includes('gaming')) {
    return GAME_KEYWORDS;
  }
  return [];
};

const buildQuestionHaystack = (question: CatalogQuestion) =>
  normalizeText(`${question.levelName} ${question.arenaTitle} ${question.arenaDescription} ${question.q} ${question.options.join(' ')}`);

const selectCatalogPool = (topic: string, difficulty: string, requestedCount: number) => {
  const keywords = getGeneralTopicKeywords(topic);
  const difficultyTargets = getDifficultyTargets(topic, difficulty);
  const difficultyPool = CATALOG_POOL.filter((question) => difficultyTargets.includes(question.levelName));

  if (keywords.length === 0) {
    return difficultyPool.length >= requestedCount ? difficultyPool : CATALOG_POOL;
  }

  const filtered = difficultyPool.filter((question) => {
    const haystack = buildQuestionHaystack(question);
    return keywords.some((keyword) => haystack.includes(normalizeText(keyword)));
  });

  if (filtered.length >= requestedCount) return filtered;
  if (difficultyPool.length >= requestedCount) return difficultyPool;
  return CATALOG_POOL;
};

const selectEncounterPool = (topic: string, requestedCount: number) => {
  const normalized = normalizeText(topic);
  const matchedCategories = Object.entries(CATEGORY_ALIASES)
    .filter(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))
    .map(([category]) => category);

  if (matchedCategories.length === 0) return ENCOUNTER_QUESTION_BANK;

  const filtered = ENCOUNTER_QUESTION_BANK.filter((question) => matchedCategories.includes(question.category));
  return filtered.length >= requestedCount ? filtered : ENCOUNTER_QUESTION_BANK;
};

const isBossTopic = (topic: string, difficulty: string) => {
  const combined = normalizeText(`${topic} ${difficulty}`);
  return combined.includes('boss:') || combined.includes('dios') || combined.includes('raid') || combined.includes('typhon') || combined.includes('primordial') || combined.includes('santuario');
};

const remixQuestion = (question: { q: string; options: string[]; answer: number; bgImage?: string; category?: string }, random: () => number): GeneratedTrivia => {
  const indexedOptions = question.options.map((option, index) => ({ option, isCorrect: index === question.answer }));
  const shuffledOptions = shuffleWithRandom(indexedOptions, random);
  return {
    q: question.q,
    options: shuffledOptions.map((entry) => entry.option),
    answer: shuffledOptions.findIndex((entry) => entry.isCorrect),
    bgImage: question.bgImage || DEFAULT_BG,
    category: question.category,
    source: 'local',
  };
};

const buildLocalTrivia = (topic: string, count: number, difficulty: string): GeneratedTrivia[] => {
  const random = createSeededRandom(`${DAILY_SEED}:${topic}:${difficulty}:${count}`);
  const pool: Array<{ q: string; options: string[]; answer: number; bgImage?: string; category?: string }> = isBossTopic(topic, difficulty)
    ? selectEncounterPool(topic, count)
    : selectCatalogPool(topic, difficulty, count);

  const preparedPool = shuffleWithRandom(pool, random).map((question) => remixQuestion(question, random));
  const fallbackBg = pickBackground(topic);

  if (preparedPool.length >= count) {
    return preparedPool.slice(0, count).map((question) => ({ ...question, bgImage: question.bgImage || fallbackBg }));
  }

  const padded: GeneratedTrivia[] = [];
  while (padded.length < count) {
    const next = preparedPool[padded.length % preparedPool.length] || {
      q: 'No se encontraron preguntas suficientes para este desafio.',
      options: ['Reintentar', 'Continuar', 'Esperar', 'Cambiar modo'],
      answer: 0,
      bgImage: fallbackBg,
      source: 'local' as const,
    };
    padded.push({ ...next, bgImage: next.bgImage || fallbackBg });
  }
  return padded;
};

const promptForTopic = (topic: string, count: number, difficulty: string) => {
  const normalized = normalizeText(topic);
  if (isBossTopic(topic, difficulty)) {
    return `Genera ${count} preguntas distintas para jefes e incursiones sobre anime, manga, manhwa, manhua y videojuegos. Dificultad ${difficulty}. Evita repetir preguntas comunes de Saint Seiya y prioriza variedad de franquicias.`;
  }
  if (normalized.includes('saint seiya')) {
    return `Genera ${count} preguntas sobre Saint Seiya y sus sagas. Dificultad ${difficulty}.`;
  }
  return `Genera ${count} preguntas de trivia sobre el tema: ${topic}. Dificultad: ${difficulty}.`;
};

export const generateInfiniteTrivia = async (
  topic: string,
  count: number = 5,
  difficulty: string = 'Media'
): Promise<GeneratedTrivia[]> => {
  const fallbackBg = pickBackground(topic);

  if (!ai) {
    return buildLocalTrivia(topic, count, difficulty);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${promptForTopic(topic, count, difficulty)}
Las preguntas deben ser precisas, con 4 opciones exactas y una sola respuesta correcta.
No uses preguntas duplicadas ni trivias demasiado obvias si se trata de jefes o incursiones.
Responde unicamente en JSON valido.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              q: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              answer: { type: Type.INTEGER },
            },
            required: ['q', 'options', 'answer'],
          },
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      return buildLocalTrivia(topic, count, difficulty);
    }

    const parsed = JSON.parse(jsonStr) as GeneratedTrivia[];
    const sanitized = parsed
      .map((question) => sanitizeQuestion({ ...question, source: 'gemini' }, fallbackBg))
      .filter((question): question is GeneratedTrivia => Boolean(question));

    return sanitized.length >= count ? sanitized.slice(0, count) : buildLocalTrivia(topic, count, difficulty);
  } catch (error) {
    console.warn('Gemini unavailable, using local trivia fallback:', error);
    return buildLocalTrivia(topic, count, difficulty);
  }
};
