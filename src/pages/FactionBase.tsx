import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Castle, Hammer, Shield, Zap, Star, Flame, Skull } from 'lucide-react';
import { audio } from '@/lib/audio';
import { motion } from 'motion/react';

interface FactionBaseData {
  level: number;
  xp: number;
  nextLevelXp: number;
  bonuses: {
    damage: number;
    defense: number;
    obolos: number;
  };
  resources: {
    stardust: number;
    shadowEssence: number;
    primordialOre: number;
  };
}

const INITIAL_BASE: FactionBaseData = {
  level: 1,
  xp: 0,
  nextLevelXp: 1000,
  bonuses: {
    damage: 0,
    defense: 0,
    obolos: 0
  },
  resources: {
    stardust: 0,
    shadowEssence: 0,
    primordialOre: 0
  }
};

export const FactionBase: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [baseData, setBaseData] = useState<FactionBaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.faction) return;

    const unsub = onSnapshot(doc(db, 'faction_bases', profile.faction), (snapshot) => {
      if (snapshot.exists()) {
        setBaseData(snapshot.data() as FactionBaseData);
      } else {
        setDoc(doc(db, 'faction_bases', profile.faction), INITIAL_BASE);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [profile?.faction]);

  const handleDonate = async (resource: 'stardust' | 'shadowEssence' | 'primordialOre', amount: number) => {
    if (!user || !profile || !profile.faction || !baseData) return;

    const currentAmount = profile.materials?.[resource] || 0;
    if (currentAmount < amount) {
      toast.error("No tienes suficientes materiales.");
      return;
    }

    audio.playSFX('click');
    try {
      const xpGain = amount * (resource === 'stardust' ? 1 : resource === 'shadowEssence' ? 5 : 10);
      
      // Update User
      await updateProfile({
        materials: {
          ...profile.materials!,
          [resource]: currentAmount - amount
        },
        score: (profile.score || 0) + xpGain
      });

      // Update Faction Base
      const baseRef = doc(db, 'faction_bases', profile.faction);
      let newXp = baseData.xp + xpGain;
      let newLevel = baseData.level;
      let newNextXp = baseData.nextLevelXp;
      let newBonuses = { ...baseData.bonuses };

      while (newXp >= newNextXp) {
        newXp -= newNextXp;
        newLevel++;
        newNextXp = Math.floor(newNextXp * 1.5);
        newBonuses.damage += 1;
        newBonuses.defense += 1;
        newBonuses.obolos += 0.5;
        toast.success(`¡La Base de ${profile.faction} ha subido al nivel ${newLevel}!`);
      }

      await updateDoc(baseRef, {
        xp: newXp,
        level: newLevel,
        nextLevelXp: newNextXp,
        bonuses: newBonuses,
        [`resources.${resource}`]: increment(amount)
      });

      toast.success(`Has donado ${amount} de ${resource}. ¡La facción te lo agradece!`);
    } catch (error) {
      console.error("Error donating:", error);
      toast.error("Error al procesar la donación.");
    }
  };

  if (!profile?.faction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Shield className="w-20 h-20 text-muted-foreground animate-pulse" />
        <h2 className="text-2xl font-display uppercase tracking-widest text-center">
          Debes unirte a una facción para acceder a la Base
        </h2>
      </div>
    );
  }

  if (loading || !baseData) {
    return <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin neon-border" />
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <Castle className="w-16 h-16 text-accent mx-auto" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-widest">
          Base de {profile.faction}
        </h1>
        <p className="text-muted-foreground font-mono uppercase tracking-widest">Nivel {baseData.level} - Fortificación del Inframundo</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress & Bonuses */}
        <Card className="lg:col-span-2 glass-panel border-accent/30 clip-card overflow-hidden">
          <CardHeader className="border-b border-accent/10">
            <CardTitle className="flex items-center gap-2 uppercase tracking-widest text-white">
              <Zap className="w-5 h-5 text-yellow-400" /> Progreso de la Fortaleza
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-mono uppercase">
                <span className="text-muted-foreground">Experiencia de Base</span>
                <span className="text-accent">{baseData.xp} / {baseData.nextLevelXp} XP</span>
              </div>
              <div className="h-4 bg-background border border-accent/20 rounded-sm overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(baseData.xp / baseData.nextLevelXp) * 100}%` }}
                  className="h-full bg-accent neon-border shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-accent/5 border border-accent/20 clip-diagonal text-center space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-mono">Bono de Daño</p>
                <p className="text-2xl font-display text-red-500">+{baseData.bonuses.damage}%</p>
              </div>
              <div className="p-4 bg-accent/5 border border-accent/20 clip-diagonal text-center space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-mono">Bono de Defensa</p>
                <p className="text-2xl font-display text-blue-500">+{baseData.bonuses.defense}%</p>
              </div>
              <div className="p-4 bg-accent/5 border border-accent/20 clip-diagonal text-center space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-mono">Bono de Óbolos</p>
                <p className="text-2xl font-display text-yellow-500">+{baseData.bonuses.obolos}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Panel */}
        <Card className="glass-panel border-accent/30 clip-card">
          <CardHeader className="border-b border-accent/10">
            <CardTitle className="flex items-center gap-2 uppercase tracking-widest text-white text-lg">
              <Hammer className="w-5 h-5 text-orange-500" /> Contribuir
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background/40 border border-accent/10 rounded-sm">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-xs font-bold text-white uppercase">Polvo de Estrellas</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{profile.materials?.stardust || 0} disponibles</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-[10px] clip-diagonal"
                  onClick={() => handleDonate('stardust', 10)}
                  disabled={(profile.materials?.stardust || 0) < 10}
                >
                  Donar 10
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-background/40 border border-accent/10 rounded-sm">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-xs font-bold text-white uppercase">Esencia de Sombra</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{profile.materials?.shadowEssence || 0} disponibles</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-[10px] clip-diagonal"
                  onClick={() => handleDonate('shadowEssence', 5)}
                  disabled={(profile.materials?.shadowEssence || 0) < 5}
                >
                  Donar 5
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-background/40 border border-accent/10 rounded-sm">
                <div className="flex items-center gap-3">
                  <Skull className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-xs font-bold text-white uppercase">Mineral Primordial</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{profile.materials?.primordialOre || 0} disponibles</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-[10px] clip-diagonal"
                  onClick={() => handleDonate('primordialOre', 1)}
                  disabled={(profile.materials?.primordialOre || 0) < 1}
                >
                  Donar 1
                </Button>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground font-mono italic text-center">
              "Cada material fortalece los cimientos de nuestro imperio en el Inframundo."
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
