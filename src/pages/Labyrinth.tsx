import React, { useEffect, useMemo, useState } from 'react';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { Skull, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getLabyrinthTrivia } from '@/data/nonArenaTriviaBank';
import { audio } from '@/lib/audio';
import { captureError, trackEconomyReward, trackModeRun } from '@/lib/analytics';
import { getCombatContextFor } from '@/lib/combat';
import { getWeeklyEventForMode } from '@/data/weeklyEvents';
import { db } from '@/lib/firebase';
import { type GeneratedTrivia } from '@/lib/gemini';
import { applyRunRelicBonuses, getRelicOffers, type RunRelic } from '@/lib/roguelite';
import { Equipment, rollLoot } from '@/lib/rpg';

type RewardOption = {
  type: 'heal' | 'blessing_time' | 'blessing_score';
  name: string;
  desc: string;
  routeType: 'sanctuary' | 'treasure' | 'ambush' | 'secret';
  routeName: string;
  routeDescription: string;
  relic?: RunRelic | null;
};

type DailyLabyrinthModifier = {
  id: string;
  name: string;
  description: string;
  bonusTime: number;
  trapDamage: number;
  lootBonus: number;
  memoryBonus: number;
  obolosMultiplier: number;
  favoredReward: RewardOption['type'];
};

const LABYRINTH_DAILY_MODIFIERS: DailyLabyrinthModifier[] = [
  {
    id: 'echoes',
    name: 'Ecos de Mnemosine',
    description: 'Mas memoria escondida en las salas y rutas mentales mas claras.',
    bonusTime: 2,
    trapDamage: 0,
    lootBonus: 0,
    memoryBonus: 0.08,
    obolosMultiplier: 1,
    favoredReward: 'blessing_score',
  },
  {
    id: 'bloodmist',
    name: 'Niebla Carmesi',
    description: 'Las trampas pegan mas fuerte, pero el botin raro aparece con mayor frecuencia.',
    bonusTime: 0,
    trapDamage: 10,
    lootBonus: 0.12,
    memoryBonus: 0,
    obolosMultiplier: 1,
    favoredReward: 'heal',
  },
  {
    id: 'golden-path',
    name: 'Ruta del Obolo',
    description: 'Cada respuesta vale mas para la huida final y el santuario favorece la puntuacion.',
    bonusTime: 1,
    trapDamage: 0,
    lootBonus: 0,
    memoryBonus: 0,
    obolosMultiplier: 1.2,
    favoredReward: 'blessing_score',
  },
  {
    id: 'timefracture',
    name: 'Fractura de Chronos',
    description: 'El reloj se estira a tu favor y las bendiciones temporales aparecen con mas frecuencia.',
    bonusTime: 4,
    trapDamage: -5,
    lootBonus: 0,
    memoryBonus: 0,
    obolosMultiplier: 1,
    favoredReward: 'blessing_time',
  },
];

export const Labyrinth: React.FC = () => {
  const { user, profile } = useAuth();
  const [runRelics, setRunRelics] = useState<RunRelic[]>([]);
  const [activeRoute, setActiveRoute] = useState<RewardOption['routeType']>('sanctuary');
  const dailyModifier = useMemo(() => {
    const seed = Number(new Date().toISOString().slice(8, 10));
    return LABYRINTH_DAILY_MODIFIERS[seed % LABYRINTH_DAILY_MODIFIERS.length];
  }, []);

  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'reward' | 'result'>('lobby');
  const [currentRoom, setCurrentRoom] = useState(1);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [tempHealth, setTempHealth] = useState(100);
  const [tempScore, setTempScore] = useState(0);
  const [blessings, setBlessings] = useState<string[]>([]);
  const [rewardOptions, setRewardOptions] = useState<RewardOption[]>([]);
  const [specterBarrierCharges, setSpecterBarrierCharges] = useState(0);
  const [runLoot, setRunLoot] = useState<Equipment[]>([]);
  const [rewardObolos, setRewardObolos] = useState(0);
  const [rewardMemory, setRewardMemory] = useState(0);
  const weeklyEvent = useMemo(() => getWeeklyEventForMode('Laberinto'), []);
  const runRelicBonuses = useMemo(() => applyRunRelicBonuses(runRelics), [runRelics]);
  const { activeSpecter, activeSetBonus, activeSetEffect, awakeningLevel, collectionProgress, bonuses: baseCombatBonuses } = useMemo(
    () => getCombatContextFor(profile, {
      mode: 'labyrinth',
      enemyTags: [activeRoute, `room-${currentRoom}`],
    }),
    [profile, activeRoute, currentRoom]
  );
  const combatBonuses = useMemo(
    () => ({
      damageMultiplier: baseCombatBonuses.damageMultiplier * runRelicBonuses.damageMultiplier,
      bonusHealth: baseCombatBonuses.bonusHealth + runRelicBonuses.bonusHealth,
      bonusTime: baseCombatBonuses.bonusTime + runRelicBonuses.bonusTime,
      lootChanceBonus: baseCombatBonuses.lootChanceBonus + runRelicBonuses.lootChanceBonus,
      memoryDropBonus: baseCombatBonuses.memoryDropBonus + runRelicBonuses.memoryDropBonus,
      dodgeChance: baseCombatBonuses.dodgeChance + runRelicBonuses.dodgeChance,
      startingShields: baseCombatBonuses.startingShields + runRelicBonuses.startingShields,
      comboBonus: baseCombatBonuses.comboBonus + runRelicBonuses.comboBonus,
      obolosMultiplier: baseCombatBonuses.obolosMultiplier * runRelicBonuses.obolosMultiplier * (weeklyEvent?.effect.obolosMultiplier || 1),
    }),
    [baseCombatBonuses, runRelicBonuses, weeklyEvent]
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeOut();
    }

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const getRouteBonuses = (route: RewardOption['routeType']) => {
    switch (route) {
      case 'treasure':
        return { bonusTime: 0, trapReduction: 0, scoreMultiplier: 1, lootBonus: 0.1, memoryBonus: 0, obolosMultiplier: 1.15, healing: 0 };
      case 'ambush':
        return { bonusTime: 0, trapReduction: -5, scoreMultiplier: 1.25, lootBonus: 0.05, memoryBonus: 0, obolosMultiplier: 1, healing: 0 };
      case 'secret':
        return { bonusTime: 1, trapReduction: 0, scoreMultiplier: 1.1, lootBonus: 0.04, memoryBonus: 0.08, obolosMultiplier: 1.05, healing: 0 };
      default:
        return { bonusTime: 2, trapReduction: 10, scoreMultiplier: 1, lootBonus: 0, memoryBonus: 0, obolosMultiplier: 1, healing: 18 };
    }
  };

  const getBaseTime = (activeBlessings: string[] = blessings) =>
    15 +
    (activeBlessings.includes('time') ? 5 : 0) +
    combatBonuses.bonusTime +
    dailyModifier.bonusTime +
    getRouteBonuses(activeRoute).bonusTime;

  const getScoreReward = () =>
    Math.floor(
      (blessings.includes('score') ? 200 : 100) *
      combatBonuses.damageMultiplier *
      runRelicBonuses.scoreMultiplier *
      getRouteBonuses(activeRoute).scoreMultiplier *
      (weeklyEvent?.effect.scoreMultiplier || 1)
    );
  const getTrapDamage = () =>
    Math.max(8, 30 + dailyModifier.trapDamage - runRelicBonuses.trapReduction - getRouteBonuses(activeRoute).trapReduction);

  const absorbHit = () => {
    if (specterBarrierCharges > 0) {
      setSpecterBarrierCharges((current) => Math.max(0, current - 1));
      audio.playSFX('shield');
      toast.info(activeSpecter?.ability.name ? `La habilidad ${activeSpecter.ability.name} te protegió.` : 'Barrera espectral activada.');
      return true;
    }

    if (Math.random() < combatBonuses.dodgeChance) {
      audio.playSFX('success');
      toast.success(activeSpecter?.ability.name ? `${activeSpecter.ability.name}: evasion perfecta.` : 'Evasion exitosa.');
      return true;
    }

    return false;
  };

  const startRun = async () => {
    setIsGenerating(true);
    const generated = getLabyrinthTrivia(1, 5);

    if (generated.length === 0) {
      toast.error('El Laberinto esta cerrado.');
      captureError('labyrinth_generation_failed', 'labyrinth.startRun', {}, user?.uid);
      setIsGenerating(false);
      return;
    }

    setQuestions(generated);
    setCurrentRoom(1);
    setCurrentQ(0);
    setRunLoot([]);
    setRewardObolos(0);
    setRewardMemory(0);
    setTempScore(0);
    setBlessings([]);
    setRewardOptions([]);
    setRunRelics([]);
    setActiveRoute('sanctuary');
    setTimeLeft(15 + baseCombatBonuses.bonusTime + dailyModifier.bonusTime + getRouteBonuses('sanctuary').bonusTime);
    setTempHealth(100 + baseCombatBonuses.bonusHealth);
    setSpecterBarrierCharges(baseCombatBonuses.startingShields);
    setGameState('playing');
    setIsGenerating(false);
    audio.playSFX('click');
  };

  const moveToNextRoom = async (nextHealth: number) => {
    if (nextHealth <= 0) {
      finishGame(false);
      return;
    }

    if (currentRoom % 5 === 0) {
      generateRewards();
      setGameState('reward');
      return;
    }

    if (currentQ + 1 < questions.length) {
      setCurrentQ((question) => question + 1);
      setCurrentRoom((room) => room + 1);
      setTimeLeft(getBaseTime());
      return;
    }

    setIsGenerating(true);
    const generated = getLabyrinthTrivia(currentRoom + 1, 5);
    setQuestions(generated);
    setCurrentQ(0);
    setCurrentRoom((room) => room + 1);
    setTimeLeft(getBaseTime());
    setIsGenerating(false);
  };

  const handleTimeOut = () => {
    if (absorbHit()) {
      moveToNextRoom(tempHealth);
      return;
    }

    audio.playSFX('damage');
    const nextHealth = Math.max(0, tempHealth - getTrapDamage());
    setTempHealth(nextHealth);
    toast.error('Tiempo agotado.');
    moveToNextRoom(nextHealth);
  };

  const handleAnswer = (selectedIndex: number) => {
    const q = questions[currentQ];
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      audio.playSFX('success');
      setTempScore((score) => score + getScoreReward());
      toast.success('Respuesta correcta.');
      moveToNextRoom(tempHealth);
      return;
    }

    if (absorbHit()) {
      moveToNextRoom(tempHealth);
      return;
    }

    audio.playSFX('damage');
    const nextHealth = Math.max(0, tempHealth - getTrapDamage());
    setTempHealth(nextHealth);
    toast.error('Respuesta incorrecta. Trampa activada.');
    moveToNextRoom(nextHealth);
  };

  const generateRewards = () => {
    const relicOffer = getRelicOffers('labyrinth', currentRoom, runRelics.map((relic) => relic.id), activeRoute)[0] || null;
    const routes: Array<Pick<RewardOption, 'routeType' | 'routeName' | 'routeDescription'>> = [
      { routeType: 'sanctuary', routeName: 'Santuario Sellado', routeDescription: 'Menos castigo y curacion inmediata.' },
      { routeType: 'treasure', routeName: 'Camara del Tesoro', routeDescription: 'Mas botin y mas obolos al final del tramo.' },
      { routeType: 'ambush', routeName: 'Nido de Emboscada', routeDescription: 'Mayor riesgo, pero mejor puntuacion.' },
      { routeType: 'secret', routeName: 'Pasaje Oculto', routeDescription: 'Mas memoria y reliquias sutiles.' },
    ];
    const rewardCatalog: RewardOption[] = [
      { type: 'heal', name: 'Pocion Mayor', desc: 'Restaura 50 HP', ...routes[0], relic: null },
      { type: 'blessing_time', name: 'Bendicion de Hermes', desc: '+5s de tiempo base', ...routes[1], relic: relicOffer },
      { type: 'blessing_score', name: 'Bendicion de Midas', desc: 'Doble puntuacion', ...routes[2], relic: null },
      { type: 'blessing_score', name: 'Llave del Vacio', desc: 'Mantiene la puntuacion alta y abre atajos.', ...routes[3], relic: relicOffer },
    ];
    const favored = rewardCatalog.find((reward) => reward.type === dailyModifier.favoredReward)!;
    const others = rewardCatalog.filter((reward) => reward !== favored).slice(0, 2);
    setRewardOptions([favored, ...others]);
  };

  const selectReward = async (reward: RewardOption) => {
    audio.playSFX('success');

    let nextHealth = tempHealth;
    let nextBlessings = blessings;

    if (reward.type === 'heal') {
      nextHealth = Math.min(100 + combatBonuses.bonusHealth, tempHealth + 50 + runRelicBonuses.healingBonus);
      setTempHealth(nextHealth);
    } else if (reward.type === 'blessing_time') {
      nextBlessings = [...blessings, 'time'];
      setBlessings(nextBlessings);
    } else if (reward.type === 'blessing_score') {
      nextBlessings = [...blessings, 'score'];
      setBlessings(nextBlessings);
    }

    setActiveRoute(reward.routeType);
    const routeBonuses = getRouteBonuses(reward.routeType);
    if (routeBonuses.healing > 0) {
      nextHealth = Math.min(100 + combatBonuses.bonusHealth, nextHealth + routeBonuses.healing);
      setTempHealth(nextHealth);
    }
    if (reward.relic) {
      setRunRelics((current) => [...current, reward.relic as RunRelic]);
      if (reward.relic.bonuses.bonusHealth) {
        nextHealth = Math.min(100 + combatBonuses.bonusHealth + reward.relic.bonuses.bonusHealth, nextHealth + reward.relic.bonuses.bonusHealth);
        setTempHealth(nextHealth);
      }
      if (reward.relic.bonuses.startingShields) {
        setSpecterBarrierCharges((current) => current + (reward.relic?.bonuses.startingShields || 0));
      }
      toast.success(`Reliquia hallada: ${reward.relic.name}`);
    }

    if (currentRoom >= 20) {
      finishGame(true);
      return;
    }

    setIsGenerating(true);
    const generated = getLabyrinthTrivia(currentRoom + 1, 5);
    setQuestions(generated);
    setCurrentQ(0);
    setCurrentRoom((room) => room + 1);
    setTimeLeft(getBaseTime(nextBlessings) + (reward.relic?.bonuses.bonusTime || 0));
    setGameState('playing');
    setIsGenerating(false);
  };

  const finishGame = async (won: boolean) => {
    setGameState('result');

    if (!won || !user || !profile) {
      toast.error('Has perecido en el laberinto. Lo pierdes todo.');
      trackModeRun('labyrinth', 'lose', { rooms: currentRoom, relics: runRelics.length, route: activeRoute }, user?.uid);
      return;
    }

    const loot = rollLoot(true);
    if (!loot) {
      toast.success('Has escapado del laberinto.');
      return;
    }

    const routeBonuses = getRouteBonuses(activeRoute);
    const bonusLoot = Math.random() < (combatBonuses.lootChanceBonus + dailyModifier.lootBonus + routeBonuses.lootBonus + (weeklyEvent?.effect.lootChanceBonus || 0)) ? rollLoot(true) : null;
    const memoryReward = Math.random() < (combatBonuses.memoryDropBonus + dailyModifier.memoryBonus + routeBonuses.memoryBonus + (weeklyEvent?.effect.memoryDropBonus || 0)) ? 1 : 0;
    const obolosReward = Math.floor(tempScore * combatBonuses.obolosMultiplier * dailyModifier.obolosMultiplier * routeBonuses.obolosMultiplier);
    const docRef = doc(db, 'users', user.uid);

    setRunLoot([loot, ...(bonusLoot ? [bonusLoot] : [])]);
    setRewardMemory(memoryReward);
    setRewardObolos(obolosReward);

    await updateDoc(docRef, {
      gearInventory: bonusLoot ? arrayUnion(loot, bonusLoot) : arrayUnion(loot),
      obolos: increment(obolosReward),
      ...(memoryReward > 0 ? { memoryFragments: increment(memoryReward) } : {}),
    });

    trackEconomyReward('labyrinth', { obolos: obolosReward, memoryFragments: memoryReward, loot: bonusLoot ? 2 : 1 }, user.uid);
    trackModeRun('labyrinth', 'win', { rooms: currentRoom, relics: runRelics.length, route: activeRoute }, user.uid);

    toast.success(`Has escapado. Recompensa: ${loot.name}${bonusLoot ? ` y ${bonusLoot.name}` : ''}`);
  };

  if (gameState === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 relative z-10 text-center mt-20">
        <Skull className="w-24 h-24 text-red-600 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-red-600 neon-text-accent uppercase tracking-[0.2em]">
          Laberinto del Minotauro
        </h1>
        <p className="text-muted-foreground font-mono max-w-xl mx-auto">
          Entra sin equipo. Sobrevive a 20 habitaciones. Si mueres, pierdes todo el progreso de la incursion. Si escapas, obtendras tesoros inimaginables.
        </p>
        {activeSpecter && (
          <div className="max-w-2xl mx-auto bg-background/50 border border-cyan-500/20 p-4 clip-diagonal text-left space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">Habilidad del Espectro</p>
            <p className="font-display text-lg text-white">{activeSpecter.ability.name}</p>
            <p className="text-xs font-mono text-muted-foreground">{activeSpecter.ability.description}</p>
          </div>
        )}
        <div className="max-w-2xl mx-auto bg-background/50 border border-red-500/20 p-4 clip-diagonal text-left space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-red-400">Modificador Diario</p>
          <p className="font-display text-lg text-white">{dailyModifier.name}</p>
          <p className="text-xs font-mono text-muted-foreground">{dailyModifier.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          <div className="bg-background/50 border border-cyan-500/20 p-4 clip-diagonal space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">Sinergia de Espectro</p>
            <p className="font-display text-white">Despertar {awakeningLevel}/3</p>
            <p className="text-xs font-mono text-muted-foreground">{collectionProgress.completedFamilies.length} familias completadas</p>
          </div>
          <div className="bg-background/50 border border-yellow-500/20 p-4 clip-diagonal space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-400">Rutas Roguelite</p>
            <p className="font-display text-white">Santuario, Tesoro, Emboscada y Secreto</p>
            <p className="text-xs font-mono text-muted-foreground">Cada checkpoint redefine el siguiente tramo.</p>
          </div>
          <div className="bg-background/50 border border-emerald-500/20 p-4 clip-diagonal space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400">Reliquias Temporales</p>
            <p className="font-display text-white">Encuentra reliquias en checkpoints</p>
            <p className="text-xs font-mono text-muted-foreground">Cambian vida, tiempo, trampas y botin.</p>
          </div>
        </div>
        {activeSetEffect && (
          <div className="max-w-2xl mx-auto bg-background/50 border border-yellow-500/20 p-4 clip-diagonal text-left space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-400">Bono de Set Activo</p>
            <p className="font-display text-lg text-white">{activeSetEffect.title}</p>
            <p className="text-xs font-mono text-muted-foreground">{activeSetEffect.description}</p>
          </div>
        )}
        {weeklyEvent && (
          <div className="max-w-2xl mx-auto bg-background/50 border border-amber-500/20 p-4 clip-diagonal text-left space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Evento semanal</p>
            <p className="font-display text-lg text-white">{weeklyEvent.name}</p>
            <p className="text-xs font-mono text-muted-foreground">{weeklyEvent.bonuses.join(' | ')}</p>
          </div>
        )}
        <Button
          onClick={startRun}
          disabled={isGenerating}
          className="bg-red-600 hover:bg-red-500 text-white font-display tracking-widest uppercase clip-diagonal py-6 px-12 text-xl mt-8"
        >
          {isGenerating ? 'Abriendo Puertas...' : 'Entrar al Laberinto'}
        </Button>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = questions[currentQ];
    if (!q) return null;

    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-8 px-4 py-2 bg-background/80 border border-red-500/50 clip-diagonal">
          <span className="font-mono text-red-400">Habitacion {currentRoom}/20</span>
          <span className={`font-mono ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>Tiempo: {timeLeft}s</span>
          <span className="font-mono text-green-400">HP: {tempHealth}{specterBarrierCharges > 0 ? ` | Barreras: ${specterBarrierCharges}` : ''}</span>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {Array.from({ length: 20 }, (_, index) => index + 1).map((room) => (
            <div
              key={room}
              className={`w-8 h-8 flex items-center justify-center text-[10px] font-mono clip-diagonal border ${
                room < currentRoom
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : room === currentRoom
                    ? 'border-red-500/40 bg-red-500/10 text-white'
                    : 'border-accent/10 bg-background/40 text-muted-foreground'
              }`}
            >
              {room < currentRoom ? room : room === currentRoom ? room : '?'}
            </div>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-3 text-xs font-mono">
          <span className="px-3 py-2 border border-yellow-500/20 bg-background/40 clip-diagonal text-yellow-300">
            Ruta activa: {activeRoute === 'treasure' ? 'Tesoro' : activeRoute === 'ambush' ? 'Emboscada' : activeRoute === 'secret' ? 'Secreto' : 'Santuario'}
          </span>
          <span className="px-3 py-2 border border-cyan-500/20 bg-background/40 clip-diagonal text-cyan-300">
            Reliquias: {runRelics.length}
          </span>
        </div>

        <Card className="glass-panel border-red-500/50 clip-card p-8 relative overflow-hidden">
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

  if (gameState === 'reward') {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center space-y-8 relative z-10">
        <Sparkles className="w-16 h-16 text-yellow-400 mx-auto" />
        <h2 className="text-3xl font-display text-white uppercase tracking-widest">Santuario Seguro</h2>
        <p className="text-muted-foreground font-mono">Elige una bendicion antes de continuar.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {rewardOptions.map((reward, index) => (
            <Card
              key={index}
              className="glass-panel border-yellow-500/30 clip-card cursor-pointer hover:border-yellow-400 transition-all"
              onClick={() => selectReward(reward)}
            >
              <CardHeader>
                <CardTitle className="text-lg text-yellow-400">{reward.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-mono text-white">{reward.desc}</p>
                <div className="border border-accent/20 bg-background/40 p-3 clip-diagonal text-left space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-accent">Ruta siguiente</p>
                  <p className="font-display text-white">{reward.routeName}</p>
                  <p className="text-xs font-mono text-muted-foreground">{reward.routeDescription}</p>
                </div>
                {reward.relic && (
                  <div className="border border-cyan-500/20 bg-background/40 p-3 clip-diagonal text-left space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-cyan-400">Reliquia incluida</p>
                    <p className="font-display text-white">{reward.relic.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{reward.relic.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const won = tempHealth > 0 && currentRoom >= 20;

    return (
        <div className="max-w-xl mx-auto mt-20 text-center space-y-8 relative z-10">
        <Skull className={`w-24 h-24 mx-auto ${won ? 'text-yellow-400' : 'text-red-500'}`} />
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">
          {won ? 'Has Escapado' : 'Has Perecido'}
        </h2>
        <div className="glass-panel border-red-500/20 clip-card p-6 text-left space-y-3">
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Habitaciones recorridas</span>
            <span className="text-white">{Math.min(currentRoom, 20)}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Ruta final</span>
            <span className="text-cyan-300 uppercase">{activeRoute}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Reliquias de run</span>
            <span className="text-white">{runRelics.length}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Puntuacion final</span>
            <span className="text-yellow-400">{tempScore}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Vida restante</span>
            <span className="text-green-400">{tempHealth}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Barreras restantes</span>
            <span className="text-cyan-400">{specterBarrierCharges}</span>
          </div>
          {won && (
            <>
              <div className="flex justify-between text-sm font-mono">
                <span className="text-muted-foreground">Obolos ganados</span>
                <span className="text-yellow-400">{rewardObolos}</span>
              </div>
              <div className="flex justify-between text-sm font-mono">
                <span className="text-muted-foreground">Fragmentos ganados</span>
                <span className="text-cyan-400">{rewardMemory}</span>
              </div>
              <div className="space-y-2 pt-2 border-t border-red-500/10">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Botin de la run</div>
                {runLoot.length === 0 ? (
                  <div className="text-sm font-mono text-muted-foreground">No hubo reliquias en esta salida.</div>
                ) : (
                  runLoot.map((item) => (
                    <div key={item.id} className="text-sm font-mono text-white">{item.name}</div>
                  ))
                )}
              </div>
            </>
          )}
          {activeSetEffect && (
            <div className="pt-2 border-t border-yellow-500/10">
              <div className="text-xs uppercase tracking-widest text-yellow-400">{activeSetBonus}</div>
              <div className="text-sm text-white">{activeSetEffect.title}</div>
            </div>
          )}
        </div>
        <Button onClick={() => setGameState('lobby')} className="w-full bg-red-600 hover:bg-red-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver
        </Button>
      </div>
    );
  }

  return null;
};
