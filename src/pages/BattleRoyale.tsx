import React, { useEffect, useMemo, useState } from 'react';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { Crown, Skull, Trophy, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getBattleRoyaleTrivia } from '@/data/nonArenaTriviaBank';
import { audio } from '@/lib/audio';
import { getCombatContext } from '@/lib/combat';
import { db } from '@/lib/firebase';
import { type GeneratedTrivia } from '@/lib/gemini';
import { Equipment, rollLoot } from '@/lib/rpg';

export const BattleRoyale: React.FC = () => {
  const { user, profile } = useAuth();
  const { activeSpecter, activeSetBonus, activeSetEffect, bonuses: combatBonuses } = useMemo(
    () => getCombatContext(profile),
    [profile]
  );

  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [playersLeft, setPlayersLeft] = useState(100);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [placement, setPlacement] = useState(100);
  const [specterBarrierCharges, setSpecterBarrierCharges] = useState(0);
  const [rewardLoot, setRewardLoot] = useState<Equipment[]>([]);
  const [rewardObolos, setRewardObolos] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeOut();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const absorbElimination = () => {
    if (specterBarrierCharges > 0) {
      setSpecterBarrierCharges((current) => Math.max(0, current - 1));
      audio.playSFX('shield');
      toast.info(activeSpecter?.ability.name ? `La habilidad ${activeSpecter.ability.name} evito tu eliminacion.` : 'Barrera espectral activada.');
      return true;
    }

    if (Math.random() < combatBonuses.dodgeChance) {
      audio.playSFX('success');
      toast.success(activeSpecter?.ability.name ? `${activeSpecter.ability.name}: sobreviviste por evasion.` : 'Evasion exitosa.');
      return true;
    }

    return false;
  };

  const joinTournament = async () => {
    setIsGenerating(true);
    const generated = getBattleRoyaleTrivia(1, 10);
    if (generated.length === 0) {
      toast.error('Error al conectar con el servidor del torneo.');
      setIsGenerating(false);
      return;
    }

    setQuestions(generated);
    setCurrentQ(0);
    setPlayersLeft(100);
    setTimeLeft(10 + combatBonuses.bonusTime);
    setSpecterBarrierCharges(combatBonuses.startingShields);
    setRewardLoot([]);
    setRewardObolos(0);
    setGameState('playing');
    setIsGenerating(false);
    audio.playSFX('click');
  };

  const handleTimeOut = () => {
    if (absorbElimination()) {
      moveToNext();
      return;
    }

    audio.playSFX('damage');
    toast.error('Eliminado por tiempo.');
    finishGame(false);
  };

  const handleAnswer = (selectedIndex: number) => {
    const q = questions[currentQ];
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      audio.playSFX('success');
      const dropRate = 0.3 + currentQ * 0.05;
      const newPlayersLeft = Math.max(1, Math.floor(playersLeft * (1 - dropRate)));
      setPlayersLeft(newPlayersLeft);

      if (newPlayersLeft === 1) {
        finishGame(true);
      } else {
        moveToNext();
      }
      return;
    }

    if (absorbElimination()) {
      moveToNext();
      return;
    }

    audio.playSFX('damage');
    toast.error('Respuesta incorrecta. Has sido eliminado.');
    finishGame(false);
  };

  const moveToNext = async () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((current) => current + 1);
      setTimeLeft(10 - Math.min(5, Math.floor(currentQ / 2)) + combatBonuses.bonusTime);
      return;
    }

    setIsGenerating(true);
    const generated = getBattleRoyaleTrivia(currentQ + 2, 5);
    setQuestions(generated);
    setCurrentQ(0);
    setTimeLeft(5 + combatBonuses.bonusTime);
    setIsGenerating(false);
  };

  const finishGame = async (won: boolean) => {
    setPlacement(won ? 1 : playersLeft);
    setGameState('result');

    if (won && user && profile) {
      const loot = rollLoot(true);
      const bonusLoot = Math.random() < combatBonuses.lootChanceBonus ? rollLoot(true) : null;
      const docRef = doc(db, 'users', user.uid);
      const obolosReward = Math.floor(5000 * combatBonuses.obolosMultiplier);

      const updates: Record<string, any> = {
        obolos: increment(obolosReward),
      };

      if (loot && bonusLoot) {
        updates.gearInventory = arrayUnion(loot, bonusLoot);
      } else if (loot) {
        updates.gearInventory = arrayUnion(loot);
      }

      if (!profile.titles?.includes('Sobreviviente Supremo')) {
        updates.titles = arrayUnion('Sobreviviente Supremo');
      }

      setRewardLoot([...(loot ? [loot] : []), ...(bonusLoot ? [bonusLoot] : [])]);
      setRewardObolos(obolosReward);
      await updateDoc(docRef, updates);
      toast.success('Victoria magistral.');
    }
  };

  if (gameState === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 relative z-10 text-center mt-20">
        <Trophy className="w-24 h-24 text-yellow-400 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 neon-text-accent uppercase tracking-[0.2em]">
          Torneo de Supervivencia
        </h1>
        <p className="text-muted-foreground font-mono max-w-xl mx-auto">
          100 Espectros entran. Solo 1 sale vivo. Responde rapido y sin errores. El ultimo en pie se lleva la gloria eterna y tesoros divinos.
        </p>
        {activeSpecter && (
          <div className="max-w-2xl mx-auto bg-background/50 border border-cyan-500/20 p-4 clip-diagonal text-left space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">Habilidad del Espectro</p>
            <p className="font-display text-lg text-white">{activeSpecter.ability.name}</p>
            <p className="text-xs font-mono text-muted-foreground">{activeSpecter.ability.description}</p>
          </div>
        )}
        {activeSetEffect && (
          <div className="max-w-2xl mx-auto bg-background/50 border border-yellow-500/20 p-4 clip-diagonal text-left space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-400">Bono de Set Activo</p>
            <p className="font-display text-lg text-white">{activeSetEffect.title}</p>
            <p className="text-xs font-mono text-muted-foreground">{activeSetEffect.description}</p>
          </div>
        )}
        <Button
          onClick={joinTournament}
          disabled={isGenerating}
          className="bg-yellow-600 hover:bg-yellow-500 text-white font-display tracking-widest uppercase clip-diagonal py-6 px-12 text-xl mt-8"
        >
          {isGenerating ? 'Buscando Partida...' : 'Unirse al Torneo'}
        </Button>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = questions[currentQ];
    if (!q) return null;

    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-8 px-4 py-2 bg-background/80 border border-yellow-500/50 clip-diagonal">
          <span className="font-mono text-yellow-400 flex items-center gap-2">
            <Users className="w-4 h-4" /> Vivos: {playersLeft}/100
          </span>
          <span className={`font-mono ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>Tiempo: {timeLeft}s</span>
          <span className="font-mono text-cyan-300">
            {specterBarrierCharges > 0 ? `Barreras: ${specterBarrierCharges}` : activeSpecter?.ability.name || 'Sin barrera'}
          </span>
        </div>

        <Card className="glass-panel border-yellow-500/50 clip-card p-8 relative overflow-hidden">
          <h3 className="text-xl font-sans font-bold text-white mb-8 text-center relative z-10">{q.q}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {q.options.map((opt, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto py-4 text-lg font-sans tracking-wide border-yellow-500/30 hover:border-yellow-400 hover:bg-yellow-500/20 transition-all clip-diagonal"
                onClick={() => handleAnswer(idx)}
              >
                {opt}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'result') {
    const won = placement === 1;
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-8 relative z-10">
        {won ? <Crown className="w-24 h-24 text-yellow-400 mx-auto" /> : <Skull className="w-24 h-24 text-red-500 mx-auto" />}
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">
          {won ? 'Victoria Magistral' : 'Eliminado'}
        </h2>
        <div className="glass-panel border-yellow-500/20 clip-card p-6 text-left space-y-3">
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Posicion final</span>
            <span className="text-white">#{placement}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Barreras restantes</span>
            <span className="text-cyan-400">{specterBarrierCharges}</span>
          </div>
          {won && (
            <>
              <div className="flex justify-between text-sm font-mono">
                <span className="text-muted-foreground">Obolos ganados</span>
                <span className="text-yellow-400">{rewardObolos}</span>
              </div>
              <div className="space-y-2 pt-2 border-t border-yellow-500/10">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Recompensas</div>
                {rewardLoot.length === 0 ? (
                  <div className="text-sm font-mono text-muted-foreground">No hubo reliquias adicionales.</div>
                ) : (
                  rewardLoot.map((item) => (
                    <div key={item.id} className="text-sm font-mono text-white">{item.name}</div>
                  ))
                )}
              </div>
            </>
          )}
          {activeSetEffect && (
            <div className="pt-2 border-t border-yellow-500/10">
              <div className="text-xs uppercase tracking-widest text-yellow-400">{activeSetBonus}</div>
              <div className="text-sm text-white">{activeSetEffect.title}</div>
            </div>
          )}
        </div>

        <Button onClick={() => setGameState('lobby')} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver al Lobby
        </Button>
      </div>
    );
  }

  return null;
};
