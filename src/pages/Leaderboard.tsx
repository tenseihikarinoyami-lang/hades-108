import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Flag, Shield, Flame } from 'lucide-react';
import { audio } from '@/lib/audio';

interface UserScore {
  uid: string;
  specterName: string;
  photoURL: string;
  score: number;
  role: string;
  faction?: string;
}

const FACTION_COLORS: Record<string, string> = {
  'Wyvern': 'text-purple-500 border-purple-500 bg-purple-500/10',
  'Griffon': 'text-blue-500 border-blue-500 bg-blue-500/10',
  'Garuda': 'text-orange-500 border-orange-500 bg-orange-500/10',
};

export const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<UserScore[]>([]);
  const [factionScores, setFactionScores] = useState<Record<string, number>>({
    'Wyvern': 0,
    'Griffon': 0,
    'Garuda': 0
  });

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('score', 'desc'),
          limit(50) // Fetch more to calculate faction scores
        );
        const snapshot = await getDocs(q);
        const data: UserScore[] = [];
        const fScores = { 'Wyvern': 0, 'Griffon': 0, 'Garuda': 0 };

        snapshot.forEach(doc => {
          const user = doc.data() as UserScore;
          data.push(user);
          if (user.faction && fScores[user.faction as keyof typeof fScores] !== undefined) {
            fScores[user.faction as keyof typeof fScores] += user.score;
          }
        });
        
        setLeaders(data.slice(0, 10)); // Only show top 10 in individual
        setFactionScores(fScores);
      } catch (error) {
        console.error("Error fetching leaders:", error);
      }
    };
    fetchLeaders();
  }, []);

  const totalFactionScore = (Object.values(factionScores) as number[]).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="max-w-4xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Muro de los Lamentos
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Clasificación Global del Inframundo</p>
      </div>

      {/* Faction War Section */}
      <Card className="glass-panel border-accent/30 clip-card relative overflow-hidden">
        <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
        <CardHeader className="border-b border-accent/10 pb-6">
          <CardTitle className="font-display text-2xl text-white flex items-center gap-3 uppercase tracking-widest">
            <Flag className="w-6 h-6 text-accent" /> Guerra de los 3 Jueces
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          {(Object.entries(factionScores) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([faction, score], idx) => {
            const percentage = (score / totalFactionScore) * 100;
            const colorClass = FACTION_COLORS[faction] || 'text-accent border-accent bg-accent/10';
            const colorBase = colorClass.split(' ')[0].replace('text-', ''); // e.g., purple-500
            
            return (
              <div key={faction} className="space-y-2 relative group" onMouseEnter={() => audio.playSFX('hover')}>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center clip-hex border ${colorClass.split(' ')[1]} ${colorClass.split(' ')[2]}`}>
                      <span className={`font-display font-bold ${colorClass.split(' ')[0]}`}>{idx + 1}</span>
                    </div>
                    <span className="font-display text-xl text-white tracking-wider uppercase">Ejército de {faction}</span>
                  </div>
                  <span className={`font-mono font-bold text-xl ${colorClass.split(' ')[0]}`}>{score} PTS</span>
                </div>
                <div className="h-4 bg-background border border-accent/30 rounded-sm overflow-hidden clip-diagonal relative">
                  <div 
                    className={`h-full bg-${colorBase} shadow-[0_0_10px_currentColor] transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Individual Leaderboard */}
      <Card className="glass-panel border-accent/30 clip-card relative overflow-hidden">
        <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
        <CardHeader className="border-b border-accent/10 pb-6">
          <CardTitle className="font-display text-2xl text-white flex items-center gap-3 uppercase tracking-widest">
            <Trophy className="w-6 h-6 text-accent" /> Top 10 Espectros
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {leaders.map((leader, idx) => {
            const isTop3 = idx < 3;
            const factionColor = leader.faction ? FACTION_COLORS[leader.faction]?.split(' ')[0] : 'text-accent';
            
            return (
              <div 
                key={leader.uid} 
                className={`flex items-center gap-4 p-4 bg-background/40 border transition-all duration-300 clip-diagonal group hover:bg-accent/10 ${isTop3 ? 'border-accent/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border-accent/20 hover:border-accent/40'}`}
                onMouseEnter={() => audio.playSFX('hover')}
              >
                <div className={`text-3xl font-display font-bold w-12 text-center ${isTop3 ? 'text-accent neon-text-accent' : 'text-muted-foreground'}`}>
                  {idx + 1}
                </div>
                
                <div className="relative">
                  {isTop3 && <div className="absolute inset-0 bg-accent/20 blur-md rounded-full animate-pulse" />}
                  <Avatar className={`w-14 h-14 border-2 clip-hex relative z-10 ${isTop3 ? 'border-accent' : 'border-accent/50'}`}>
                    <AvatarImage src={leader.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-accent font-display text-xl">
                      {leader.specterName?.[0] || 'E'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white tracking-wider uppercase group-hover:text-accent transition-colors">
                    {leader.specterName || 'Espectro Desconocido'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground font-mono uppercase flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {leader.role}
                    </span>
                    {leader.faction && (
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border rounded-sm ${FACTION_COLORS[leader.faction]}`}>
                        {leader.faction}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-display font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                    {leader.score}
                  </div>
                  <div className="text-[10px] text-accent font-mono tracking-widest uppercase">Puntos</div>
                </div>
              </div>
            );
          })}
          
          {leaders.length === 0 && (
            <div className="text-center text-muted-foreground py-12 font-mono uppercase tracking-widest border border-dashed border-accent/30 clip-diagonal">
              La matriz de datos está vacía.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
