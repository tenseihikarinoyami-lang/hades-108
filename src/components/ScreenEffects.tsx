// SCREEN EFFECTS - Efectos de pantalla completa
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Flash de pantalla para golpes críticos
export const ScreenFlash: React.FC<{ show: boolean; color?: string }> = ({ show, color = 'white' }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none z-50"
          style={{ backgroundColor: color }}
        />
      )}
    </AnimatePresence>
  );
};

// Screen shake para impacto
export const ScreenShake: React.FC<{ active: boolean; intensity?: 'low' | 'medium' | 'high' }> = ({ 
  active, 
  intensity = 'medium' 
}) => {
  const intensities = {
    low: { x: [0, -2, 2, -1, 1, 0], duration: 0.2 },
    medium: { x: [0, -5, 5, -3, 3, 0], duration: 0.3 },
    high: { x: [0, -10, 10, -5, 5, 0], duration: 0.5 }
  };

  const config = intensities[intensity];

  return (
    <motion.div
      animate={active ? { x: config.x } : {}}
      transition={active ? { duration: config.duration, ease: 'easeInOut' } : {}}
      className="w-full h-full"
    />
  );
};

// Líneas de velocidad para combos
export const SpeedLines: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"
          style={{
            top: `${Math.random() * 100}%`,
            left: '-100%'
          }}
          animate={{
            x: ['-100%', '200%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            delay: Math.random() * 0.5
          }}
        />
      ))}
    </div>
  );
};

// Aura de personaje animada
export const CharacterAura: React.FC<{ color?: string; size?: number }> = ({ 
  color = '#00f0ff', 
  size = 100 
}) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${color}`,
            boxShadow: `0 0 ${20 + i * 10}px ${color}`
          }}
          animate={{
            scale: [1, 1.2 + i * 0.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

// Contador de combo animado
export const ComboDisplay: React.FC<{ combo: number; maxCombo: number }> = ({ combo, maxCombo }) => {
  if (combo < 3) return null;

  const getColor = () => {
    if (combo >= 15) return '#ff003c';
    if (combo >= 10) return '#ff8c00';
    if (combo >= 5) return '#ffd700';
    return '#00f0ff';
  };

  const getLabel = () => {
    if (combo >= 20) return '¡DIOS!';
    if (combo >= 15) return '¡LEGENDARIO!';
    if (combo >= 10) return '¡ÉPICO!';
    if (combo >= 5) return '¡GENIAL!';
    return '¡COMBO!';
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="text-center">
        <motion.div
          className="text-6xl font-black font-display"
          style={{
            color: getColor(),
            textShadow: `0 0 20px ${getColor()}, 0 0 40px ${getColor()}`
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          x{combo}
        </motion.div>
        <motion.div
          className="text-2xl font-bold uppercase tracking-widest"
          style={{ color: 'white' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {getLabel()}
        </motion.div>
        {maxCombo > 10 && (
          <div className="text-sm text-muted-foreground mt-2">
            Max Combo: x{maxCombo}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Barra de progreso épica para misiones
export const EpicProgressBar: React.FC<{
  current: number;
  target: number;
  label: string;
  color?: string;
}> = ({ current, target, label, color = '#00f0ff' }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-white">{label}</span>
        <span style={{ color: isComplete ? '#00ff00' : color }}>
          {isComplete ? '✓ COMPLETADA' : `${current}/${target}`}
        </span>
      </div>
      <div className="relative h-3 bg-background border rounded-full overflow-hidden" style={{ borderColor: `${color}40` }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 10px ${color}`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {isComplete && (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ backgroundColor: `${color}20` }}
          />
        )}
      </div>
    </div>
  );
};

// Notificación épica estilo RPG
export const RPGNotification: React.FC<{
  show: boolean;
  title: string;
  description: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}> = ({ show, title, description, icon, rarity = 'common' }) => {
  const colors = {
    common: { bg: 'rgba(128,128,128,0.9)', border: '#808080' },
    rare: { bg: 'rgba(0,100,255,0.9)', border: '#0064ff' },
    epic: { bg: 'rgba(150,0,255,0.9)', border: '#9600ff' },
    legendary: { bg: 'rgba(255,150,0,0.9)', border: '#ff9600' }
  };

  const color = colors[rarity];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <div
            className="p-4 rounded-lg border-2 backdrop-blur-sm"
            style={{ backgroundColor: color.bg, borderColor: color.border }}
          >
            <div className="flex items-center gap-3">
              {icon && <span className="text-2xl">{icon}</span>}
              <div>
                <div className="font-bold text-white text-sm uppercase tracking-wider">{title}</div>
                <div className="text-xs text-white/80 mt-1">{description}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
