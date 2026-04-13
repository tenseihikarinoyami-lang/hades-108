import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dog, Bird, Flame, Zap, Shield, Star, Heart } from 'lucide-react';
import { audio } from '@/lib/audio';
import { motion } from 'motion/react';

const PET_TEMPLATES = [
  { id: 'cerbero', name: 'Cerbero Infernal', type: 'Violencia', bonus: '+10% Daño', icon: Dog, color: 'text-red-500', cost: 5000 },
  { id: 'fenix', name: 'Fénix de las Sombras', type: 'Supervivencia', bonus: '+20% Vida', icon: Bird, color: 'text-orange-500', cost: 5000 },
  { id: 'dragon', name: 'Dragón del Cocytos', type: 'Sabiduría', bonus: '+5s Tiempo', icon: Flame, color: 'text-blue-500', cost: 5000 },
];

export const Pets: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isAdopting, setIsAdopting] = useState(false);

  const handleAdopt = async (template: typeof PET_TEMPLATES[0]) => {
    if (!user || !profile) return;
    if ((profile.obolos || 0) < template.cost) {
      toast.error("No tienes suficientes Óbolos.");
      return;
    }

    setIsAdopting(true);
    audio.playSFX('success');
    try {
      await updateProfile({
        obolos: (profile.obolos || 0) - template.cost,
        pet: {
          id: template.id,
          name: template.name,
          level: 1,
          xp: 0,
          type: template.type
        }
      });
      toast.success(`¡Has adoptado a ${template.name}!`);
    } catch (error) {
      toast.error("Error al adoptar.");
    } finally {
      setIsAdopting(false);
    }
  };

  const handleLevelUp = async () => {
    if (!user || !profile?.pet) return;
    // Simple level up for demo
    const newLevel = profile.pet.level + 1;
    audio.playSFX('success');
    await updateProfile({
      pet: {
        ...profile.pet,
        level: newLevel,
        xp: 0
      }
    });
    toast.success(`¡Tu mascota ha subido al nivel ${newLevel}!`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <Dog className="w-16 h-16 text-accent mx-auto animate-bounce" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Familiares del Abismo
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Compañeros de Batalla</p>
      </div>

      {profile?.pet ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Pet */}
          <Card className="glass-panel border-accent/30 clip-card overflow-hidden">
            <CardHeader className="border-b border-accent/10 bg-accent/5">
              <CardTitle className="flex items-center gap-3 uppercase tracking-widest text-white">
                <Star className="w-5 h-5 text-yellow-400" /> Mascota Activa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center space-y-6">
              <div className="w-32 h-32 rounded-full border-4 border-accent/30 flex items-center justify-center bg-accent/5 relative">
                <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full animate-pulse" />
                {profile.pet.id === 'cerbero' && <Dog className="w-16 h-16 text-red-500 relative z-10" />}
                {profile.pet.id === 'fenix' && <Bird className="w-16 h-16 text-orange-500 relative z-10" />}
                {profile.pet.id === 'dragon' && <Flame className="w-16 h-16 text-blue-500 relative z-10" />}
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-display font-bold text-white uppercase">{profile.pet.name}</h3>
                <p className="text-sm font-mono text-accent">Nivel {profile.pet.level} - {profile.pet.type}</p>
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between text-[10px] font-mono uppercase">
                  <span className="text-muted-foreground">Vínculo de Alma</span>
                  <span className="text-accent">{profile.pet.xp} / 1000 XP</span>
                </div>
                <div className="h-2 bg-background border border-accent/20 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[10%] shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="p-3 bg-background/40 border border-accent/10 rounded-sm text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-mono">Bono Actual</p>
                  <p className="text-sm font-bold text-white">
                    {PET_TEMPLATES.find(t => t.id === profile.pet?.id)?.bonus}
                  </p>
                </div>
                <div className="p-3 bg-background/40 border border-accent/10 rounded-sm text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-mono">Habilidad</p>
                  <p className="text-sm font-bold text-accent">Activa</p>
                </div>
              </div>

              <Button 
                onClick={handleLevelUp}
                className="w-full bg-accent hover:bg-accent/80 text-white clip-diagonal uppercase tracking-widest"
              >
                Entrenar Mascota
              </Button>
            </CardContent>
          </Card>

          {/* Pet Stats/Lore */}
          <Card className="glass-panel border-accent/30 clip-card">
            <CardHeader className="border-b border-accent/10">
              <CardTitle className="uppercase tracking-widest text-white text-lg">Habilidades de Compañero</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-background/40 border border-accent/10 rounded-sm">
                  <Zap className="w-6 h-6 text-yellow-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase">Rugido del Abismo</h4>
                    <p className="text-xs text-muted-foreground mt-1">Aumenta el daño de tu siguiente respuesta correcta en un 50%.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-background/40 border border-accent/10 rounded-sm">
                  <Shield className="w-6 h-6 text-blue-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase">Escudo de Sombras</h4>
                    <p className="text-xs text-muted-foreground mt-1">Tu mascota bloquea el primer error que cometas en cada ronda.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-background/40 border border-accent/10 rounded-sm">
                  <Heart className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase">Vínculo Vital</h4>
                    <p className="text-xs text-muted-foreground mt-1">Recuperas 5 HP por cada 3 respuestas correctas consecutivas.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PET_TEMPLATES.map((pet) => (
            <Card key={pet.id} className="glass-panel border-accent/20 hover:border-accent transition-all clip-card group">
              <CardContent className="p-8 text-center space-y-6">
                <div className={`w-24 h-24 mx-auto rounded-full border-2 border-accent/20 flex items-center justify-center bg-accent/5 group-hover:scale-110 transition-transform`}>
                  <pet.icon className={`w-12 h-12 ${pet.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest">{pet.name}</h3>
                  <p className="text-xs font-mono text-accent mt-1">{pet.bonus}</p>
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  {pet.id === 'cerbero' ? 'El guardián de las puertas, su ferocidad no tiene límites.' : 
                   pet.id === 'fenix' ? 'Renace de las cenizas para proteger a su amo.' : 
                   'Un dragón ancestral que manipula el flujo del tiempo.'}
                </p>
                <div className="pt-4">
                  <Button 
                    onClick={() => handleAdopt(pet)}
                    disabled={isAdopting || (profile.obolos || 0) < pet.cost}
                    className="w-full bg-accent hover:bg-accent/80 text-white clip-diagonal uppercase tracking-widest"
                  >
                    Adoptar ({pet.cost} Óbolos)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
