import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Waves, Anchor, Fish, Sparkles, Timer } from 'lucide-react';
import { audio } from '@/lib/audio';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export const Fishing: React.FC = () => {
  const { user, profile } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'bite' | 'result'>('idle');
  const [river, setRiver] = useState<'Estigia' | 'Lete'>('Estigia');
  const [waitTime, setWaitTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [reward, setReward] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'waiting') {
      const randomWait = Math.random() * 3000 + 2000;
      timer = setTimeout(() => {
        setGameState('bite');
        setReactionTime(Date.now());
      }, randomWait);
    }
    return () => clearTimeout(timer);
  }, [gameState]);

  const startFishing = () => {
    if ((profile?.obolos || 0) < 50) {
      toast.error("Necesitas 50 Óbolos para pescar.");
      return;
    }
    setGameState('waiting');
    audio.playSFX('click');
  };

  const handleCatch = async () => {
    const now = Date.now();
    const diff = now - reactionTime;

    if (diff < 1000) { // Catch success
      audio.playSFX('success');
      const roll = Math.random();
      let caught = '';
      let materialsUpdate = { ...profile?.materials };

      if (river === 'Estigia') {
        if (roll > 0.9) {
          caught = 'Esencia de Sombras';
          materialsUpdate.shadowEssence = (materialsUpdate.shadowEssence || 0) + 1;
        } else if (roll > 0.6) {
          caught = 'Mineral Primordial';
          materialsUpdate.primordialOre = (materialsUpdate.primordialOre || 0) + 1;
        } else {
          caught = 'Óbolos (x200)';
        }
      } else {
        if (roll > 0.9) {
          caught = 'Polvo de Estrellas';
          materialsUpdate.stardust = (materialsUpdate.stardust || 0) + 1;
        } else if (roll > 0.6) {
          caught = 'Esencia de Almas';
          materialsUpdate.soulEsence = (materialsUpdate.soulEsence || 0) + 1;
        } else {
          caught = 'Óbolos (x200)';
        }
      }

      setReward(caught);
      setGameState('result');

      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const updates: any = {
          obolos: increment(caught.includes('Óbolos') ? 150 : -50), // -50 cost + 200 reward = 150 net
          materials: materialsUpdate
        };
        await updateDoc(docRef, updates);
      }
      toast.success(`¡Has pescado: ${caught}!`);
    } else {
      audio.playSFX('damage');
      setGameState('result');
      setReward(null);
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { obolos: increment(-50) });
      }
      toast.error("¡Se escapó!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10 text-center mt-20">
      <div className="space-y-4">
        <Waves className={`w-20 h-20 mx-auto ${river === 'Estigia' ? 'text-purple-500' : 'text-blue-400'} animate-pulse`} />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 neon-text-accent uppercase tracking-[0.2em]">
          Pesca Infernal
        </h1>
        <div className="flex justify-center gap-4">
          <Button 
            variant={river === 'Estigia' ? 'default' : 'outline'}
            onClick={() => setRiver('Estigia')}
            className="clip-diagonal uppercase tracking-widest"
          >
            Río Estigia
          </Button>
          <Button 
            variant={river === 'Lete' ? 'default' : 'outline'}
            onClick={() => setRiver('Lete')}
            className="clip-diagonal uppercase tracking-widest"
          >
            Río Lete
          </Button>
        </div>
      </div>

      <Card className="glass-panel border-blue-500/30 clip-card p-12 relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <p className="text-muted-foreground font-mono">Lanza el anzuelo por 50 Óbolos.</p>
              <Button onClick={startFishing} className="bg-blue-600 hover:bg-blue-500 text-white py-8 px-16 text-2xl clip-diagonal uppercase tracking-widest">
                Lanzar Anzuelo
              </Button>
            </motion.div>
          )}

          {gameState === 'waiting' && (
            <motion.div 
              key="waiting"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="relative">
                <Anchor className="w-16 h-16 text-muted-foreground animate-bounce mx-auto" />
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
              </div>
              <p className="text-blue-400 font-display animate-pulse tracking-widest uppercase">Esperando un pique...</p>
            </motion.div>
          )}

          {gameState === 'bite' && (
            <motion.div 
              key="bite"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="space-y-6"
            >
              <div className="relative">
                <Fish className="w-24 h-24 text-yellow-400 animate-bounce mx-auto" />
                <div className="absolute inset-0 bg-yellow-400/40 blur-2xl rounded-full animate-ping" />
              </div>
              <Button onClick={handleCatch} className="bg-yellow-500 hover:bg-yellow-400 text-black py-8 px-16 text-3xl clip-diagonal uppercase tracking-widest font-bold">
                ¡TIRAR!
              </Button>
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {reward ? (
                <>
                  <Sparkles className="w-16 h-16 text-yellow-400 mx-auto" />
                  <h2 className="text-3xl font-display text-white uppercase tracking-widest">¡Captura Exitosa!</h2>
                  <p className="text-xl text-yellow-400 font-mono">{reward}</p>
                </>
              ) : (
                <>
                  <Timer className="w-16 h-16 text-red-500 mx-auto" />
                  <h2 className="text-3xl font-display text-white uppercase tracking-widest">Demasiado Tarde</h2>
                  <p className="text-muted-foreground font-mono">El pez se ha llevado el cebo.</p>
                </>
              )}
              <Button onClick={() => setGameState('idle')} className="bg-blue-600 hover:bg-blue-500 text-white clip-diagonal uppercase tracking-widest">
                Intentar de nuevo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};
