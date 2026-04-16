import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { CalendarRange, Flag, Flame, ScrollText, Shield, Trophy } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentWeeklyEvent } from '@/data/weeklyEvents';
import { audio } from '@/lib/audio';
import { db } from '@/lib/firebase';
import { getSeasonalRankings, type SeasonalEntry } from '@/lib/seasons';

interface UserScore {
  uid: string;
  specterName: string;
  photoURL: string;
  score: number;
  role: string;
  faction?: string;
}

const FACTION_COLORS: Record<string, string> = {
  Wyvern: 'text-purple-500 border-purple-500 bg-purple-500/10',
  Griffon: 'text-blue-500 border-blue-500 bg-blue-500/10',
  Garuda: 'text-orange-500 border-orange-500 bg-orange-500/10',
};

export const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<UserScore[]>([]);
  const [seasonLeaders, setSeasonLeaders] = useState<SeasonalEntry[]>([]);
  const [topSpecters, setTopSpecters] = useState<Array<{ specterName: string; users: number; totalScore: number }>>([]);
  const [factionScores, setFactionScores] = useState<Record<string, number>>({
    Wyvern: 0,
    Griffon: 0,
    Garuda: 0,
  });
  const weeklyEvent = getCurrentWeeklyEvent();

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('score', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const data: UserScore[] = [];
        const fScores = { Wyvern: 0, Griffon: 0, Garuda: 0 };

        snapshot.forEach((docSnapshot) => {
          const user = docSnapshot.data() as UserScore;
          data.push(user);
          if (user.faction && fScores[user.faction as keyof typeof fScores] !== undefined) {
            fScores[user.faction as keyof typeof fScores] += user.score || 0;
          }
        });

        setLeaders(data.slice(0, 10));
        setFactionScores(fScores);
        setTopSpecters(
          Object.values(
            data.reduce<Record<string, { specterName: string; users: number; totalScore: number }>>((accumulator, user) => {
              const key = user.specterName || 'Sin Espectro';
              if (!accumulator[key]) {
                accumulator[key] = { specterName: key, users: 0, totalScore: 0 };
              }
              accumulator[key].users += 1;
              accumulator[key].totalScore += user.score || 0;
              return accumulator;
            }, {})
          )
            .sort((left, right) => right.totalScore - left.totalScore)
            .slice(0, 5)
        );
        setSeasonLeaders(await getSeasonalRankings(5));
      } catch (error) {
        console.error('Error fetching leaders:', error);
      }
    };

    void fetchLeaders();
  }, []);

  const totalFactionScore = (Object.values(factionScores) as number[]).reduce((left, right) => left + right, 0) || 1;

  return (
    <div className="max-w-5xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Muro de los Lamentos
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Clasificacion global del Inframundo</p>
      </div>

      <Card className={`glass-panel border-accent/20 clip-card bg-gradient-to-r ${weeklyEvent.color}`}>
        <CardHeader>
          <CardTitle className="font-display text-lg text-white flex items-center gap-2">
            <CalendarRange className="w-5 h-5" /> Semana activa: {weeklyEvent.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-white/80 text-sm">{weeklyEvent.description}</p>
          <p className="text-xs font-mono text-accent">Bonos: {weeklyEvent.bonuses.join(' | ')}</p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-accent/30 clip-card relative overflow-hidden">
        <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
        <CardHeader className="border-b border-accent/10 pb-6">
          <CardTitle className="font-display text-2xl text-white flex items-center gap-3 uppercase tracking-widest">
            <Flag className="w-6 h-6 text-accent" /> Guerra de los 3 Jueces
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          {(Object.entries(factionScores) as [string, number][]).sort((left, right) => right[1] - left[1]).map(([faction, score], idx) => {
            const percentage = (score / totalFactionScore) * 100;
            const colorClass = FACTION_COLORS[faction] || 'text-accent border-accent bg-accent/10';
            const colorBase = colorClass.split(' ')[0].replace('text-', '');

            return (
              <div key={faction} className="space-y-2 relative group" onMouseEnter={() => audio.playSFX('hover')}>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center clip-hex border ${colorClass.split(' ')[1]} ${colorClass.split(' ')[2]}`}>
                      <span className={`font-display font-bold ${colorClass.split(' ')[0]}`}>{idx + 1}</span>
                    </div>
                    <span className="font-display text-xl text-white tracking-wider uppercase">Ejercito de {faction}</span>
                  </div>
                  <span className={`font-mono font-bold text-xl ${colorClass.split(' ')[0]}`}>{score} PTS</span>
                </div>
                <div className="h-4 bg-background border border-accent/30 rounded-sm overflow-hidden clip-diagonal relative">
                  <div className={`h-full bg-${colorBase} shadow-[0_0_10px_currentColor] transition-all duration-1000`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel border-accent/20 clip-card">
          <CardHeader className="border-b border-accent/10">
            <CardTitle className="font-display text-xl text-white flex items-center gap-2 uppercase tracking-widest">
              <ScrollText className="w-5 h-5 text-accent" /> Temporada Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {seasonLeaders.length === 0 ? (
              <div className="text-sm text-muted-foreground font-mono">Aun no hay registros de temporada.</div>
            ) : (
              seasonLeaders.map((leader) => (
                <div key={leader.uid} className="flex justify-between items-center border border-accent/10 bg-background/40 p-3 clip-diagonal">
                  <div>
                    <div className="font-display text-white">{leader.rank}. {leader.specterName}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Ranking mensual</div>
                  </div>
                  <div className="text-accent font-mono">{leader.score}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-accent/20 clip-card">
          <CardHeader className="border-b border-accent/10">
            <CardTitle className="font-display text-xl text-white flex items-center gap-2 uppercase tracking-widest">
              <Flame className="w-5 h-5 text-accent" /> Ranking por Espectro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {topSpecters.map((specter, index) => (
              <div key={specter.specterName} className="flex justify-between items-center border border-accent/10 bg-background/40 p-3 clip-diagonal">
                <div>
                  <div className="font-display text-white">{index + 1}. {specter.specterName}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{specter.users} portadores</div>
                </div>
                <div className="text-accent font-mono">{specter.totalScore}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
                  <div className="text-3xl font-display font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{leader.score}</div>
                  <div className="text-[10px] text-accent font-mono tracking-widest uppercase">Puntos</div>
                </div>
              </div>
            );
          })}

          {leaders.length === 0 && (
            <div className="text-center text-muted-foreground py-12 font-mono uppercase tracking-widest border border-dashed border-accent/30 clip-diagonal">
              La matriz de datos esta vacia.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
