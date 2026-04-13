
export type CataclysmType = 'Sangre' | 'Forja' | 'Sombras' | 'Viento' | 'Luz' | 'Vacio' | 'Ninguno';

export interface Cataclysm {
  id: CataclysmType;
  name: string;
  description: string;
  day: number; // 0 (Sunday) to 6 (Saturday)
}

export const CATACLYSMS: Cataclysm[] = [
  {
    id: 'Sangre',
    name: 'Lunes de Sangre',
    description: 'Todos los enemigos hacen el doble de daño, pero la XP y Óbolos se duplican.',
    day: 1
  },
  {
    id: 'Forja',
    name: 'Martes de la Forja',
    description: 'Las mejoras en la Forja de Hefesto cuestan un 50% menos.',
    day: 2
  },
  {
    id: 'Sombras',
    name: 'Miércoles de Sombras',
    description: 'No puedes ver la rareza del equipo hasta que lo equipas.',
    day: 3
  },
  {
    id: 'Viento',
    name: 'Jueves de Viento',
    description: 'El tiempo para responder en la Arena aumenta en 5 segundos.',
    day: 4
  },
  {
    id: 'Luz',
    name: 'Viernes de Luz',
    description: 'Mayor probabilidad de encontrar equipo Divino y Espectro.',
    day: 5
  },
  {
    id: 'Vacio',
    name: 'Fin de Semana del Vacío',
    description: 'Los Dioses Primordiales son más débiles, pero sus recompensas son menores.',
    day: 6 // Saturday
  },
  {
    id: 'Vacio',
    name: 'Fin de Semana del Vacío',
    description: 'Los Dioses Primordiales son más débiles, pero sus recompensas son menores.',
    day: 0 // Sunday
  }
];

export const getCurrentCataclysm = (): Cataclysm | null => {
  const day = new Date().getDay();
  return CATACLYSMS.find(c => c.day === day) || null;
};
