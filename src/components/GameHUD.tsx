import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Flame } from 'lucide-react';
import { getElementIcon, Element } from '@/lib/elements';

interface GameHUDProps {
  // Player
  playerName: string;
  playerPhoto: string;
  playerHealth: number;
  playerMaxHealth?: number;
  hasGarudaShield?: boolean;
  
  // Enemy
  enemyName: string;
  enemyElement: Element;
  enemyHealth: number;
  isBossStage?: boolean;
  
  // Timer
  timeLeft: number;
  totalQuestions: number;
  currentQuestion: number;
  
  // Effects
  isDamaged?: boolean;
  isEnemyDamaged?: boolean;
}

/**
 * Componente HUD reutilizable para juegos tipo trivia.
 * Muestra barras de vida, timer y información del enemigo.
 */
export const GameHUD: React.FC<GameHUDProps> = ({
  playerName,
  playerPhoto,
  playerHealth,
  playerMaxHealth = 100,
  hasGarudaShield = false,
  enemyName,
  enemyElement,
  enemyHealth,
  isBossStage = false,
  timeLeft,
  totalQuestions,
  currentQuestion,
  isDamaged = false,
  isEnemyDamaged = false,
}) => {
  return (
    <div className={`flex items-center justify-between mb-8 bg-background/80 p-4 rounded-sm border clip-diagonal relative z-20 ${
      isBossStage ? 'border-primary/50 shadow-[0_0_20px_rgba(255,0,0,0.2)]' : 'border-accent/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
    }`}>
      {/* Player Avatar */}
      <div className="absolute -left-6 -top-6 z-30">
        <Avatar className="w-16 h-16 border-2 border-accent clip-hex shadow-[0_0_15px_rgba(0,240,255,0.3)] bg-background">
          <AvatarImage src={playerPhoto} className="object-cover" />
          <AvatarFallback className="bg-secondary text-accent font-display text-xl">
            {playerName?.[0] || 'E'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Player Health */}
      <div className="flex-1 space-y-2 pl-12">
        <div className="flex justify-between text-xs font-mono font-bold tracking-widest text-accent">
          <span>{playerName?.toUpperCase() || 'ESPECTRO'}</span>
          <span className="flex items-center gap-2">
            {hasGarudaShield && <Shield className="w-3 h-3 text-orange-400" title="Escudo de Garuda" />}
            <span className={playerHealth <= 25 ? 'text-primary animate-pulse' : ''}>
              {Math.max(0, Math.round((playerHealth / playerMaxHealth) * 100))}%
            </span>
          </span>
        </div>
        <div className="h-4 bg-background border border-accent/50 rounded-sm overflow-hidden clip-diagonal relative">
          {isDamaged && <div className="absolute inset-0 bg-primary/50 z-10" />}
          <motion.div
            className={`h-full ${playerHealth <= 25 ? 'bg-primary' : 'bg-accent'} shadow-[0_0_10px_currentColor]`}
            initial={{ width: '100%' }}
            animate={{ width: `${(playerHealth / playerMaxHealth) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Timer */}
      <div className="mx-8 flex flex-col items-center justify-center relative">
        <div className={`absolute inset-0 border-2 clip-hex opacity-50 ${
          timeLeft <= 5 ? 'border-primary animate-ping' : 'border-accent'
        }`} />
        <div className={`text-4xl font-display font-bold w-16 h-16 flex items-center justify-center clip-hex bg-background/80 ${
          timeLeft <= 5 ? 'text-primary neon-text-primary' : 'text-white'
        }`}>
          {timeLeft}
        </div>
      </div>

      {/* Enemy Health */}
      <div className="flex-1 space-y-2">
        <div className="flex justify-between text-xs font-mono font-bold tracking-widest text-primary">
          <span className="flex items-center gap-2">
            {enemyName}
            <span title={`Elemento Enemigo: ${enemyElement}`}>
              {getElementIcon(enemyElement)}
            </span>
          </span>
          <span>{Math.ceil(enemyHealth)}%</span>
        </div>
        <div className="h-4 bg-background border border-primary/50 rounded-sm overflow-hidden clip-diagonal relative">
          {isEnemyDamaged && <div className="absolute inset-0 bg-accent/50 z-10" />}
          <motion.div
            className="h-full bg-primary shadow-[0_0_10px_currentColor]"
            initial={{ width: '100%' }}
            animate={{ width: `${enemyHealth}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};
