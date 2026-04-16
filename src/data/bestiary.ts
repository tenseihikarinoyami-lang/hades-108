import type { Element } from '@/lib/rpg';
import { DAILY_BOSS_POOL } from '@/data/raidBosses';

export type BestiaryCategory = 'primordial' | 'raid' | 'world-boss';

export interface BestiaryEntry {
  id: string;
  category: BestiaryCategory;
  name: string;
  title: string;
  element: Element;
  threat: 'alto' | 'extremo' | 'cataclismico';
  weakness: string;
  behavior: string;
  rewardHint: string;
  imageUrl?: string;
}

export const PRIMORDIAL_BESTIARY: BestiaryEntry[] = [
  { id: 'Chronos', category: 'primordial', name: 'Chronos', title: 'Senor del Tiempo Devorador', element: 'Neutral', threat: 'extremo', weakness: 'Tiempo extra, ritmo alto y reliquias de velocidad.', behavior: 'Acelera el reloj y castiga la indecision.', rewardHint: 'Reliquias temporales y botin divino de control.' },
  { id: 'Caos', category: 'primordial', name: 'Caos', title: 'Origen de la Distorsion', element: 'Oscuridad', threat: 'extremo', weakness: 'Daño explosivo y lectura rapida.', behavior: 'Corrompe preguntas y respuestas.', rewardHint: 'Equipo divino enfocado en caos y vacio.' },
  { id: 'Nyx', category: 'primordial', name: 'Nyx', title: 'Madre de la Noche', element: 'Oscuridad', threat: 'extremo', weakness: 'Memoria del tema y barreras.', behavior: 'Borra opciones y comprime el margen de error.', rewardHint: 'Botin de sombras y gemas oscuras.' },
  { id: 'Erebus', category: 'primordial', name: 'Erebus', title: 'Abismo sin Luz', element: 'Oscuridad', threat: 'extremo', weakness: 'Vida adicional y mitigacion constante.', behavior: 'Drena tu salud en cada latido.', rewardHint: 'Armaduras de supervivencia y obolos oscuros.' },
  { id: 'Tartarus', category: 'primordial', name: 'Tartarus', title: 'Carcel Primigenia', element: 'Fuego', threat: 'extremo', weakness: 'Builds de reaccion y tiempo.', behavior: 'Reduce cada turno a un instante letal.', rewardHint: 'Sets agresivos de fuego y castigo.' },
  { id: 'Gaia', category: 'primordial', name: 'Gaia', title: 'Corazon del Mundo', element: 'Neutral', threat: 'alto', weakness: 'Precisión sostenida y control del reloj.', behavior: 'Aprieta la ventana de respuesta.', rewardHint: 'Botin tectonico y reliquias de tierra antigua.' },
  { id: 'Uranus', category: 'primordial', name: 'Uranus', title: 'Firmamento Primordial', element: 'Rayo', threat: 'alto', weakness: 'Tempo, ráfagas de dano y sets celestes.', behavior: 'Convierte el combate en una tormenta rapida.', rewardHint: 'Armas de rayo y emblemas aereos.' },
  { id: 'Pontus', category: 'primordial', name: 'Pontus', title: 'Mar Primigenio', element: 'Hielo', threat: 'alto', weakness: 'Aguante, tiempo extra y contraataque.', behavior: 'Desgasta a quien no mantenga el ritmo.', rewardHint: 'Reliquias abisales y drops marinos.' },
  { id: 'Ourea', category: 'primordial', name: 'Ourea', title: 'Montanas del Origen', element: 'Neutral', threat: 'alto', weakness: 'Claridad mental y builds estables.', behavior: 'Distorsiona el texto y la lectura del campo.', rewardHint: 'Botin pétreo y armaduras de cumbre.' },
  { id: 'Hemera', category: 'primordial', name: 'Hemera', title: 'Luz del Alba', element: 'Fuego', threat: 'alto', weakness: 'Memoria, barreras y respuestas limpias.', behavior: 'Oculta opciones tras un brillo cegador.', rewardHint: 'Artefactos solares y gemas lumínicas.' },
  { id: 'Aether', category: 'primordial', name: 'Aether', title: 'Aliento del Eter', element: 'Rayo', threat: 'alto', weakness: 'Reaccion instantanea y control del tiempo.', behavior: 'Acelera el turno hasta el limite.', rewardHint: 'Equipo etereo y bonos de velocidad.' },
  { id: 'Eros', category: 'primordial', name: 'Eros', title: 'Primer Deseo', element: 'Fuego', threat: 'alto', weakness: 'Daño rápido y lectura agresiva.', behavior: 'Quiebra la forma de las palabras.', rewardHint: 'Botin de critico y precision.' },
  { id: 'Ananke', category: 'primordial', name: 'Ananke', title: 'Nudo del Destino', element: 'Oscuridad', threat: 'extremo', weakness: 'Tiempo, control del pulso y builds disciplinadas.', behavior: 'Acelera el reloj y aplasta la improvisacion.', rewardHint: 'Recompensas del destino y sets de control.' },
  { id: 'Phanes', category: 'primordial', name: 'Phanes', title: 'Primera Luz', element: 'Rayo', threat: 'alto', weakness: 'Temporalidad y precision absoluta.', behavior: 'Descompone la linea temporal del duelo.', rewardHint: 'Artefactos de luz original.' },
  { id: 'Thalassa', category: 'primordial', name: 'Thalassa', title: 'Profundidad Infinita', element: 'Hielo', threat: 'alto', weakness: 'Memoria, tiempo y lectura lateral.', behavior: 'Ahoga opciones y altera el orden mental.', rewardHint: 'Drops oceanicos y obolos profundos.' },
  { id: 'Moros', category: 'primordial', name: 'Moros', title: 'Sino Ineludible', element: 'Oscuridad', threat: 'alto', weakness: 'Barreras y seguridad defensiva.', behavior: 'Cierra caminos y elimina decisiones seguras.', rewardHint: 'Botin de fatalidad y precision.' },
  { id: 'Thanatos', category: 'primordial', name: 'Thanatos', title: 'Muerte Primera', element: 'Oscuridad', threat: 'extremo', weakness: 'Vida adicional y mitigacion por capas.', behavior: 'Te erosiona mientras responde el vacio.', rewardHint: 'Titulos, loot oscuro y gemas letales.' },
  { id: 'Hypnos', category: 'primordial', name: 'Hypnos', title: 'Trono del Sueno', element: 'Hielo', threat: 'alto', weakness: 'Velocidad de lectura y bonus de tiempo.', behavior: 'Reduce el margen de respuesta al minimo.', rewardHint: 'Reliquias oniricas y control mental.' },
  { id: 'Nemesis', category: 'primordial', name: 'Nemesis', title: 'Retribucion Absoluta', element: 'Fuego', threat: 'alto', weakness: 'Sostener vida y responder sin fallo.', behavior: 'Cada error duele mas que el anterior.', rewardHint: 'Sets de castigo y venganzas rituales.' },
  { id: 'Eris', category: 'primordial', name: 'Eris', title: 'Semilla de la Discordia', element: 'Fuego', threat: 'alto', weakness: 'Estabilidad mental y build ofensiva clara.', behavior: 'Dispersa la atencion y sabotea la lectura.', rewardHint: 'Botin de caos, discordia y fuego.' },
];

export const RAID_BESTIARY: BestiaryEntry[] = DAILY_BOSS_POOL.map((boss) => ({
  id: boss.id,
  category: 'raid',
  name: boss.name,
  title: 'Jefe de Incursion Rotativa',
  element: boss.element,
  threat: 'alto',
  weakness: 'Preparar build segun elemento y tema diario.',
  behavior: 'Rota diariamente y exige preguntas exclusivas por santuario.',
  rewardHint: 'Obolos, dano de faccion y botin cooperativo.',
  imageUrl: boss.imageUrl,
}));

export const WORLD_BESTIARY: BestiaryEntry[] = [
  {
    id: 'world_boss_typhon',
    category: 'world-boss',
    name: 'Typhon, el Padre de los Monstruos',
    title: 'Cataclismo del Fin de Semana',
    element: 'Fuego',
    threat: 'cataclismico',
    weakness: 'Coordinar dano alto, precision y golpe final.',
    behavior: 'Despierta solo en fin de semana y acumula contribuciones globales.',
    rewardHint: 'Titulo unico, equipo divino y botin del golpe final.',
  },
];

export const INFERNAL_BESTIARY = [...PRIMORDIAL_BESTIARY, ...RAID_BESTIARY, ...WORLD_BESTIARY];
