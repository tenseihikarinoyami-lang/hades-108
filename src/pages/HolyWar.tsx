import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Users, Trophy } from 'lucide-react';
import { UserProfile } from '@/context/AuthContext';

export const HolyWar: React.FC = () => {
  const [factionScores, setFactionScores] = useState({
    Wyvern: 0,
    Griffon: 0,
    Garuda: 0
  });
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        
        const scores = { Wyvern: 0, Griffon: 0, Garuda: 0 };
        let total = 0;

        snapshot.forEach((doc) => {
          const data = doc.data() as UserProfile;
          if (data.faction && (data.faction === 'Wyvern' || data.faction === 'Griffon' || data.faction === 'Garuda')) {
            scores[data.faction] += (data.score || 0);
            total += (data.score || 0);
          }
        });

        setFactionScores(scores);
        setTotalScore(total);
      } catch (error) {
        console.error("Error fetching faction scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const getPercentage = (score: number) => {
    if (totalScore === 0) return 0;
    return (score / totalScore) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <Swords className="w-16 h-16 text-primary mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary neon-text-primary uppercase tracking-[0.2em]">
          Guerra Santa
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">El dominio del Inframundo está en juego</p>
      </div>

      <Card className="glass-panel border-primary/30 clip-card relative overflow-hidden">
        <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
        <CardHeader className="border-b border-primary/20 bg-background/40 text-center">
          <CardTitle className="font-display text-2xl text-white tracking-widest uppercase flex items-center justify-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" /> Poder Total Acumulado
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-12">
          {loading ? (
            <div className="text-center py-12 text-primary font-mono animate-pulse">Calculando el poder de los ejércitos...</div>
          ) : (
            <>
              {/* Wyvern */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-900/50 border border-red-500 clip-hex flex items-center justify-center">
                      <Users className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-white tracking-widest uppercase">Ejército de Wyvern</h3>
                      <p className="text-xs font-mono text-red-400">Estrella de la Ferocidad</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl text-white">{factionScores.Wyvern.toLocaleString()}</div>
                    <div className="text-xs font-mono text-muted-foreground">{getPercentage(factionScores.Wyvern).toFixed(1)}% del dominio</div>
                  </div>
                </div>
                <div className="h-3 w-full bg-background border border-red-900/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)] transition-all duration-1000" 
                    style={{ width: `${getPercentage(factionScores.Wyvern)}%` }} 
                  />
                </div>
              </div>

              {/* Griffon */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-900/50 border border-purple-500 clip-hex flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-white tracking-widest uppercase">Ejército de Griffon</h3>
                      <p className="text-xs font-mono text-purple-400">Estrella de la Nobleza</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl text-white">{factionScores.Griffon.toLocaleString()}</div>
                    <div className="text-xs font-mono text-muted-foreground">{getPercentage(factionScores.Griffon).toFixed(1)}% del dominio</div>
                  </div>
                </div>
                <div className="h-3 w-full bg-background border border-purple-900/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000" 
                    style={{ width: `${getPercentage(factionScores.Griffon)}%` }} 
                  />
                </div>
              </div>

              {/* Garuda */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-900/50 border border-orange-500 clip-hex flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-white tracking-widest uppercase">Ejército de Garuda</h3>
                      <p className="text-xs font-mono text-orange-400">Estrella de la Velocidad</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl text-white">{factionScores.Garuda.toLocaleString()}</div>
                    <div className="text-xs font-mono text-muted-foreground">{getPercentage(factionScores.Garuda).toFixed(1)}% del dominio</div>
                  </div>
                </div>
                <div className="h-3 w-full bg-background border border-orange-900/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-1000" 
                    style={{ width: `${getPercentage(factionScores.Garuda)}%` }} 
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
