import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skull, Swords, Trophy, Zap, Shield, Flame } from 'lucide-react';
import { audio } from '@/lib/audio';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { rollLoot, RARITY_COLORS } from '@/lib/rpg';

const BOSS_ID = 'world_boss_typhon';
const MAX_HEALTH = 10000000; // 10 Million HP

export const WorldBoss: React.FC = () => {
  const { user, profile } = useAuth();
  const [bossData, setBossData] = useState<any>(null);
  const [gameState, setGameState] = useState<'info' | 'playing' | 'result'>('info');
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [damageDealt, setDamageDealt] = useState(0);
  const [isWeekend, setIsWeekend] = useState(false);

  useEffect(() => {
    const day = new Date().getDay();
    setIsWeekend(day === 0 || day === 6);

    const unsub = onSnapshot(doc(db, 'world_boss', BOSS_ID), (snapshot) => {
      if (snapshot.exists()) {
        setBossData(snapshot.data());
      } else {
        // Initialize boss if not exists
        setDoc(doc(db, 'world_boss', BOSS_ID), {
          name: 'Typhón, el Padre de los Monstruos',
          health: MAX_HEALTH,
          maxHealth: MAX_HEALTH,
          status: 'active',
          lastDefeated: null,
          contributors: {}
        });
      }
    });

    return () => unsub();
  }, []);

  const startFight = async () => {
    if (!isWeekend) {
      toast.error("Typhón solo despierta los fines de semana.");
      return;
    }
    if (bossData?.health <= 0) {
      toast.info("Typhón ya ha sido derrotado este fin de semana.");
      return;
    }

    setIsGenerating(true);
    const generated = await generateInfiniteTrivia('Mitología Griega Extrema y Saint Seiya', 10);
    if (generated.length > 0) {
      setQuestions(generated);
      setCurrentQ(0);
      setDamageDealt(0);
      setGameState('playing');
      audio.playSFX('click');
    } else {
      toast.error("Error al invocar el desafío.");
    }
    setIsGenerating(false);
  };

  const handleAnswer = async (selectedIndex: number) => {
    const q = questions[currentQ];
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      audio.playSFX('success');
      const damage = 1000 + (profile?.level || 1) * 100;
      setDamageDealt(prev => prev + damage);
      toast.success(`¡Impacto! Has infligido ${damage} de daño.`);
      
      // Update global health
      const bossRef = doc(db, 'world_boss', BOSS_ID);
      await updateDoc(bossRef, {
        health: increment(-damage),
        [`contributors.${user?.uid}`]: increment(damage)
      });
    } else {
      audio.playSFX('damage');
      toast.error("¡Fallo! Typhón te ha repelido.");
    }

    if (currentQ + 1 < questions.length) {
      setCurrentQ(prev => prev + 1);
    } else {
      setGameState('result');
    }
  };

  if (gameState === 'info') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <Skull className="w-16 h-16 text-red-600 mx-auto animate-bounce" />
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-red-600 neon-text-primary uppercase tracking-[0.2em]">
            Jefe de Mundo
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Desafío Colectivo</p>
        </div>

        <Card className="glass-panel border-red-500/30 overflow-hidden clip-card relative">
          <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
          <CardHeader className="text-center border-b border-red-500/20 bg-background/40">
            <CardTitle className="font-display text-3xl text-white tracking-widest uppercase">
              {bossData?.name || 'Cargando...'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12 space-y-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono text-red-400 uppercase tracking-widest">
                <span>Vida de Typhón</span>
                <span>{bossData?.health?.toLocaleString()} / {MAX_HEALTH.toLocaleString()} HP</span>
              </div>
              <div className="h-8 bg-background border-2 border-red-500/30 rounded-sm overflow-hidden clip-diagonal relative">
                <div 
                  className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-900 shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-all duration-1000"
                  style={{ width: `${(bossData?.health / MAX_HEALTH) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              <div className="space-y-2">
                <Swords className="w-8 h-8 text-red-500 mx-auto" />
                <h4 className="text-xs font-mono text-muted-foreground uppercase">Tu Daño Total</h4>
                <p className="text-2xl font-display text-white">{(bossData?.contributors?.[user?.uid || ''] || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto" />
                <h4 className="text-xs font-mono text-muted-foreground uppercase">Recompensa</h4>
                <p className="text-sm font-sans text-white">Equipo Divino + Título Único</p>
              </div>
              <div className="space-y-2">
                <Shield className="w-8 h-8 text-blue-500 mx-auto" />
                <h4 className="text-xs font-mono text-muted-foreground uppercase">Estado</h4>
                <p className={`text-sm font-sans ${isWeekend ? 'text-green-400' : 'text-red-400'}`}>
                  {isWeekend ? 'DESPIERTO' : 'DURMIENDO'}
                </p>
              </div>
            </div>

            <Button 
              onClick={startFight}
              disabled={isGenerating || !isWeekend || bossData?.health <= 0}
              className="w-full max-w-md bg-red-600 hover:bg-red-500 text-white font-display tracking-widest uppercase py-8 clip-diagonal text-xl"
            >
              {isGenerating ? 'Invocando...' : isWeekend ? 'Atacar a Typhón' : 'Esperar al Fin de Semana'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = questions[currentQ];
    return (
      <div className="max-w-3xl mx-auto mt-12 space-y-8">
        <div className="flex justify-between items-center bg-background/80 border border-red-500/50 p-4 clip-diagonal">
          <span className="font-mono text-red-400 uppercase tracking-widest">Combate contra Typhón</span>
          <span className="font-mono text-white">Pregunta {currentQ + 1} / 10</span>
        </div>

        <Card className="glass-panel border-red-500/50 p-8 clip-card relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/5 pointer-events-none" />
          <h3 className="text-2xl font-sans font-bold text-white mb-8 text-center relative z-10">{q.q}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {q.options.map((opt, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                className="h-auto py-6 text-lg font-sans tracking-wide border-red-500/30 hover:border-red-500 hover:bg-red-500/20 transition-all clip-diagonal"
                onClick={() => handleAnswer(idx)}
              >
                {opt}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 relative z-10">
        <Flame className="w-24 h-24 text-red-500 mx-auto animate-pulse" />
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">Asalto Finalizado</h2>
        <div className="p-8 glass-panel border-red-500/30 clip-card">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2 font-mono">Daño infligido en esta ronda</p>
          <p className="text-5xl font-display font-bold text-red-500 neon-text-primary">{damageDealt.toLocaleString()}</p>
        </div>
        <Button onClick={() => setGameState('info')} className="w-full bg-red-600 hover:bg-red-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver al Campamento
        </Button>
      </div>
    );
  }

  return null;
};
