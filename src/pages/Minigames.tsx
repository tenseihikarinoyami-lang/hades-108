// MINIJUEGOS CASUALES - Juegos del Inframundo
// Dados de Hades, Memoria del Cocytos, Ruleta del Destino

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RefreshCw, Sparkles, Coins, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { audio } from '@/lib/audio';

// ═══════════════════════════════════════════
// DADOS DE HADES - Juego de azar con óbolos
// ═══════════════════════════════════════════
export const DiceGame: React.FC = () => {
  const { user, profile } = useAuth();
  const [dice, setDice] = useState<number[]>([1, 1]);
  const [bet, setBet] = useState(10);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

  const rollDice = async () => {
    if (!user || !profile || (profile.obolos || 0) < bet) {
      toast.error('Óbolos insuficientes');
      return;
    }

    audio.playSFX('click');
    setRolling(true);
    setResult(null);

    // Animación de roll
    const interval = setInterval(() => {
      setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
    }, 100);

    setTimeout(async () => {
      clearInterval(interval);
      const finalDice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
      setDice(finalDice);
      setRolling(false);

      const sum = finalDice[0] + finalDice[1];
      let winnings = 0;

      if (finalDice[0] === finalDice[1]) {
        // Dobles - x5
        winnings = bet * 5;
        setResult(`🎉 ¡DOBLES! +${winnings} Óbolos`);
        toast.success(`¡DOBLES! Ganaste ${winnings} Óbolos`);
      } else if (sum >= 10) {
        // Alto - x2
        winnings = bet * 2;
        setResult(`✅ Suma alta (${sum}) - +${winnings} Óbolos`);
        toast.success(`Ganaste ${winnings} Óbolos`);
      } else {
        setResult(`❌ Suma baja (${sum}) - -${bet} Óbolos`);
        toast.error(`Perdiste ${bet} Óbolos`);
      }

      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { obolos: increment(winnings - bet) });
    }, 1500);
  };

  return (
    <Card className="glass-panel border-accent/30 clip-card">
      <CardHeader className="border-b border-accent/20 bg-background/40">
        <CardTitle className="font-display text-xl text-white tracking-widest uppercase flex items-center gap-2">
          🎲 Dados de Hades
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-center gap-4">
          {dice.map((value, idx) => {
            const Icon = DICE_ICONS[value - 1];
            return (
              <motion.div
                key={idx}
                animate={rolling ? { rotate: 360 } : { rotate: 0 }}
                transition={{ repeat: rolling ? Infinity : 0, duration: 0.3 }}
                className="w-20 h-20 bg-background border-2 border-accent/50 rounded-lg flex items-center justify-center"
              >
                <Icon className="w-12 h-12 text-accent" />
              </motion.div>
            );
          })}
        </div>

        {result && (
          <div className="text-center text-sm font-mono text-white">{result}</div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-muted-foreground">Apuesta:</span>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 bg-background border border-accent/50 rounded px-2 py-1 text-sm text-center"
              min="1"
            />
          </div>
          <Button
            onClick={rollDice}
            disabled={rolling || !user || (profile?.obolos || 0) < bet}
            className="clip-diagonal bg-accent hover:bg-accent/80 text-black"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${rolling ? 'animate-spin' : ''}`} />
            {rolling ? 'Rodando...' : 'Lanzar'}
          </Button>
        </div>

        <div className="text-[10px] text-muted-foreground font-mono space-y-1">
          <div>🎯 Dobles: x5 | Suma ≥10: x2 | Suma &lt;10: Pierdes apuesta</div>
        </div>
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════
// RULETA DEL DESTINO - Spin diario con recompensas
// ═══════════════════════════════════════════
export const DestinyRoulette: React.FC = () => {
  const { user, profile } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const REWARDS = [
    { name: '10 Óbolos', chance: 0.30, reward: { obolos: 10 } },
    { name: '50 Óbolos', chance: 0.25, reward: { obolos: 50 } },
    { name: '100 Óbolos', chance: 0.15, reward: { obolos: 100 } },
    { name: 'Poción de Tiempo', chance: 0.12, reward: { consumables: { time_potion: 1 } } },
    { name: 'Fragmento de Memoria', chance: 0.10, reward: { memoryFragments: 1 } },
    { name: '250 Óbolos', chance: 0.05, reward: { obolos: 250 } },
    { name: '¡PREMIO ÉPICO! 500 Óbolos', chance: 0.02, reward: { obolos: 500 } },
    { name: '¡JACKPOT! 1000 Óbolos + 2 Fragmentos', chance: 0.01, reward: { obolos: 1000, memoryFragments: 2 } },
  ];

  const spinRoulette = async () => {
    if (!user || !profile) return;

    audio.playSFX('click');
    setSpinning(true);
    setResult(null);

    setTimeout(async () => {
      const rand = Math.random();
      let cumulative = 0;
      let selectedReward = REWARDS[0];

      for (const reward of REWARDS) {
        cumulative += reward.chance;
        if (rand <= cumulative) {
          selectedReward = reward;
          break;
        }
      }

      setResult(selectedReward.name);
      setSpinning(false);

      const docRef = doc(db, 'users', user.uid);
      const updates: any = {};
      if (selectedReward.reward.obolos) updates.obolos = increment(selectedReward.reward.obolos);
      if (selectedReward.reward.memoryFragments) updates.memoryFragments = increment(selectedReward.reward.memoryFragments);
      if (selectedReward.reward.consumables) {
        updates.consumables = {
          ...(profile.consumables || { time_potion: 0, clairvoyance_potion: 0, healing_potion: 0 }),
          time_potion: (profile.consumables?.time_potion || 0) + (selectedReward.reward.consumables.time_potion || 0),
          clairvoyance_potion: profile.consumables?.clairvoyance_potion || 0,
          healing_potion: profile.consumables?.healing_potion || 0
        };
      }

      await updateDoc(docRef, updates);
      toast.success(`🎰 ${selectedReward.name}!`);
    }, 2000);
  };

  return (
    <Card className="glass-panel border-accent/30 clip-card">
      <CardHeader className="border-b border-accent/20 bg-background/40">
        <CardTitle className="font-display text-xl text-white tracking-widest uppercase flex items-center gap-2">
          🎰 Ruleta del Destino
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <motion.div
          animate={spinning ? { rotate: 360 } : { rotate: 0 }}
          transition={{ repeat: spinning ? Infinity : 0, duration: 0.5 }}
          className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center border-4 border-accent shadow-[0_0_30px_rgba(168,85,247,0.5)]"
        >
          <Sparkles className="w-16 h-16 text-white" />
        </motion.div>

        {result && (
          <div className="text-center text-lg font-bold text-white font-mono">{result}</div>
        )}

        <Button
          onClick={spinRoulette}
          disabled={spinning}
          className="w-full clip-diagonal bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
        >
          <Zap className={`w-4 h-4 mr-2 ${spinning ? 'animate-pulse' : ''}`} />
          {spinning ? 'Girando...' : '¡Girar Ruleta!'}
        </Button>

        <div className="text-[10px] text-muted-foreground font-mono space-y-1">
          <div>🎁 Premios instantáneos - ¡Sin costo!</div>
          <div>⭐ Jackpot: 1000 Óbolos + 2 Fragmentos (1%)</div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal de Minijuegos
export const Minigames: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10">
      <div className="text-center space-y-4 mb-8">
        <div className="text-6xl">🎮</div>
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Juegos del Inframundo
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">
          Minijuegos casuales para romper la monotonía
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DiceGame />
        <DestinyRoulette />
      </div>
    </div>
  );
};
