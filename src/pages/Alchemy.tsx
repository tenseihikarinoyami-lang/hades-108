import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FlaskConical, Clock, Eye, Heart, Coins, Sparkles } from 'lucide-react';
import { audio } from '@/lib/audio';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const RECIPES = {
  time_potion: {
    id: 'time_potion',
    name: 'Poción de Cronos',
    desc: 'Otorga +10 segundos en una pregunta.',
    icon: <Clock className="w-8 h-8 text-blue-400" />,
    cost: { obolos: 100, starFragments: 1 }
  },
  clairvoyance_potion: {
    id: 'clairvoyance_potion',
    name: 'Ojo de las Moiras',
    desc: 'Revela la respuesta correcta inmediatamente.',
    icon: <Eye className="w-8 h-8 text-purple-400" />,
    cost: { obolos: 300, starFragments: 3 }
  },
  healing_potion: {
    id: 'healing_potion',
    name: 'Lágrima de Atenea',
    desc: 'Restaura 50 HP en combate.',
    icon: <Heart className="w-8 h-8 text-green-400" />,
    cost: { obolos: 150, starFragments: 2 }
  }
};

export const Alchemy: React.FC = () => {
  const { user, profile } = useAuth();
  const [isCrafting, setIsCrafting] = useState(false);

  const handleCraft = async (potionId: keyof typeof RECIPES) => {
    if (!user || !profile || isCrafting) return;
    
    const recipe = RECIPES[potionId];
    if ((profile.obolos || 0) < recipe.cost.obolos || (profile.starFragments || 0) < recipe.cost.starFragments) {
      toast.error("Materiales insuficientes.");
      audio.playSFX('error');
      return;
    }

    setIsCrafting(true);
    audio.playSFX('success'); // Maybe a bubbling sound later
    try {
      const currentConsumables = profile.consumables || { time_potion: 0, clairvoyance_potion: 0, healing_potion: 0 };
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        obolos: (profile.obolos || 0) - recipe.cost.obolos,
        starFragments: (profile.starFragments || 0) - recipe.cost.starFragments,
        [`consumables.${potionId}`]: (currentConsumables[potionId] || 0) + 1
      });
      toast.success(`Has creado: ${recipe.name}`);
    } catch (error) {
      toast.error("La alquimia ha fallado.");
    } finally {
      setIsCrafting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <FlaskConical className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 neon-text-accent uppercase tracking-[0.2em]">
          Laboratorio Alquímico
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Creación de Consumibles</p>
      </div>

      <div className="flex justify-center gap-8 mb-8">
        <div className="flex items-center gap-2 bg-background/50 border border-yellow-500/30 px-4 py-2 clip-diagonal">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="font-mono text-white">{profile?.obolos || 0}</span>
        </div>
        <div className="flex items-center gap-2 bg-background/50 border border-cyan-500/30 px-4 py-2 clip-diagonal">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="font-mono text-white">{profile?.starFragments || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(RECIPES) as Array<keyof typeof RECIPES>).map((key) => {
          const recipe = RECIPES[key];
          const canCraft = (profile?.obolos || 0) >= recipe.cost.obolos && (profile?.starFragments || 0) >= recipe.cost.starFragments;
          const owned = profile?.consumables?.[key] || 0;

          return (
            <Card key={key} className="glass-panel border-green-500/30 clip-card relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 to-transparent pointer-events-none" />
              <CardHeader className="text-center border-b border-green-500/20 bg-background/40">
                <div className="mx-auto bg-background/80 p-4 rounded-full border border-green-500/30 w-20 h-20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {recipe.icon}
                </div>
                <CardTitle className="font-display text-xl text-white tracking-widest uppercase">
                  {recipe.name}
                </CardTitle>
                <p className="text-xs font-mono text-muted-foreground mt-2 h-8">{recipe.desc}</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className={`text-xs font-mono ${canCraft ? 'text-white' : 'text-red-400'}`}>{recipe.cost.obolos}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className={`text-xs font-mono ${canCraft ? 'text-white' : 'text-red-400'}`}>{recipe.cost.starFragments}</span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-xs font-mono text-green-400">En inventario: {owned}</span>
                </div>

                <Button 
                  onClick={() => handleCraft(key)}
                  disabled={!canCraft || isCrafting}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-display tracking-widest uppercase clip-diagonal"
                >
                  {isCrafting ? 'Transmutando...' : 'Crear'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
