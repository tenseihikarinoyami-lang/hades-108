import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Lock, CheckCircle2, Star, Coins, Sparkles, Package } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { audio } from '@/lib/audio';

const PASS_REWARDS = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  let reward = { type: 'obolos', amount: 100, name: '100 Óbolos' };
  
  if (level % 10 === 0) reward = { type: 'divine', amount: 1, name: 'Cofre Divino' };
  else if (level % 5 === 0) reward = { type: 'star', amount: 5, name: '5 Fragmentos de Estrella' };
  else if (level % 2 === 0) reward = { type: 'obolos', amount: 250, name: '250 Óbolos' };
  
  return { level, reward, xpRequired: level * 1000 };
});

export const BattlePass: React.FC = () => {
  const { user, profile } = useAuth();

  const handleClaim = async (level: number, reward: any) => {
    if (!user || !profile) return;
    if (profile.passLevel < level) {
      toast.error("Nivel insuficiente.");
      return;
    }
    if (profile.claimedPassRewards?.includes(level)) {
      toast.error("Recompensa ya reclamada.");
      return;
    }

    audio.playSFX('success');
    try {
      const docRef = doc(db, 'users', user.uid);
      const updates: any = {
        claimedPassRewards: arrayUnion(level)
      };

      if (reward.type === 'obolos') updates.obolos = (profile.obolos || 0) + reward.amount;
      if (reward.type === 'star') updates.starFragments = (profile.starFragments || 0) + reward.amount;
      
      await updateDoc(docRef, updates);
      toast.success(`¡Has reclamado: ${reward.name}!`);
    } catch (error) {
      toast.error("Error al reclamar recompensa.");
    }
  };

  const currentXP = profile?.passPoints || 0;
  const currentLevel = profile?.passLevel || 1;
  const nextLevelXP = currentLevel * 1000;
  const progress = (currentXP / nextLevelXP) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-white to-yellow-500 neon-text-accent uppercase tracking-[0.2em]">
          Pase de Batalla: Temporada 1
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">El Despertar de los Espectros</p>
      </div>

      {/* Progress Header */}
      <Card className="glass-panel border-yellow-500/30 clip-card overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="text-4xl font-display font-bold text-yellow-400 mb-2">NIVEL {currentLevel}</div>
              <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                {currentXP} / {nextLevelXP} XP PARA EL SIGUIENTE NIVEL
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="h-4 bg-background border border-yellow-500/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PASS_REWARDS.map((item) => {
          const isUnlocked = currentLevel >= item.level;
          const isClaimed = profile?.claimedPassRewards?.includes(item.level);

          return (
            <Card 
              key={item.level} 
              className={`glass-panel clip-card transition-all duration-300 ${isUnlocked ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-accent/10 opacity-70'}`}
            >
              <CardHeader className="p-4 border-b border-white/5 flex flex-row justify-between items-center">
                <span className="font-mono text-xs text-yellow-400">NIVEL {item.level}</span>
                {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                {isClaimed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </CardHeader>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-background/50 rounded-full flex items-center justify-center border border-white/10">
                  {item.reward.type === 'obolos' && <Coins className="w-8 h-8 text-yellow-400" />}
                  {item.reward.type === 'star' && <Sparkles className="w-8 h-8 text-cyan-400" />}
                  {item.reward.type === 'divine' && <Package className="w-8 h-8 text-purple-500" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{item.reward.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mt-1">Recompensa</div>
                </div>
                <Button
                  className={`w-full clip-diagonal font-display tracking-widest uppercase text-xs ${isUnlocked && !isClaimed ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-background/40'}`}
                  disabled={!isUnlocked || isClaimed}
                  onClick={() => handleClaim(item.level, item.reward)}
                >
                  {isClaimed ? 'Reclamado' : isUnlocked ? 'Reclamar' : 'Bloqueado'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
