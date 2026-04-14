import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Map, Shield, Swords, Coins, Sparkles } from 'lucide-react';
import { audio } from '@/lib/audio';
import { doc, updateDoc, onSnapshot, increment, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Prison {
  id: string;
  name: string;
  bonusDesc: string;
  control: {
    Wyvern: number;
    Griffon: number;
    Garuda: number;
  };
}

const INITIAL_PRISONS: Record<string, Prison> = {
  'prison_1': { id: 'prison_1', name: '1ra Prisión: El Tribunal', bonusDesc: '+10% XP en Arena', control: { Wyvern: 0, Griffon: 0, Garuda: 0 } },
  'prison_2': { id: 'prison_2', name: '2da Prisión: Valle del Viento Negro', bonusDesc: '+5% Óbolos', control: { Wyvern: 0, Griffon: 0, Garuda: 0 } },
  'prison_3': { id: 'prison_3', name: '3ra Prisión: Cueva del Cíclope', bonusDesc: '-20% Costo de Forja', control: { Wyvern: 0, Griffon: 0, Garuda: 0 } },
  'prison_4': { id: 'prison_4', name: '4ta Prisión: Río de Sangre', bonusDesc: '+5% Prob. Botín', control: { Wyvern: 0, Griffon: 0, Garuda: 0 } },
  'prison_5': { id: 'prison_5', name: '5ta Prisión: Tumbas Ardientes', bonusDesc: '+10% Daño en Incursiones', control: { Wyvern: 0, Griffon: 0, Garuda: 0 } },
};

export const Territories: React.FC = () => {
  const { user, profile } = useAuth();
  const [prisons, setPrisons] = useState<Record<string, Prison>>(INITIAL_PRISONS);
  const [isDonating, setIsDonating] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'game_state', 'territories'), (docSnap) => {
      if (docSnap.exists()) {
        setPrisons(docSnap.data() as Record<string, Prison>);
      } else {
        // Initialize if not exists
        setDoc(doc(db, 'game_state', 'territories'), INITIAL_PRISONS);
      }
    });
    return () => unsub();
  }, []);

  const handleDonate = async (prisonId: string, amount: number) => {
    if (!user || !profile || !profile.faction) {
      toast.error("Debes pertenecer a una facción.");
      return;
    }
    if ((profile.obolos || 0) < amount) {
      toast.error("Óbolos insuficientes.");
      return;
    }

    setIsDonating(true);
    audio.playSFX('click');
    try {
      // Deduct from user
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { obolos: increment(-amount) });

      // Add to territory
      const terrRef = doc(db, 'game_state', 'territories');
      await updateDoc(terrRef, {
        [`${prisonId}.control.${profile.faction}`]: increment(amount)
      });

      toast.success(`Has donado ${amount} Óbolos a la causa de ${profile.faction}.`);
    } catch (error) {
      toast.error("Error al donar.");
    } finally {
      setIsDonating(false);
    }
  };

  const getControllingFaction = (prison: Prison) => {
    let max = -1;
    let leader = 'Ninguna';
    for (const [faction, score] of Object.entries(prison.control)) {
      if (score > max) {
        max = score;
        leader = faction;
      } else if (score === max && score > 0) {
        leader = 'Empate';
      }
    }
    return leader;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <Map className="w-16 h-16 text-orange-500 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 neon-text-accent uppercase tracking-[0.2em]">
          Guerra de Territorios
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Control del Inframundo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.values(prisons) as Prison[]).map((prison) => {
          const leader = getControllingFaction(prison);
          const isMyFactionLeading = leader === profile?.faction;

          return (
            <Card key={prison.id} className={`glass-panel clip-card relative overflow-hidden transition-all ${isMyFactionLeading ? 'border-accent shadow-[0_0_15px_rgba(var(--accent),0.2)]' : 'border-accent/20'}`}>
              <CardHeader className="border-b border-accent/20 bg-background/40">
                <CardTitle className="font-display text-lg text-white tracking-widest uppercase">
                  {prison.name}
                </CardTitle>
                <p className="text-xs font-mono text-accent">{prison.bonusDesc}</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="space-y-2">
                  <p className="text-xs font-mono text-muted-foreground uppercase text-center">Control Actual</p>
                  <p className={`text-center font-bold text-lg ${leader === 'Wyvern' ? 'text-red-500' : leader === 'Griffon' ? 'text-blue-500' : leader === 'Garuda' ? 'text-yellow-500' : 'text-white'}`}>
                    {leader}
                  </p>
                </div>

                <div className="space-y-2">
                  {(['Wyvern', 'Griffon', 'Garuda'] as const).map(f => (
                    <div key={f} className="flex justify-between text-xs font-mono">
                      <span className={f === profile?.faction ? 'text-white font-bold' : 'text-muted-foreground'}>{f}</span>
                      <span className="text-accent">{prison.control[f]} pts</span>
                    </div>
                  ))}
                </div>

                {profile?.faction && (
                  <div className="pt-4 border-t border-accent/20">
                    <p className="text-xs font-mono text-center mb-2 text-muted-foreground">Donar Óbolos</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleDonate(prison.id, 100)}
                        disabled={isDonating || (profile.obolos || 0) < 100}
                        variant="outline"
                        className="flex-1 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20 clip-diagonal text-xs"
                      >
                        100
                      </Button>
                      <Button 
                        onClick={() => handleDonate(prison.id, 500)}
                        disabled={isDonating || (profile.obolos || 0) < 500}
                        variant="outline"
                        className="flex-1 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20 clip-diagonal text-xs"
                      >
                        500
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
