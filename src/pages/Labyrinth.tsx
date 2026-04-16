import React, { useEffect, useMemo, useState } from 'react';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { Skull, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { audio } from '@/lib/audio';
import { getCombatContext } from '@/lib/combat';
import { db } from '@/lib/firebase';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { Equipment, rollLoot } from '@/lib/rpg';

type RewardOption = {
  type: 'heal' | 'blessing_time' | 'blessing_score';
  name: string;
  desc: string;
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
  const { activeSpecter, activeSetBonus, activeSetEffect, bonuses: combatBonuses } = useMemo(
    () => getCombatContext(profile),
    [profile]
  );
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

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeOut();
    }

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const getBaseTime = (activeBlessings: string[] = blessings) =>
    15 + (activeBlessings.includes('time') ? 5 : 0) + combatBonuses.bonusTime + dailyModifier.bonusTime;

  const getScoreReward = () => Math.floor((blessings.includes('score') ? 200 : 100) * combatBonuses.damageMultiplier);
  const getTrapDamage = () => Math.max(10, 30 + dailyModifier.trapDamage);

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
    const generated = await generateInfiniteTrivia('Dificil', 5);

    if (generated.length === 0) {
      toast.error('El Laberinto esta cerrado.');
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
    setTimeLeft(getBaseTime([]));
    setTempHealth(100 + combatBonuses.bonusHealth);
    setSpecterBarrierCharges(combatBonuses.startingShields);
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
    const generated = await generateInfiniteTrivia('Dificil', 5);
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
    const rewardCatalog: RewardOption[] = [
      { type: 'heal', name: 'Pocion Mayor', desc: 'Restaura 50 HP' },
      { type: 'blessing_time', name: 'Bendicion de Hermes', desc: '+5s de tiempo base' },
      { type: 'blessing_score', name: 'Bendicion de Midas', desc: 'Doble puntuacion' },
    ];
    const favored = rewardCatalog.find((reward) => reward.type === dailyModifier.favoredReward)!;
    const others = rewardCatalog.filter((reward) => reward.type !== dailyModifier.favoredReward);
    setRewardOptions([favored, ...others]);
  };

  const selectReward = async (reward: RewardOption) => {
    audio.playSFX('success');

    let nextHealth = tempHealth;
    let nextBlessings = blessings;

    if (reward.type === 'heal') {
      nextHealth = Math.min(100 + combatBonuses.bonusHealth, tempHealth + 50);
      setTempHealth(nextHealth);
    } else if (reward.type === 'blessing_time') {
      nextBlessings = [...blessings, 'time'];
      setBlessings(nextBlessings);
    } else if (reward.type === 'blessing_score') {
      nextBlessings = [...blessings, 'score'];
      setBlessings(nextBlessings);
    }

    if (currentRoom >= 20) {
      finishGame(true);
      return;
    }

    setIsGenerating(true);
    const generated = await generateInfiniteTrivia('Dificil', 5);
    setQuestions(generated);
    setCurrentQ(0);
    setCurrentRoom((room) => room + 1);
    setTimeLeft(getBaseTime(nextBlessings));
    setGameState('playing');
    setIsGenerating(false);
  };

  const finishGame = async (won: boolean) => {
    setGameState('result');

    if (!won || !user || !profile) {
      toast.error('Has perecido en el laberinto. Lo pierdes todo.');
      return;
    }

    const loot = rollLoot(true);
    if (!loot) {
      toast.success('Has escapado del laberinto.');
      return;
    }

    const bonusLoot = Math.random() < (combatBonuses.lootChanceBonus + dailyModifier.lootBonus) ? rollLoot(true) : null;
    const memoryReward = Math.random() < (combatBonuses.memoryDropBonus + dailyModifier.memoryBonus) ? 1 : 0;
    const obolosReward = Math.floor(tempScore * combatBonuses.obolosMultiplier * dailyModifier.obolosMultiplier);
    const docRef = doc(db, 'users', user.uid);

    setRunLoot([loot, ...(bonusLoot ? [bonusLoot] : [])]);
    setRewardMemory(memoryReward);
    setRewardObolos(obolosReward);

    await updateDoc(docRef, {
      gearInventory: bonusLoot ? arrayUnion(loot, bonusLoot) : arrayUnion(loot),
      obolos: increment(obolosReward),
      ...(memoryReward > 0 ? { memoryFragments: increment(memoryReward) } : {}),
    });

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
        {activeSetEffect && (
          <div className="max-w-2xl mx-auto bg-background/50 border border-yellow-500/20 p-4 clip-diagonal text-left space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-400">Bono de Set Activo</p>
            <p className="font-display text-lg text-white">{activeSetEffect.title}</p>
            <p className="text-xs font-mono text-muted-foreground">{activeSetEffect.description}</p>
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
              <CardContent>
                <p className="text-sm font-mono text-white">{reward.desc}</p>
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
