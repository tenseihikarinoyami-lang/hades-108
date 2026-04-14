import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skull, Sparkles, Clock, EyeOff, ShieldAlert } from 'lucide-react';
import { audio } from '@/lib/audio';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { rollLoot, rollGem, Equipment, RARITY_COLORS, SetType, GearType, Element } from '@/lib/rpg';

type SecretBoss = 'Chronos' | 'Caos' | 'Nyx' | 'Erebus' | 'Tartarus';

export const SecretBosses: React.FC = () => {
  const { user, profile } = useAuth();
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [selectedBoss, setSelectedBoss] = useState<SecretBoss | null>(null);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [bossHealth, setBossHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [lastLoot, setLastLoot] = useState<Equipment | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      const interval = selectedBoss === 'Chronos' ? 500 : 1000;
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
        if (selectedBoss === 'Erebus') {
          setPlayerHealth(h => Math.max(0, h - 5)); // Erebus passive drain
        }
      }, interval);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeOut();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState, selectedBoss]);

  const handleChallenge = async (boss: SecretBoss) => {
    if (!user || !profile) return;
    if ((profile.memoryFragments || 0) < 5) {
      toast.error("Necesitas 5 Fragmentos de Memoria para invocar a este Dios Primordial.");
      return;
    }

    setIsGenerating(true);
    const generated = await generateInfiniteTrivia('Dios', 10); // 10 very hard questions
    if (generated.length === 0) {
      toast.error("El Primordial se niega a responder.");
      setIsGenerating(false);
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        memoryFragments: increment(-5)
      });
      
      setSelectedBoss(boss);
      setQuestions(generated);
      setCurrentQ(0);
      setBossHealth(100);
      setPlayerHealth(100);
      setTimeLeft(boss === 'Tartarus' ? 5 : 10);
      setLastLoot(null);
      setHiddenOptions([]);
      setGameState('playing');
      audio.playSFX('click');
    } catch (error) {
      toast.error("Error al consumir Fragmentos.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTimeOut = () => {
    audio.playSFX('damage');
    setPlayerHealth(h => Math.max(0, h - 30));
    toast.error("¡El tiempo te devora!");
    moveToNext();
  };

  const handleAnswer = (selectedIndex: number) => {
    const q = questions[currentQ];
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      audio.playSFX('success');
      setBossHealth(h => Math.max(0, h - 10));
      toast.success("¡Impacto al Primordial!");
    } else {
      audio.playSFX('damage');
      setPlayerHealth(h => Math.max(0, h - 30));
      toast.error("¡El Primordial contraataca!");
    }
    moveToNext();
  };

  const moveToNext = () => {
    if (playerHealth <= 30 && bossHealth > 0) {
      finishGame(false);
      return;
    }
    if (bossHealth <= 10) {
      finishGame(true);
      return;
    }

    if (currentQ + 1 < questions.length) {
      setCurrentQ(prev => prev + 1);
      setTimeLeft(selectedBoss === 'Tartarus' ? 5 : 10);
      
      if (selectedBoss === 'Nyx') {
        // Nyx hides 1-2 options randomly
        const q = questions[currentQ + 1];
        const toHide = [];
        for (let i = 0; i < q.options.length; i++) {
          if (Math.random() > 0.6) toHide.push(i);
        }
        setHiddenOptions(toHide);
      } else {
        setHiddenOptions([]);
      }
    } else {
      finishGame(bossHealth <= 0);
    }
  };

  const generateGodLoot = (boss: SecretBoss): Equipment => {
    const types: GearType[] = ['weapon', 'armor', 'artifact'];
    const type = types[Math.floor(Math.random() * types.length)];
    const element: Element = boss === 'Chronos' ? 'Neutral' : boss === 'Caos' ? 'Oscuridad' : boss === 'Nyx' ? 'Oscuridad' : boss === 'Erebus' ? 'Oscuridad' : 'Fuego';
    
    let name = '';
    if (type === 'weapon') name = `Guadaña de ${boss}`;
    if (type === 'armor') name = `Manto de ${boss}`;
    if (type === 'artifact') name = `Reliquia de ${boss}`;

    return {
      id: `god_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      type,
      rarity: 'divino',
      stats: {
        damage: type === 'weapon' ? 50 : 0,
        health: type === 'armor' ? 200 : 0,
        time: type === 'artifact' ? 10 : 0
      },
      element,
      set: boss as SetType
    };
  };

  const finishGame = async (won: boolean) => {
    setGameState('result');
    if (won && user && profile && selectedBoss) {
      const loot = generateGodLoot(selectedBoss);
      const gem = rollGem();
      
      setLastLoot(loot);
      const docRef = doc(db, 'users', user.uid);
      
      const titlesMap: Record<SecretBoss, string> = {
        'Chronos': 'Asesino de Chronos',
        'Caos': 'Vencedor del Caos',
        'Nyx': 'Portador de la Noche',
        'Erebus': 'Señor de las Sombras',
        'Tartarus': 'Conquistador del Abismo'
      };
      const newTitle = titlesMap[selectedBoss];
      
      const updates: any = {
        gearInventory: [...(profile.gearInventory || []), loot],
        gems: [...(profile.gems || []), gem],
        obolos: increment(1000)
      };

      if (!profile.titles?.includes(newTitle)) {
        updates.titles = [...(profile.titles || []), newTitle];
      }

      await updateDoc(docRef, updates);
      toast.success(`¡Has derrotado al Primordial! +1000 Óbolos | Gema: ${gem.name} | Nuevo Título: ${newTitle}`);
    } else {
      toast.error("Has sido aniquilado por el Primordial.");
    }
  };

  // Chaos obfuscation
  const scrambleText = (text: string) => {
    if (selectedBoss !== 'Caos') return text;
    return text.split('').map(char => Math.random() > 0.8 ? '?' : char).join('');
  };

  if (gameState === 'lobby') {
    return (
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-red-500 neon-text-accent uppercase tracking-[0.2em]">
            Dioses Primordiales
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Jefes Secretos</p>
          <div className="flex justify-center items-center gap-2 mt-4">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-white">Fragmentos de Memoria: {profile?.memoryFragments || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chronos */}
          <Card className="glass-panel border-yellow-500/30 clip-card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 to-transparent pointer-events-none" />
            <CardHeader className="text-center border-b border-yellow-500/20 bg-background/40">
              <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <CardTitle className="font-display text-2xl text-white tracking-widest uppercase">Chronos</CardTitle>
              <p className="text-xs font-mono text-muted-foreground mt-2">El Tiempo corre el doble de rápido.</p>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Button 
                onClick={() => handleChallenge('Chronos')}
                disabled={isGenerating || (profile?.memoryFragments || 0) < 5}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-display tracking-widest uppercase clip-diagonal"
              >
                {isGenerating ? 'Invocando...' : 'Invocar (5 Fragmentos)'}
              </Button>
            </CardContent>
          </Card>

          {/* Caos */}
          <Card className="glass-panel border-purple-500/30 clip-card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
            <CardHeader className="text-center border-b border-purple-500/20 bg-background/40">
              <EyeOff className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <CardTitle className="font-display text-2xl text-white tracking-widest uppercase">Caos</CardTitle>
              <p className="text-xs font-mono text-muted-foreground mt-2">La realidad se distorsiona (Texto ofuscado).</p>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Button 
                onClick={() => handleChallenge('Caos')}
                disabled={isGenerating || (profile?.memoryFragments || 0) < 5}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-display tracking-widest uppercase clip-diagonal"
              >
                {isGenerating ? 'Invocando...' : 'Invocar (5 Fragmentos)'}
              </Button>
            </CardContent>
          </Card>

          {/* Nyx */}
          <Card className="glass-panel border-indigo-500/30 clip-card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <CardHeader className="text-center border-b border-indigo-500/20 bg-background/40">
              <EyeOff className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <CardTitle className="font-display text-2xl text-white tracking-widest uppercase">Nyx</CardTitle>
              <p className="text-xs font-mono text-muted-foreground mt-2">Oculta opciones en la oscuridad.</p>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Button 
                onClick={() => handleChallenge('Nyx')}
                disabled={isGenerating || (profile?.memoryFragments || 0) < 5}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-display tracking-widest uppercase clip-diagonal"
              >
                {isGenerating ? 'Invocando...' : 'Invocar (5 Fragmentos)'}
              </Button>
            </CardContent>
          </Card>

          {/* Erebus */}
          <Card className="glass-panel border-slate-500/30 clip-card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-transparent pointer-events-none" />
            <CardHeader className="text-center border-b border-slate-500/20 bg-background/40">
              <Skull className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <CardTitle className="font-display text-2xl text-white tracking-widest uppercase">Erebus</CardTitle>
              <p className="text-xs font-mono text-muted-foreground mt-2">Drena tu vida constantemente.</p>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Button 
                onClick={() => handleChallenge('Erebus')}
                disabled={isGenerating || (profile?.memoryFragments || 0) < 5}
                className="w-full bg-slate-600 hover:bg-slate-500 text-white font-display tracking-widest uppercase clip-diagonal"
              >
                {isGenerating ? 'Invocando...' : 'Invocar (5 Fragmentos)'}
              </Button>
            </CardContent>
          </Card>

          {/* Tartarus */}
          <Card className="glass-panel border-red-800/30 clip-card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />
            <CardHeader className="text-center border-b border-red-800/20 bg-background/40">
              <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="font-display text-2xl text-white tracking-widest uppercase">Tartarus</CardTitle>
              <p className="text-xs font-mono text-muted-foreground mt-2">Solo 5 segundos para responder.</p>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Button 
                onClick={() => handleChallenge('Tartarus')}
                disabled={isGenerating || (profile?.memoryFragments || 0) < 5}
                className="w-full bg-red-800 hover:bg-red-700 text-white font-display tracking-widest uppercase clip-diagonal"
              >
                {isGenerating ? 'Invocando...' : 'Invocar (5 Fragmentos)'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = questions[currentQ];
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-8 px-4 py-2 bg-background/80 border border-red-500/50 clip-diagonal">
          <span className="font-mono text-red-400">HP Primordial: {bossHealth}%</span>
          <span className={`font-mono ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            Tiempo: {timeLeft}s
          </span>
          <span className="font-mono text-green-400">Tu HP: {playerHealth}%</span>
        </div>
        
        <Card className="glass-panel border-red-500/50 clip-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
          <h3 className="text-xl font-sans font-bold text-white mb-8 text-center relative z-10">
            {scrambleText(q.q)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {q.options.map((opt, idx) => {
              if (hiddenOptions.includes(idx)) {
                return <div key={idx} className="h-auto py-4 opacity-0 pointer-events-none"></div>;
              }
              return (
                <Button 
                  key={idx} 
                  variant="outline" 
                  className="h-auto py-4 text-lg font-sans tracking-wide border-red-500/30 hover:border-red-400 hover:bg-red-500/20 transition-all clip-diagonal"
                  onClick={() => handleAnswer(idx)}
                >
                  {scrambleText(opt)}
                </Button>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'result') {
    const won = bossHealth <= 0;
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 relative z-10">
        <Skull className={`w-24 h-24 mx-auto ${won ? 'text-yellow-400' : 'text-red-500'}`} />
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">
          {won ? 'Primordial Derrotado' : 'Aniquilación'}
        </h2>
        
        {won && lastLoot && (
          <div className={`p-6 border clip-diagonal bg-background/50 ${RARITY_COLORS[lastLoot.rarity]}`}>
            <h3 className="font-bold text-lg mb-2">{lastLoot.name}</h3>
            <p className="text-sm font-mono opacity-80">{lastLoot.rarity} - {lastLoot.type}</p>
          </div>
        )}

        <Button onClick={() => setGameState('lobby')} className="w-full bg-red-600 hover:bg-red-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver al Santuario
        </Button>
      </div>
    );
  }

  return null;
};
