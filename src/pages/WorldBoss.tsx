import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { arrayUnion, doc, increment, onSnapshot, runTransaction, setDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Flame, Shield, Skull, Swords, Trophy } from 'lucide-react';
import { audio } from '@/lib/audio';
import { WORLD_BESTIARY } from '@/data/bestiary';
import { getWeeklyEventForMode } from '@/data/weeklyEvents';
import { getCombatContext } from '@/lib/combat';
import { GeneratedTrivia, generateInfiniteTrivia } from '@/lib/gemini';
import { Equipment, rollLoot } from '@/lib/rpg';

const BOSS_ID = 'world_boss_typhon';
const MAX_HEALTH = 10000000;
const UNIQUE_TITLE = 'Azote de Typhon';

const INITIAL_BOSS_STATE = {
  name: 'Typhon, el Padre de los Monstruos',
  health: MAX_HEALTH,
  maxHealth: MAX_HEALTH,
  status: 'active',
  lastDefeated: null as number | null,
  lastDefeatedBy: null as string | null,
  contributors: {} as Record<string, number>,
};

const createWorldBossReward = (): Equipment => {
  const loot = rollLoot(true) || rollLoot(true);

  return {
    ...(loot as Equipment),
    rarity: 'divino',
    sockets: Math.max(loot?.sockets || 0, 1),
  };
};

export const WorldBoss: React.FC = () => {
  const { user, profile } = useAuth();
  const { activeSpecter, activeSetBonus, activeSetEffect, bonuses: combatBonuses } = useMemo(
    () => getCombatContext(profile),
    [profile]
  );
  const [bossData, setBossData] = useState<any>(INITIAL_BOSS_STATE);
  const [gameState, setGameState] = useState<'info' | 'playing' | 'result'>('info');
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [damageDealt, setDamageDealt] = useState(0);
  const [isWeekend, setIsWeekend] = useState(false);
  const [correctHits, setCorrectHits] = useState(0);
  const [finalRewards, setFinalRewards] = useState<string[]>([]);
  const weeklyEvent = useMemo(() => getWeeklyEventForMode('World Boss'), []);

  useEffect(() => {
    const day = new Date().getDay();
    setIsWeekend(day === 0 || day === 6);

    const bossRef = doc(db, 'world_boss', BOSS_ID);
    const unsub = onSnapshot(bossRef, (snapshot) => {
      if (snapshot.exists()) {
        setBossData({ ...INITIAL_BOSS_STATE, ...snapshot.data() });
        return;
      }

      void setDoc(bossRef, INITIAL_BOSS_STATE, { merge: true });
    });

    return () => unsub();
  }, []);

  const startFight = async () => {
    if (!isWeekend) {
      toast.error('Typhon solo despierta los fines de semana.');
      return;
    }
    if ((bossData?.health || 0) <= 0) {
      toast.info('Typhon ya ha sido derrotado este fin de semana.');
      return;
    }

    setIsGenerating(true);
    const generated = await generateInfiniteTrivia('Mitologia griega extrema y Saint Seiya', 10);
    if (generated.length > 0) {
      setQuestions(generated);
      setCurrentQ(0);
      setDamageDealt(0);
      setCorrectHits(0);
      setFinalRewards([]);
      setGameState('playing');
      audio.playSFX('click');
    } else {
      toast.error('Error al invocar el desafio.');
    }
    setIsGenerating(false);
  };

  const handleAnswer = async (selectedIndex: number) => {
    const q = questions[currentQ];
    if (!q || !user) return;

    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      audio.playSFX('success');
      const damage = Math.round((1000 + (profile?.level || 1) * 100) * combatBonuses.damageMultiplier * (weeklyEvent?.effect.damageMultiplier || 1));
      setDamageDealt((prev) => prev + damage);
      setCorrectHits((prev) => prev + 1);

      const bossRef = doc(db, 'world_boss', BOSS_ID);
      const result = await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(bossRef);
        const currentBoss = snapshot.exists() ? { ...INITIAL_BOSS_STATE, ...snapshot.data() } : INITIAL_BOSS_STATE;
        const currentHealth = Math.max(0, currentBoss.health || MAX_HEALTH);
        const nextHealth = Math.max(0, currentHealth - damage);
        const contributors = {
          ...(currentBoss.contributors || {}),
          [user.uid]: (currentBoss.contributors?.[user.uid] || 0) + damage,
        };

        transaction.set(
          bossRef,
          {
            ...currentBoss,
            health: nextHealth,
            maxHealth: currentBoss.maxHealth || MAX_HEALTH,
            status: nextHealth <= 0 ? 'defeated' : 'active',
            lastDefeated: nextHealth <= 0 ? Date.now() : currentBoss.lastDefeated || null,
            lastDefeatedBy: nextHealth <= 0 ? user.uid : currentBoss.lastDefeatedBy || null,
            contributors,
          },
          { merge: true }
        );

        return {
          defeatedNow: currentHealth > 0 && nextHealth === 0,
        };
      });

      toast.success(`Impacto. Has infligido ${damage} de dano.`);

      if (result.defeatedNow) {
        const reward = createWorldBossReward();
        const bonusReward = Math.random() < combatBonuses.lootChanceBonus ? createWorldBossReward() : null;
        const obolosReward = combatBonuses.obolosMultiplier > 1 ? Math.floor(500 * combatBonuses.obolosMultiplier) : 0;
        setFinalRewards([reward.name, ...(bonusReward ? [bonusReward.name] : []), ...(obolosReward > 0 ? [`${obolosReward} obolos`] : []), UNIQUE_TITLE]);
        await updateDoc(doc(db, 'users', user.uid), {
          gearInventory: bonusReward ? arrayUnion(reward, bonusReward) : arrayUnion(reward),
          titles: arrayUnion(UNIQUE_TITLE),
          ...(obolosReward > 0 ? { obolos: increment(obolosReward) } : {}),
        });

        toast.success(`Has asestado el golpe final. Recompensa: ${reward.name}${bonusReward ? ` y ${bonusReward.name}` : ''} + titulo unico.`);
      }
    } else {
      audio.playSFX('damage');
      toast.error('Fallo. Typhon te ha repelido.');
    }

    if (currentQ + 1 < questions.length) {
      setCurrentQ((prev) => prev + 1);
      return;
    }

    setGameState('result');
  };

  if (gameState === 'info') {
    const currentHealth = Math.max(0, bossData?.health || 0);
    const healthPercent = Math.max(0, Math.min(100, (currentHealth / MAX_HEALTH) * 100));
    const bestiaryEntry = WORLD_BESTIARY[0];

    return (
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <Skull className="w-16 h-16 text-red-600 mx-auto animate-bounce" />
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-red-600 neon-text-primary uppercase tracking-[0.2em]">
            Jefe de Mundo
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Desafio colectivo</p>
        </div>

        <Card className="glass-panel border-red-500/30 overflow-hidden clip-card relative">
          <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
          <CardHeader className="text-center border-b border-red-500/20 bg-background/40">
            <CardTitle className="font-display text-3xl text-white tracking-widest uppercase">
              {bossData?.name || 'Cargando...'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12 space-y-8 text-center">
            {activeSpecter && (
              <div className="max-w-2xl mx-auto bg-background/50 border border-cyan-500/20 p-4 clip-diagonal text-left space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">Habilidad del Espectro</p>
                <p className="font-display text-lg text-white">{activeSpecter.ability.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{activeSpecter.ability.description}</p>
              </div>
            )}
            {activeSetEffect && (
              <div className="max-w-2xl mx-auto bg-background/50 border border-yellow-500/20 p-4 clip-diagonal text-left space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-400">Bono de Set Activo</p>
                <p className="font-display text-lg text-white">{activeSetEffect.title}</p>
                <p className="text-xs font-mono text-muted-foreground">{activeSetEffect.description}</p>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono text-red-400 uppercase tracking-widest">
                <span>Vida de Typhon</span>
                <span>{currentHealth.toLocaleString()} / {MAX_HEALTH.toLocaleString()} HP</span>
              </div>
              <div className="h-8 bg-background border-2 border-red-500/30 rounded-sm overflow-hidden clip-diagonal relative">
                <div
                  className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-900 shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-all duration-1000"
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              <div className="space-y-2">
                <Swords className="w-8 h-8 text-red-500 mx-auto" />
                <h4 className="text-xs font-mono text-muted-foreground uppercase">Tu dano total</h4>
                <p className="text-2xl font-display text-white">{(bossData?.contributors?.[user?.uid || ''] || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto" />
                <h4 className="text-xs font-mono text-muted-foreground uppercase">Recompensa</h4>
                <p className="text-sm font-sans text-white">Golpe final: equipo divino + titulo unico</p>
              </div>
              <div className="space-y-2">
                <Shield className="w-8 h-8 text-blue-500 mx-auto" />
                <h4 className="text-xs font-mono text-muted-foreground uppercase">Estado</h4>
                <p className={`text-sm font-sans ${isWeekend ? 'text-green-400' : 'text-red-400'}`}>
                  {currentHealth > 0 ? (isWeekend ? 'DESPIERTO' : 'DURMIENDO') : 'DERROTADO'}
                </p>
              </div>
            </div>

            {bestiaryEntry && (
              <div className="max-w-3xl mx-auto border border-red-500/20 bg-background/40 p-4 clip-diagonal text-left space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-red-300">Codex del Cataclismo</p>
                <p className="text-sm text-white/90"><span className="text-cyan-300">Debilidad:</span> {bestiaryEntry.weakness}</p>
                <p className="text-sm text-white/80"><span className="text-yellow-300">Patron:</span> {bestiaryEntry.behavior}</p>
                <p className="text-sm text-white/80"><span className="text-emerald-300">Recompensa:</span> {bestiaryEntry.rewardHint}</p>
              </div>
            )}

            {weeklyEvent && (
              <div className="max-w-3xl mx-auto border border-fuchsia-500/20 bg-background/40 p-4 clip-diagonal text-left space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-fuchsia-300">Evento semanal</p>
                <p className="font-display text-white">{weeklyEvent.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{weeklyEvent.bonuses.join(' | ')}</p>
              </div>
            )}

            <Button
              onClick={startFight}
              disabled={isGenerating || !isWeekend || currentHealth <= 0}
              className="w-full max-w-md bg-red-600 hover:bg-red-500 text-white font-display tracking-widest uppercase py-8 clip-diagonal text-xl"
            >
              {isGenerating ? 'Invocando...' : isWeekend ? 'Atacar a Typhon' : 'Esperar al fin de semana'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = questions[currentQ];
    if (!q) return null;

    return (
      <div className="max-w-3xl mx-auto mt-12 space-y-8">
        <div className="flex justify-between items-center bg-background/80 border border-red-500/50 p-4 clip-diagonal">
          <span className="font-mono text-red-400 uppercase tracking-widest">Combate contra Typhon</span>
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
      <div className="max-w-xl mx-auto mt-20 text-center space-y-8 relative z-10">
        <Flame className="w-24 h-24 text-red-500 mx-auto animate-pulse" />
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">Asalto finalizado</h2>
        <div className="p-8 glass-panel border-red-500/30 clip-card space-y-4 text-left">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2 font-mono">Dano infligido en esta ronda</p>
            <p className="text-5xl font-display font-bold text-red-500 neon-text-primary">{damageDealt.toLocaleString()}</p>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Impactos correctos</span>
            <span className="text-white">{correctHits}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Contribucion acumulada</span>
            <span className="text-cyan-400">{(bossData?.contributors?.[user?.uid || ''] || 0).toLocaleString()}</span>
          </div>
          {finalRewards.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-red-500/10">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Recompensas del golpe final</div>
              {finalRewards.map((reward) => (
                <div key={reward} className="text-sm font-mono text-white">{reward}</div>
              ))}
            </div>
          )}
          {activeSetEffect && (
            <div className="pt-2 border-t border-yellow-500/10">
              <div className="text-xs uppercase tracking-widest text-yellow-400">{activeSetBonus}</div>
              <div className="text-sm text-white">{activeSetEffect.title}</div>
            </div>
          )}
        </div>
        <Button onClick={() => setGameState('info')} className="w-full bg-red-600 hover:bg-red-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver al campamento
        </Button>
      </div>
    );
  }

  return null;
};
