import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Flame, ArrowUpCircle, Coins, Swords } from 'lucide-react';
import { audio } from '@/lib/audio';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const Ascension: React.FC = () => {
  const { user, profile } = useAuth();
  const [isAscending, setIsAscending] = useState(false);

  if (!profile) return null;

  const canAscend = (profile.level || 1) >= 100;
  const currentAscension = profile.ascensionLevel || 0;
  const soulPoints = profile.soulPoints || 0;
  const soulTree = profile.soulTree || { globalDamage: 0, obolosMultiplier: 0 };

  const handleAscend = async () => {
    if (!user || !canAscend || isAscending) return;

    // Use a custom modal in a real app, but for now we'll just proceed
    setIsAscending(true);
    audio.playSFX('success');

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        level: 1,
        xp: 0,
        ascensionLevel: currentAscension + 1,
        soulPoints: soulPoints + 1
      });
      toast.success("¡Has Renacido! Tu poder base ha aumentado.");
    } catch (error) {
      toast.error("Error al ascender.");
    } finally {
      setIsAscending(false);
    }
  };

  const upgradeSoulTree = async (type: 'globalDamage' | 'obolosMultiplier') => {
    if (!user || soulPoints <= 0) return;

    audio.playSFX('click');
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        soulPoints: soulPoints - 1,
        [`soulTree.${type}`]: soulTree[type] + 1
      });
      toast.success("Árbol de Alma mejorado.");
    } catch (error) {
      toast.error("Error al mejorar.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10 mt-10">
      <div className="text-center space-y-4 mb-12">
        <Flame className="w-16 h-16 text-blue-500 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-400 neon-text-accent uppercase tracking-[0.2em]">
          Renacimiento del Espectro
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Ascensión de Alma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-panel border-blue-500/30 clip-card">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5" /> Ascensión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-mono text-muted-foreground uppercase">Nivel Actual</p>
              <p className={`text-4xl font-display font-bold ${canAscend ? 'text-green-400' : 'text-white'}`}>
                {profile.level || 1} <span className="text-lg text-muted-foreground">/ 100</span>
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-mono text-muted-foreground uppercase">Nivel de Ascensión</p>
              <p className="text-2xl font-display font-bold text-blue-400">{currentAscension}</p>
            </div>
            
            <Button 
              onClick={handleAscend}
              disabled={!canAscend || isAscending}
              className={`w-full py-6 text-lg font-display tracking-widest uppercase clip-diagonal ${canAscend ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-muted text-muted-foreground'}`}
            >
              {isAscending ? 'Ascendiendo...' : canAscend ? 'Ascender (Cuesta Nivel 100)' : 'Requiere Nivel 100'}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-panel border-cyan-500/30 clip-card">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Flame className="w-5 h-5" /> Árbol de Alma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-sm font-mono text-muted-foreground uppercase">Puntos de Alma Disponibles</p>
              <p className="text-3xl font-display font-bold text-cyan-400">{soulPoints}</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-cyan-500/20 bg-background/40 clip-diagonal flex justify-between items-center">
                <div>
                  <p className="font-bold text-white flex items-center gap-2"><Swords className="w-4 h-4 text-red-400"/> Daño Global</p>
                  <p className="text-xs font-mono text-muted-foreground">+{soulTree.globalDamage * 5}% Daño Base</p>
                </div>
                <Button 
                  onClick={() => upgradeSoulTree('globalDamage')}
                  disabled={soulPoints <= 0}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                >
                  Mejorar (1 PA)
                </Button>
              </div>

              <div className="p-4 border border-cyan-500/20 bg-background/40 clip-diagonal flex justify-between items-center">
                <div>
                  <p className="font-bold text-white flex items-center gap-2"><Coins className="w-4 h-4 text-yellow-400"/> Fortuna Eterna</p>
                  <p className="text-xs font-mono text-muted-foreground">+{soulTree.obolosMultiplier * 5}% Óbolos</p>
                </div>
                <Button 
                  onClick={() => upgradeSoulTree('obolosMultiplier')}
                  disabled={soulPoints <= 0}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                >
                  Mejorar (1 PA)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
