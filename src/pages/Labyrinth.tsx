import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, Skull } from 'lucide-react';
import { audio } from '@/lib/audio';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { rollLoot } from '@/lib/rpg';

type RewardOption = {
  type: 'heal' | 'blessing_time' | 'blessing_score';
  name: string;
  desc: string;
};

export const Labyrinth: React.FC = () => {
  const { user, profile } = useAuth();
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'reward' | 'result'>('lobby');
  const [currentRoom, setCurrentRoom] = useState(1);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  // Temp stats for run
  const [tempHealth, setTempHealth] = useState(100);
  const [tempScore, setTempScore] = useState(0);
  const [blessings, setBlessings] = useState<string[]>([]);

  // Reward selection
  const [rewardOptions, setRewardOptions] = useState<RewardOption[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeOut();
    }

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const getBaseTime = (activeBlessings: string[] = blessings) => 15 + (activeBlessings.includes('time') ? 5 : 0);
  const getScoreReward = () => (blessings.includes('score') ? 200 : 100);

  const startRun = async () => {
    setIsGenerating(true);
    const generated = await generateInfiniteTrivia('DifÃ­cil', 5);

    if (generated.length === 0) {
      toast.error('El Laberinto estÃ¡ cerrado.');
      setIsGenerating(false);
      return;
    }

    setQuestions(generated);
    setCurrentRoom(1);
    setCurrentQ(0);
    setTempHealth(100);
    setTempScore(0);
    setBlessings([]);
    setTimeLeft(15);
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
    const generated = await generateInfiniteTrivia('DifÃ­cil', 5);
    setQuestions(generated);
    setCurrentQ(0);
    setCurrentRoom((room) => room + 1);
    setTimeLeft(getBaseTime());
    setIsGenerating(false);
  };

  const handleTimeOut = () => {
    audio.playSFX('damage');
    const nextHealth = Math.max(0, tempHealth - 30);
    setTempHealth(nextHealth);
    toast.error('Â¡Tiempo agotado!');
    moveToNextRoom(nextHealth);
  };

  const handleAnswer = (selectedIndex: number) => {
    const q = questions[currentQ];
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      audio.playSFX('success');
      setTempScore((score) => score + getScoreReward());
      toast.success('Â¡Respuesta correcta!');
      moveToNextRoom(tempHealth);
      return;
    }

    audio.playSFX('damage');
    const nextHealth = Math.max(0, tempHealth - 30);
    setTempHealth(nextHealth);
    toast.error('Â¡Respuesta incorrecta! Trampa activada.');
    moveToNextRoom(nextHealth);
  };

  const generateRewards = () => {
    setRewardOptions([
      { type: 'heal', name: 'PociÃ³n Mayor', desc: 'Restaura 50 HP' },
      { type: 'blessing_time', name: 'BendiciÃ³n de Hermes', desc: '+5s de tiempo base' },
      { type: 'blessing_score', name: 'BendiciÃ³n de Midas', desc: 'Doble puntuaciÃ³n' }
    ]);
  };

  const selectReward = async (reward: RewardOption) => {
    audio.playSFX('success');

    let nextHealth = tempHealth;
    let nextBlessings = blessings;

    if (reward.type === 'heal') {
      nextHealth = Math.min(100, tempHealth + 50);
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
    const generated = await generateInfiniteTrivia('DifÃ­cil', 5);
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
      toast.success('Â¡Has escapado del laberinto!');
      return;
    }

    const docRef = doc(db, 'users', user.uid);
    await updateDoc(docRef, {
      gearInventory: [...(profile.gearInventory || []), loot],
      obolos: increment(tempScore)
    });

    toast.success(`Â¡Has escapado! Recompensa: ${loot.name}`);
  };

  if (gameState === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 relative z-10 text-center mt-20">
        <Skull className="w-24 h-24 text-red-600 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-red-600 neon-text-accent uppercase tracking-[0.2em]">
          Laberinto del Minotauro
        </h1>
        <p className="text-muted-foreground font-mono max-w-xl mx-auto">
          Entra sin equipo. Sobrevive a 20 habitaciones. Si mueres, pierdes todo el progreso de la incursiÃ³n. Si escapas, obtendrÃ¡s tesoros inimaginables.
        </p>
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
          <span className="font-mono text-red-400">HabitaciÃ³n {currentRoom}/20</span>
          <span className={`font-mono ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            Tiempo: {timeLeft}s
          </span>
          <span className="font-mono text-green-400">HP: {tempHealth}</span>
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
        <p className="text-muted-foreground font-mono">Elige una bendiciÃ³n antes de continuar.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {rewardOptions.map((reward, idx) => (
            <Card
              key={idx}
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
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 relative z-10">
        <Skull className={`w-24 h-24 mx-auto ${won ? 'text-yellow-400' : 'text-red-500'}`} />
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">
          {won ? 'Has Escapado' : 'Has Perecido'}
        </h2>
        <Button onClick={() => setGameState('lobby')} className="w-full bg-red-600 hover:bg-red-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver
        </Button>
      </div>
    );
  }

  return null;
};
