import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Star, Shield, Zap, Sparkles, ArrowUpCircle } from 'lucide-react';
import { audio } from '@/lib/audio';
import { CLASS_BONUSES, SpecterClass, getXPForNextLevel } from '@/lib/rpg';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AURAS = [
  { id: 'none', name: 'Sin Aura', cost: 0, color: 'text-white', effect: '' },
  { id: 'blue_flame', name: 'Llamas Azules', cost: 5, color: 'text-blue-400', effect: 'shadow-[0_0_15px_rgba(96,165,250,0.8)]' },
  { id: 'crimson_blood', name: 'Sangre Carmesí', cost: 10, color: 'text-red-500', effect: 'shadow-[0_0_15px_rgba(239,68,68,0.8)]' },
  { id: 'golden_divine', name: 'Divinidad Dorada', cost: 25, color: 'text-yellow-400', effect: 'shadow-[0_0_20px_rgba(250,204,21,0.8)]' },
  { id: 'void_darkness', name: 'Oscuridad del Vacío', cost: 50, color: 'text-purple-600', effect: 'shadow-[0_0_25px_rgba(147,51,234,0.8)]' },
];

export const Cosmos: React.FC = () => {
  const { user, profile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!profile) return null;

  const currentLevel = profile.level || 1;
  const currentXP = profile.xp || 0;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const xpProgress = (currentXP / nextLevelXP) * 100;

  const handleClassSelect = async (specterClass: SpecterClass) => {
    if (!user || isUpdating) return;
    if (profile.specterClass === specterClass) return;

    setIsUpdating(true);
    audio.playSFX('click');
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { specterClass });
      toast.success(`Has despertado como ${CLASS_BONUSES[specterClass].name}`);
    } catch (error) {
      toast.error("Error al cambiar de clase.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSkillUpgrade = async (skill: 'survival' | 'destruction' | 'fortune') => {
    if (!user || isUpdating) return;
    if ((profile.cosmosPoints || 0) <= 0) {
      toast.error("No tienes Puntos de Cosmos suficientes.");
      return;
    }

    setIsUpdating(true);
    audio.playSFX('success');
    try {
      const currentSkills = profile.skills || { survival: 0, destruction: 0, fortune: 0 };
      const newSkills = { ...currentSkills, [skill]: currentSkills[skill] + 1 };
      
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { 
        skills: newSkills,
        cosmosPoints: (profile.cosmosPoints || 0) - 1
      });
      toast.success("Habilidad mejorada.");
    } catch (error) {
      toast.error("Error al mejorar habilidad.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAuraSelect = async (auraId: string, cost: number) => {
    if (!user || isUpdating) return;
    if (profile.activeAura === auraId) return;
    
    if ((profile.cosmosPoints || 0) < cost) {
      toast.error("No tienes Puntos de Cosmos suficientes.");
      return;
    }

    setIsUpdating(true);
    audio.playSFX('success');
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { 
        activeAura: auraId,
        cosmosPoints: (profile.cosmosPoints || 0) - cost
      });
      toast.success(`Aura ${auraId} activada.`);
    } catch (error) {
      toast.error("Error al activar aura.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <Star className="w-16 h-16 text-purple-400 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 neon-text-accent uppercase tracking-[0.2em]">
          Altar del Cosmos
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Árbol de Habilidades y Clases</p>
      </div>

      {/* Level & XP Bar */}
      <Card className="glass-panel border-purple-500/30 clip-card">
        <CardContent className="p-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Nivel de Espectro</p>
              <p className="text-4xl font-display font-bold text-white">{currentLevel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-purple-400">XP: {currentXP} / {nextLevelXP}</p>
            </div>
          </div>
          <div className="h-4 bg-background border border-purple-500/50 rounded-sm overflow-hidden clip-diagonal relative">
            <div 
              className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all duration-1000"
              style={{ width: `${Math.min(100, xpProgress)}%` }}
            />
          </div>
          <div className="mt-6 flex items-center gap-2 justify-center">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="font-mono text-lg text-white">Puntos de Cosmos Disponibles: <span className="text-yellow-400 font-bold">{profile.cosmosPoints || 0}</span></span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Classes */}
        <Card className="glass-panel border-accent/30 clip-card">
          <CardHeader className="border-b border-accent/20 bg-background/40">
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" /> Estrella del Mal (Clase)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {(Object.keys(CLASS_BONUSES) as SpecterClass[]).map((cls) => {
              const info = CLASS_BONUSES[cls];
              const isActive = profile.specterClass === cls;
              return (
                <div 
                  key={cls}
                  className={`p-4 border clip-diagonal transition-all cursor-pointer ${isActive ? 'border-accent bg-accent/20' : 'border-accent/20 bg-background/50 hover:border-accent/50'}`}
                  onClick={() => handleClassSelect(cls)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className={`font-bold ${isActive ? 'text-accent' : 'text-white'}`}>{info.name}</h4>
                    {isActive && <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1">ACTIVA</span>}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">{info.desc}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Skill Tree */}
        <Card className="glass-panel border-pink-500/30 clip-card">
          <CardHeader className="border-b border-pink-500/20 bg-background/40">
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase flex items-center gap-2">
              <Zap className="w-5 h-5 text-pink-400" /> Árbol de Habilidades
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Survival */}
            <div className="p-4 border border-pink-500/20 clip-diagonal bg-background/50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" /> Supervivencia
                </h4>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Nivel {profile.skills?.survival || 0} (+{(profile.skills?.survival || 0) * 5}% Evasión)
                </p>
              </div>
              <Button 
                onClick={() => handleSkillUpgrade('survival')}
                disabled={isUpdating || (profile.cosmosPoints || 0) <= 0}
                className="bg-pink-600 hover:bg-pink-500 text-white clip-diagonal h-8 px-3"
              >
                <ArrowUpCircle className="w-4 h-4 mr-1" /> Mejorar
              </Button>
            </div>

            {/* Destruction */}
            <div className="p-4 border border-pink-500/20 clip-diagonal bg-background/50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-400" /> Destrucción
                </h4>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Nivel {profile.skills?.destruction || 0} (+{(profile.skills?.destruction || 0) * 5} Puntos Extra)
                </p>
              </div>
              <Button 
                onClick={() => handleSkillUpgrade('destruction')}
                disabled={isUpdating || (profile.cosmosPoints || 0) <= 0}
                className="bg-pink-600 hover:bg-pink-500 text-white clip-diagonal h-8 px-3"
              >
                <ArrowUpCircle className="w-4 h-4 mr-1" /> Mejorar
              </Button>
            </div>

            {/* Fortune */}
            <div className="p-4 border border-pink-500/20 clip-diagonal bg-background/50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" /> Fortuna
                </h4>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Nivel {profile.skills?.fortune || 0} (+{(profile.skills?.fortune || 0) * 2}% Prob. Botín)
                </p>
              </div>
              <Button 
                onClick={() => handleSkillUpgrade('fortune')}
                disabled={isUpdating || (profile.cosmosPoints || 0) <= 0}
                className="bg-pink-600 hover:bg-pink-500 text-white clip-diagonal h-8 px-3"
              >
                <ArrowUpCircle className="w-4 h-4 mr-1" /> Mejorar
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Auras */}
      <Card className="glass-panel border-yellow-500/30 clip-card">
        <CardHeader className="border-b border-yellow-500/20 bg-background/40">
          <CardTitle className="font-display text-xl text-white tracking-widest uppercase flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" /> Auras de Cosmos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {AURAS.map((aura) => {
              const isActive = profile.activeAura === aura.id;
              const canAfford = (profile.cosmosPoints || 0) >= aura.cost;
              return (
                <div 
                  key={aura.id}
                  className={`p-4 border clip-diagonal transition-all cursor-pointer text-center space-y-3 ${isActive ? 'border-yellow-400 bg-yellow-400/10' : 'border-accent/20 bg-background/50 hover:border-yellow-400/50'}`}
                  onClick={() => handleAuraSelect(aura.id, aura.cost)}
                >
                  <div className={`w-12 h-12 mx-auto rounded-full border-2 ${aura.color} ${aura.effect} flex items-center justify-center`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase ${aura.color}`}>{aura.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">Coste: {aura.cost} CP</p>
                  </div>
                  {isActive && <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 block">EQUIPADA</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
