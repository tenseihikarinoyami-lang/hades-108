import React from 'react';
import { motion } from 'framer-motion';
import { Equipment, RARITY_COLORS } from '@/lib/rpg';
import { Shield, Swords, Zap, Sparkles } from 'lucide-react';

interface CharacterAvatarProps {
  equippedGear?: {
    weapon?: Equipment | null;
    armor?: Equipment | null;
    artifact?: Equipment | null;
  };
  specterName?: string;
  photoURL?: string;
  className?: string;
}

/**
 * Componente de Avatar de Personaje estilo Diablo
 * Muestra el personaje con el equipo equipado visualmente
 */
export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  equippedGear,
  specterName,
  photoURL,
  className = '',
}) => {
  // Función para obtener el color según rareza
  const getRarityColor = (rarity?: string) => {
    if (!rarity) return 'text-gray-400';
    const colors: Record<string, string> = {
      'Común': 'text-gray-400',
      'Raro': 'text-blue-400',
      'Épico': 'text-purple-400',
      'Legendario': 'text-yellow-400',
      'Mítico': 'text-red-500',
    };
    return colors[rarity] || 'text-gray-400';
  };

  // Función para obtener el brillo según rareza
  const getRarityGlow = (rarity?: string) => {
    if (!rarity) return '';
    const glows: Record<string, string> = {
      'Común': '',
      'Raro': 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
      'Épico': 'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
      'Legendario': 'shadow-[0_0_25px_rgba(250,204,21,0.7)]',
      'Mítico': 'shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse',
    };
    return glows[rarity] || '';
  };

  return (
    <div className={`relative ${className}`}>
      {/* CONTENEDOR PRINCIPAL - Estilo Diablo Character Sheet */}
      <div className="relative w-full aspect-square max-w-md mx-auto">
        
        {/* FONDO - Aura del personaje */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-background/50 to-background rounded-lg" />
        
        {/* SILUETA DEL PERSONAJE */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-48 h-64">
            {/* Base del personaje - silueta */}
            <svg viewBox="0 0 200 300" className="w-full h-full">
              {/* Cabeza */}
              <circle cx="100" cy="40" r="25" className="fill-background stroke-accent stroke-2" />
              {/* Cuerpo */}
              <path d="M 70 65 L 130 65 L 140 180 L 60 180 Z" className="fill-background stroke-accent stroke-2" />
              {/* Brazo izquierdo */}
              <path d="M 70 70 L 30 120 L 40 125 L 75 80 Z" className="fill-background stroke-accent stroke-2" />
              {/* Brazo derecho */}
              <path d="M 130 70 L 170 120 L 160 125 L 125 80 Z" className="fill-background stroke-accent stroke-2" />
              {/* Pierna izquierda */}
              <path d="M 65 180 L 85 180 L 80 260 L 60 260 Z" className="fill-background stroke-accent stroke-2" />
              {/* Pierna derecha */}
              <path d="M 115 180 L 135 180 L 140 260 L 120 260 Z" className="fill-background stroke-accent stroke-2" />
            </svg>

            {/* EQUIPO VISUAL - Arma (mano derecha) */}
            {equippedGear?.weapon && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`absolute top-20 -right-4 ${getRarityGlow(equippedGear.weapon.rarity)}`}
              >
                <div className={`p-2 bg-background/90 border-2 rounded ${RARITY_COLORS[equippedGear.weapon.rarity]?.split(' ')[0] || 'border-gray-500'}`}>
                  <Swords className={`w-8 h-8 ${getRarityColor(equippedGear.weapon.rarity)}`} />
                </div>
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background border border-accent/50 px-2 py-1 rounded text-[9px] opacity-0 hover:opacity-100 transition-opacity">
                  <div className="font-bold">{equippedGear.weapon.name}</div>
                  <div className="text-muted-foreground">{equippedGear.weapon.rarity}</div>
                </div>
              </motion.div>
            )}

            {/* EQUIPO VISUAL - Armadura (pecho) */}
            {equippedGear?.armor && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute top-16 left-1/2 -translate-x-1/2 ${getRarityGlow(equippedGear.armor.rarity)}`}
              >
                <div className={`p-3 bg-background/90 border-2 rounded ${RARITY_COLORS[equippedGear.armor.rarity]?.split(' ')[0] || 'border-gray-500'}`}>
                  <Shield className={`w-10 h-10 ${getRarityColor(equippedGear.armor.rarity)}`} />
                </div>
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background border border-accent/50 px-2 py-1 rounded text-[9px] opacity-0 hover:opacity-100 transition-opacity z-10">
                  <div className="font-bold">{equippedGear.armor.name}</div>
                  <div className="text-muted-foreground">{equippedGear.armor.rarity}</div>
                </div>
              </motion.div>
            )}

            {/* EQUIPO VISUAL - Artefacto (mano izquierda) */}
            {equippedGear?.artifact && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`absolute top-20 -left-4 ${getRarityGlow(equippedGear.artifact.rarity)}`}
              >
                <div className={`p-2 bg-background/90 border-2 rounded ${RARITY_COLORS[equippedGear.artifact.rarity]?.split(' ')[0] || 'border-gray-500'}`}>
                  <Sparkles className={`w-8 h-8 ${getRarityColor(equippedGear.artifact.rarity)}`} />
                </div>
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background border border-accent/50 px-2 py-1 rounded text-[9px] opacity-0 hover:opacity-100 transition-opacity">
                  <div className="font-bold">{equippedGear.artifact.name}</div>
                  <div className="text-muted-foreground">{equippedGear.artifact.rarity}</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* NOMBRE DEL PERSONAJE */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <div className="text-lg font-display font-bold text-accent neon-text-accent uppercase tracking-widest">
            {specterName || 'Espectro'}
          </div>
        </div>

        {/* BORDE DECORATIVO - Estilo Diablo */}
        <div className="absolute inset-0 border-2 border-accent/30 rounded-lg pointer-events-none" />
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent" />
      </div>
    </div>
  );
};
