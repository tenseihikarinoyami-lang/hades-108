import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, Zap, Skull, Flame, Trophy, Swords, Target } from 'lucide-react';
import { audio } from '@/lib/audio';
import { RAID_BESTIARY } from '@/data/bestiary';
import { getWeeklyEventForMode } from '@/data/weeklyEvents';
import { getCombatContext } from '@/lib/combat';
import { getDailyRaidBoss } from '@/data/raidBosses';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { calculateSetBonus, Element, getElementMultiplier, getSetBonusEffect } from '@/lib/rpg';

interface RaidBoss {
  id: string;
  name: string;
  maxHealth: number;
  currentHealth: number;
  element: Element;
  imageUrl: string;
  active: boolean;
  factionDamage: {
    Wyvern: number;
    Griffon: number;
    Garuda: number;
  };
}

export const Raids: React.FC = () => {
  const { user, profile } = useAuth();
  const { activeSpecter, activeSetBonus, activeSetEffect, bonuses: combatBonuses } = useMemo(
    () => getCombatContext(profile),
    [profile]
  );
  const [boss, setBoss] = useState<RaidBoss | null>(null);
  const [gameState, setGameState] = useState<'lobby' | 'playing'>('lobby');
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [damageDealt, setDamageDealt] = useState(0);
  const weeklyEvent = useMemo(() => getWeeklyEventForMode('Raids'), []);

  useEffect(() => {
    const bossRef = doc(db, 'game_state', 'current_raid');
    
    const unsubscribe = onSnapshot(bossRef, (docSnap) => {
      const dailyBoss = getDailyRaidBoss();
      if (docSnap.exists()) {
        const liveBoss = docSnap.data() as RaidBoss;
        if (liveBoss.id !== dailyBoss.id) {
          const rotatedBoss: RaidBoss = {
            id: dailyBoss.id,
            name: dailyBoss.name,
            maxHealth: dailyBoss.maxHealth,
            currentHealth: dailyBoss.maxHealth,
            element: dailyBoss.element,
            imageUrl: dailyBoss.imageUrl,
            active: true,
            factionDamage: { Wyvern: 0, Griffon: 0, Garuda: 0 }
          };
          void setDoc(bossRef, rotatedBoss);
          setBoss(rotatedBoss);
          return;
        }

        setBoss({
          ...liveBoss,
          name: dailyBoss.name,
          element: dailyBoss.element,
          imageUrl: dailyBoss.imageUrl,
          maxHealth: dailyBoss.maxHealth,
        });
      } else {
        // Initialize the boss of the day if none exists
        const initialBoss: RaidBoss = {
          id: dailyBoss.id,
          name: dailyBoss.name,
          maxHealth: dailyBoss.maxHealth,
          currentHealth: dailyBoss.maxHealth,
          element: dailyBoss.element,
          imageUrl: dailyBoss.imageUrl,
          active: true,
          factionDamage: { Wyvern: 0, Griffon: 0, Garuda: 0 }
        };
        setDoc(bossRef, initialBoss);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStartRaid = async () => {
    if (!profile?.faction) {
      toast.error("Debes pertenecer a una facción para participar en la Incursión.");
      return;
    }
    
    setIsGenerating(true);
    const generated = await generateInfiniteTrivia(boss ? `boss:${boss.id}:${boss.name}` : 'boss:daily-raid', 3, 'Dios');
    if (generated.length > 0) {
      setQuestions(generated);
      setCurrentQ(0);
      setDamageDealt(0);
      setGameState('playing');
      audio.playSFX('click');
    } else {
      toast.error("Error al conectar con el Santuario.");
    }
    setIsGenerating(false);
  };

  const handleAnswer = async (selectedIndex: number) => {
    const q = questions[currentQ];
    const isCorrect = selectedIndex === q.answer;
    
    if (isCorrect) {
      audio.playSFX('success');
      
      let damage = 500; // Base raid damage
      const playerWeaponElement = profile?.equippedGear?.weapon?.element || 'Neutral';
      const multiplier = getElementMultiplier(playerWeaponElement, boss?.element || 'Neutral');
      const finalDamageMultiplier = combatBonuses.damageMultiplier * (weeklyEvent?.effect.damageMultiplier || 1);
      
      if (profile?.equippedGear?.weapon?.stats?.damage) {
        damage += profile.equippedGear.weapon.stats.damage * 10;
      }
      
      damage = Math.floor(damage * multiplier * finalDamageMultiplier);
      setDamageDealt(prev => prev + damage);
      
      toast.success(`¡Impacto! ${damage} de daño al Jefe.`);
    } else {
      audio.playSFX('damage');
      toast.error("Ataque fallido. El Jefe contraataca.");
    }
    
    if (currentQ + 1 < questions.length) {
      setTimeout(() => setCurrentQ(prev => prev + 1), 1500);
    } else {
      setTimeout(() => finishRaidAttempt(), 1500);
    }
  };

  const finishRaidAttempt = async () => {
    if (user && profile?.faction && boss && boss.active) {
      const bossRef = doc(db, 'game_state', 'current_raid');
      
      try {
        await updateDoc(bossRef, {
          currentHealth: Math.max(0, boss.currentHealth - damageDealt),
          [`factionDamage.${profile.faction}`]: increment(damageDealt)
        });
        
        toast.success(`Incursión terminada. Daño total: ${damageDealt}`);
        
        // Reward some obolos based on damage
        const obolosEarned = Math.floor((damageDealt / 100) * combatBonuses.obolosMultiplier);
        if (obolosEarned > 0) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            obolos: increment(obolosEarned)
          });
          toast.success(`+${obolosEarned} Óbolos obtenidos por tu contribución.`);
        }
        
      } catch (error) {
        console.error("Error updating raid boss", error);
      }
    }
    setGameState('lobby');
  };

  if (gameState === 'lobby') {
    const bestiaryEntry = RAID_BESTIARY.find((entry) => entry.id === boss?.id);
    return (
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-500 neon-text-accent uppercase tracking-[0.2em]">
            Incursiones de Facción
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Jefes Mundiales</p>
        </div>

        {boss && boss.active ? (
          <Card className="glass-panel border-red-500/30 clip-card overflow-hidden">
            <div 
              className="h-64 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${boss.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-display font-bold text-white uppercase tracking-widest drop-shadow-lg">{boss.name}</h2>
                <div className="flex items-center gap-2 text-sm font-mono text-red-400 mt-2">
                  <Flame className="w-4 h-4" /> Elemento: {boss.element}
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold tracking-widest text-red-500">
                  <span>HP DEL JEFE</span>
                  <span>{Math.floor((boss.currentHealth / boss.maxHealth) * 100)}% ({boss.currentHealth} / {boss.maxHealth})</span>
                </div>
                <div className="h-6 bg-background border border-red-500/50 rounded-sm overflow-hidden clip-diagonal relative">
                  <motion.div 
                    className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(boss.currentHealth / boss.maxHealth) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {activeSpecter && (
                <div className="bg-background/50 border border-cyan-500/20 p-4 clip-diagonal text-left space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">Habilidad del Espectro</p>
                  <p className="font-display text-lg text-white">{activeSpecter.ability.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{activeSpecter.ability.description}</p>
                </div>
              )}

              {activeSetEffect && (
                <div className="bg-background/50 border border-yellow-500/20 p-4 clip-diagonal text-left space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-400">Bono de Set Activo</p>
                  <p className="font-display text-lg text-white">{activeSetEffect.title}</p>
                  <p className="text-xs font-mono text-muted-foreground">{activeSetEffect.description}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {(['Wyvern', 'Griffon', 'Garuda'] as const).map(faction => (
                  <div key={faction} className="p-4 border border-accent/20 clip-diagonal text-center bg-background/50">
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">{faction}</div>
                    <div className="text-lg font-bold text-white">{boss.factionDamage[faction]}</div>
                    <div className="text-[10px] text-accent mt-1">Daño Infligido</div>
                  </div>
                ))}
              </div>

              {bestiaryEntry && (
                <div className="border border-red-500/20 bg-background/40 p-4 clip-diagonal text-left space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-red-300">Dossier del Santuario</p>
                  <p className="text-sm text-white/90"><span className="text-cyan-300">Debilidad:</span> {bestiaryEntry.weakness}</p>
                  <p className="text-sm text-white/80"><span className="text-yellow-300">Patron:</span> {bestiaryEntry.behavior}</p>
                  <p className="text-sm text-white/80"><span className="text-emerald-300">Recompensa:</span> {bestiaryEntry.rewardHint}</p>
                </div>
              )}

              {weeklyEvent && (
                <div className="border border-fuchsia-500/20 bg-background/40 p-4 clip-diagonal text-left space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-fuchsia-300">Evento semanal</p>
                  <p className="font-display text-white">{weeklyEvent.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{weeklyEvent.bonuses.join(' | ')}</p>
                </div>
              )}

              <Button 
                onClick={handleStartRaid}
                disabled={isGenerating || boss.currentHealth <= 0}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-display tracking-widest uppercase clip-diagonal py-6 text-lg"
              >
                {isGenerating ? 'Preparando Asalto...' : 'Atacar al Jefe'}
              </Button>
              <p className="text-xs font-mono text-muted-foreground text-center">
                El jefe rota diariamente y usa preguntas exclusivas de anime, manga, manhwa, manhua y videojuegos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-12 glass-panel border-accent/20 clip-card">
            <Shield className="w-16 h-16 text-accent/50 mx-auto mb-4" />
            <h3 className="text-2xl font-display text-white uppercase tracking-widest mb-2">Paz Temporal</h3>
            <p className="text-muted-foreground font-mono">No hay Jefes Mundiales activos en este momento. El Santuario está tranquilo.</p>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'playing' && questions.length > 0) {
    const q = questions[currentQ];
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display text-red-500 uppercase tracking-widest mb-2">Asalto en Progreso</h2>
          <p className="font-mono text-sm text-muted-foreground">Daño Acumulado: <span className="text-white font-bold">{damageDealt}</span></p>
        </div>
        
        <Card className="glass-panel border-red-500/50 clip-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
          <h3 className="text-xl font-sans font-bold text-white mb-8 text-center relative z-10">{q.q}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {q.options.map((opt, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                className="h-auto py-4 text-lg font-sans tracking-wide border-red-500/30 hover:border-red-400 hover:bg-red-500/20 transition-all clip-diagonal"
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

  return null;
};
