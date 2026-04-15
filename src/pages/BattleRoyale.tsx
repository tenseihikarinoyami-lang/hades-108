import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, Users, Skull, Crown } from 'lucide-react';
import { audio } from '@/lib/audio';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { arrayUnion, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { rollLoot } from '@/lib/rpg';

export const BattleRoyale: React.FC = () => {
  const { user, profile } = useAuth();
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [playersLeft, setPlayersLeft] = useState(100);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [placement, setPlacement] = useState(100);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeOut();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const joinTournament = async () => {
    setIsGenerating(true);
    const generated = await generateInfiniteTrivia('Extremo', 10);
    if (generated.length === 0) {
      toast.error("Error al conectar con el servidor del torneo.");
      setIsGenerating(false);
      return;
    }
    
    setQuestions(generated);
    setCurrentQ(0);
    setPlayersLeft(100);
    setTimeLeft(10);
    setGameState('playing');
    setIsGenerating(false);
    audio.playSFX('click');
  };

  const handleTimeOut = () => {
    audio.playSFX('damage');
    toast.error("¡Eliminado por tiempo!");
    finishGame(false);
  };

  const handleAnswer = (selectedIndex: number) => {
    const q = questions[currentQ];
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      audio.playSFX('success');
      
      // Simulate other players dying
      const dropRate = 0.3 + (currentQ * 0.05); // More die later
      const newPlayersLeft = Math.max(1, Math.floor(playersLeft * (1 - dropRate)));
      setPlayersLeft(newPlayersLeft);
      
      if (newPlayersLeft === 1) {
        finishGame(true);
      } else {
        moveToNext();
      }
    } else {
      audio.playSFX('damage');
      toast.error("¡Respuesta incorrecta! Has sido eliminado.");
      finishGame(false);
    }
  };

  const moveToNext = async () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ(prev => prev + 1);
      setTimeLeft(10 - Math.min(5, Math.floor(currentQ / 2))); // Gets faster
    } else {
      // Generate more if needed
      setIsGenerating(true);
      const generated = await generateInfiniteTrivia('Extremo', 5);
      setQuestions(generated);
      setCurrentQ(0);
      setTimeLeft(5);
      setIsGenerating(false);
    }
  };

  const finishGame = async (won: boolean) => {
    setPlacement(won ? 1 : playersLeft);
    setGameState('result');
    
    if (won && user && profile) {
      const loot = rollLoot(true); // Divine chance
      const docRef = doc(db, 'users', user.uid);
      
      const updates: any = {
        obolos: increment(5000)
      };
      
      if (loot) {
        updates.gearInventory = arrayUnion(loot);
      }
      
      if (!profile.titles?.includes('Sobreviviente Supremo')) {
        updates.titles = arrayUnion('Sobreviviente Supremo');
      }
      
      await updateDoc(docRef, updates);
      toast.success("¡VICTORIA MAGISTRAL!");
    }
  };

  if (gameState === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 relative z-10 text-center mt-20">
        <Trophy className="w-24 h-24 text-yellow-400 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 neon-text-accent uppercase tracking-[0.2em]">
          Torneo de Supervivencia
        </h1>
        <p className="text-muted-foreground font-mono max-w-xl mx-auto">
          100 Espectros entran. Solo 1 sale vivo. Responde rápido y sin errores. El último en pie se lleva la gloria eterna y tesoros divinos.
        </p>
        <Button 
          onClick={joinTournament}
          disabled={isGenerating}
          className="bg-yellow-600 hover:bg-yellow-500 text-white font-display tracking-widest uppercase clip-diagonal py-6 px-12 text-xl mt-8"
        >
          {isGenerating ? 'Buscando Partida...' : 'Unirse al Torneo'}
        </Button>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = questions[currentQ];
    if (!q) return null;
    
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-8 px-4 py-2 bg-background/80 border border-yellow-500/50 clip-diagonal">
          <span className="font-mono text-yellow-400 flex items-center gap-2"><Users className="w-4 h-4"/> Vivos: {playersLeft}/100</span>
          <span className={`font-mono ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            Tiempo: {timeLeft}s
          </span>
        </div>
        
        <Card className="glass-panel border-yellow-500/50 clip-card p-8 relative overflow-hidden">
          <h3 className="text-xl font-sans font-bold text-white mb-8 text-center relative z-10">{q.q}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {q.options.map((opt, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                className="h-auto py-4 text-lg font-sans tracking-wide border-yellow-500/30 hover:border-yellow-400 hover:bg-yellow-500/20 transition-all clip-diagonal"
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
    const won = placement === 1;
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 relative z-10">
        {won ? <Crown className="w-24 h-24 text-yellow-400 mx-auto" /> : <Skull className="w-24 h-24 text-red-500 mx-auto" />}
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">
          {won ? '¡Victoria Magistral!' : 'Eliminado'}
        </h2>
        <p className="font-mono text-xl text-muted-foreground">Posición: #{placement}</p>
        
        <Button onClick={() => setGameState('lobby')} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver al Lobby
        </Button>
      </div>
    );
  }

  return null;
};
