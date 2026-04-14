import { Flame, Snowflake, Zap, Moon, Circle } from 'lucide-react';

export type Element = 'Fuego' | 'Hielo' | 'Rayo' | 'Oscuridad' | 'Neutral';

/**
 * Retorna el ícono correspondiente para un elemento.
 * Componente reutilizable para evitar duplicación.
 */
export const getElementIcon = (element: Element) => {
  switch (element) {
    case 'Fuego': return <Flame className="w-4 h-4 text-red-500" />;
    case 'Hielo': return <Snowflake className="w-4 h-4 text-blue-300" />;
    case 'Rayo': return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'Oscuridad': return <Moon className="w-4 h-4 text-purple-600" />;
    default: return <Circle className="w-4 h-4 text-slate-400" />;
  }
};

/**
 * Retorna el multiplicador de daño basado en elementos.
 * Sistema de ventajas tipo piedra-papel-tijera.
 */
export const getElementMultiplier = (attackerElement: Element, defenderElement: Element): number => {
  const matchups: Record<Element, Partial<Record<Element, number>>> = {
    'Fuego': { 'Hielo': 1.5, 'Rayo': 0.75 },
    'Hielo': { 'Oscuridad': 1.5, 'Fuego': 0.75 },
    'Rayo': { 'Fuego': 1.5, 'Oscuridad': 0.75 },
    'Oscuridad': { 'Rayo': 1.5, 'Hielo': 0.75 },
    'Neutral': {}
  };

  return matchups[attackerElement]?.[defenderElement] || 1.0;
};
