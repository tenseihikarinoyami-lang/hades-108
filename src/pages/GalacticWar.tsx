import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Swords, Search, Shield, Trophy, Target } from 'lucide-react';
import { audio } from '@/lib/audio';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PvPChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerPhoto: string;
  challengerScore: number;
  challengerTime: number;
  targetId: string;
  targetName: string;
  targetPhoto: string;
  targetScore?: number;
  targetTime?: number;
  questions: GeneratedTrivia[];
  status: 'pending' | 'completed';
  winnerId?: string;
  createdAt: number;
}

export const GalacticWar: React.FC = () => {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<PvPChallenge[]>([]);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  
  // Active Match State
  const [activeChallenge, setActiveChallenge] = useState<PvPChallenge | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchChallenges();
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing') {
      timer = setInterval(() => setTimeSpent(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const fetchUsers = async () => {
    if (!user) return;
    const q = query(collection(db, 'users'));
    const snap = await getDocs(q);
    const usersList = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.id !== user.uid);
    setUsers(usersList);
  };

  const fetchChallenges = async () => {
    if (!user) return;
    // In a real app, we'd query where challengerId == user.uid OR targetId == user.uid
    const q = query(collection(db, 'pvp_challenges'));
    const snap = await getDocs(q);
    const challengesList = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as PvPChallenge))
      .filter(c => c.challengerId === user.uid || c.targetId === user.uid)
      .sort((a, b) => b.createdAt - a.createdAt);
    setChallenges(challengesList);
  };

  const initiateChallenge = async (targetUser: any) => {
    if (!user || !profile) return;
    
    setIsGenerating(true);
    const generated = await generateInfiniteTrivia('Espectro', 5);
    if (generated.length === 0) {
      toast.error("Error al generar el desafío.");
      setIsGenerating(false);
      return;
    }

    const newChallenge: PvPChallenge = {
      id: `pvp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      challengerId: user.uid,
      challengerName: profile.specterName || profile.displayName || 'Espectro',
      challengerPhoto: profile.photoURL || '',
      challengerScore: 0,
      challengerTime: 0,
      targetId: targetUser.id,
      targetName: targetUser.specterName || targetUser.displayName || 'Espectro',
      targetPhoto: targetUser.photoURL || '',
      questions: generated,
      status: 'pending',
      createdAt: Date.now()
    };

    setActiveChallenge(newChallenge);
    setCurrentQ(0);
    setScore(0);
    setTimeSpent(0);
    setGameState('playing');
    setIsGenerating(false);
    audio.playSFX('click');
  };

  const acceptChallenge = (challenge: PvPChallenge) => {
    setActiveChallenge(challenge);
    setCurrentQ(0);
    setScore(0);
    setTimeSpent(0);
    setGameState('playing');
    audio.playSFX('click');
  };

  const handleAnswer = (selectedIndex: number) => {
    if (!activeChallenge) return;
    
    const q = activeChallenge.questions[currentQ];
    const isCorrect = selectedIndex === q.answer;
    
    if (isCorrect) {
      audio.playSFX('success');
      setScore(s => s + 100);
    } else {
      audio.playSFX('damage');
    }
    
    if (currentQ + 1 < activeChallenge.questions.length) {
      setCurrentQ(prev => prev + 1);
    } else {
      finishMatch();
    }
  };

  const finishMatch = async () => {
    if (!user || !activeChallenge) return;
    
    setGameState('result');
    
    const isChallenger = activeChallenge.challengerId === user.uid;
    const challengeRef = doc(db, 'pvp_challenges', activeChallenge.id);
    
    if (isChallenger) {
      // Save initial challenge
      await setDoc(challengeRef, {
        ...activeChallenge,
        challengerScore: score,
        challengerTime: timeSpent
      });
      toast.success("Desafío enviado. Esperando respuesta del rival.");
    } else {
      // Complete challenge
      const challengerScore = activeChallenge.challengerScore;
      const challengerTime = activeChallenge.challengerTime;
      
      let winnerId = '';
      if (score > challengerScore) winnerId = user.uid;
      else if (challengerScore > score) winnerId = activeChallenge.challengerId;
      else {
        // Tie breaker: time
        if (timeSpent < challengerTime) winnerId = user.uid;
        else if (challengerTime < timeSpent) winnerId = activeChallenge.challengerId;
        else winnerId = 'tie';
      }
      
      await updateDoc(challengeRef, {
        targetScore: score,
        targetTime: timeSpent,
        status: 'completed',
        winnerId
      });
      
      // Reward winner (simplified)
      if (winnerId === user.uid) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { obolos: (profile?.obolos || 0) + 50 });
        toast.success("¡Has ganado el duelo! +50 Óbolos");
      } else if (winnerId !== 'tie') {
        toast.error("Has perdido el duelo.");
      } else {
        toast("Empate técnico.");
      }
    }
    
    fetchChallenges();
  };

  if (gameState === 'lobby') {
    return (
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 neon-text-accent uppercase tracking-[0.2em]">
            Guerra Galáctica
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Combate Asíncrono</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active/Past Challenges */}
          <Card className="glass-panel border-cyan-500/30 clip-card">
            <CardHeader className="border-b border-cyan-500/20 bg-background/40">
              <CardTitle className="font-display text-xl text-white tracking-widest uppercase flex items-center gap-2">
                <Swords className="w-5 h-5 text-cyan-400" /> Mis Duelos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {challenges.length === 0 ? (
                <p className="text-center text-muted-foreground font-mono py-8">No tienes duelos activos.</p>
              ) : (
                challenges.map(c => {
                  const isChallenger = c.challengerId === user?.uid;
                  const opponentName = isChallenger ? c.targetName : c.challengerName;
                  const opponentPhoto = isChallenger ? c.targetPhoto : c.challengerPhoto;
                  
                  return (
                    <div key={c.id} className="p-4 border border-accent/20 clip-diagonal bg-background/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10 border border-accent">
                          <AvatarImage src={opponentPhoto} />
                          <AvatarFallback>{opponentName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm">{opponentName}</p>
                          <p className="text-xs font-mono text-muted-foreground">
                            {c.status === 'pending' ? 'Pendiente' : 'Completado'}
                          </p>
                        </div>
                      </div>
                      
                      {c.status === 'pending' && !isChallenger && (
                        <Button onClick={() => acceptChallenge(c)} className="bg-cyan-600 hover:bg-cyan-500 text-white clip-diagonal text-xs">
                          Aceptar
                        </Button>
                      )}
                      {c.status === 'pending' && isChallenger && (
                        <span className="text-xs font-mono text-cyan-400">Esperando...</span>
                      )}
                      {c.status === 'completed' && (
                        <div className="text-right">
                          <p className={`text-xs font-bold ${c.winnerId === user?.uid ? 'text-green-400' : c.winnerId === 'tie' ? 'text-yellow-400' : 'text-red-400'}`}>
                            {c.winnerId === user?.uid ? 'VICTORIA' : c.winnerId === 'tie' ? 'EMPATE' : 'DERROTA'}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            Tú: {isChallenger ? c.challengerScore : c.targetScore} | Rival: {isChallenger ? c.targetScore : c.challengerScore}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* User List to Challenge */}
          <Card className="glass-panel border-accent/30 clip-card">
            <CardHeader className="border-b border-accent/20 bg-background/40">
              <CardTitle className="font-display text-xl text-white tracking-widest uppercase flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" /> Retar Espectros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {users.map(u => (
                <div key={u.id} className="p-4 border border-accent/20 clip-diagonal bg-background/50 flex items-center justify-between hover:border-accent transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 border border-accent">
                      <AvatarImage src={u.photoURL} />
                      <AvatarFallback>{(u.specterName || u.displayName || 'E')[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm">{u.specterName || u.displayName}</p>
                      <p className="text-xs font-mono text-muted-foreground">Facción: {u.faction || 'Ninguna'}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => initiateChallenge(u)} 
                    disabled={isGenerating}
                    variant="outline" 
                    className="border-accent text-accent hover:bg-accent/20 clip-diagonal text-xs"
                  >
                    Retar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && activeChallenge) {
    const q = activeChallenge.questions[currentQ];
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-8 px-4 py-2 bg-background/80 border border-cyan-500/50 clip-diagonal">
          <span className="font-mono text-cyan-400">Pregunta {currentQ + 1} / {activeChallenge.questions.length}</span>
          <span className="font-mono text-white">Tiempo: {timeSpent}s</span>
          <span className="font-mono text-green-400">Puntos: {score}</span>
        </div>
        
        <Card className="glass-panel border-cyan-500/50 clip-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none" />
          <h3 className="text-xl font-sans font-bold text-white mb-8 text-center relative z-10">{q.q}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {q.options.map((opt, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                className="h-auto py-4 text-lg font-sans tracking-wide border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all clip-diagonal"
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
        <Trophy className="w-24 h-24 text-cyan-400 mx-auto animate-pulse" />
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">Duelo Finalizado</h2>
        <div className="p-6 glass-panel border-cyan-500/30 clip-card space-y-4">
          <p className="font-mono text-lg">Puntuación: <span className="text-cyan-400 font-bold">{score}</span></p>
          <p className="font-mono text-lg">Tiempo: <span className="text-yellow-400 font-bold">{timeSpent}s</span></p>
        </div>
        <Button onClick={() => setGameState('lobby')} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver al Lobby
        </Button>
      </div>
    );
  }

  return null;
};
