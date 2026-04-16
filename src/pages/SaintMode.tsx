import React, { useMemo, useState } from 'react';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { BookOpen, Lock, Shield, Star } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getLegendChapterTrivia } from '@/data/nonArenaTriviaBank';
import { audio } from '@/lib/audio';
import { getCombatContext } from '@/lib/combat';
import { db } from '@/lib/firebase';
import { type GeneratedTrivia } from '@/lib/gemini';
import { rollLoot } from '@/lib/rpg';

const SAGAS = [
  { id: 'lost_canvas', name: 'The Lost Canvas', chapters: 5, difficulty: 'Facil' },
  { id: 'sanctuary', name: 'Saga del Santuario', chapters: 12, difficulty: 'Media' },
  { id: 'asgard', name: 'Saga de Asgard', chapters: 7, difficulty: 'Media' },
  { id: 'poseidon', name: 'Saga de Poseidon', chapters: 7, difficulty: 'Dificil' },
  { id: 'hades', name: 'Saga de Hades', chapters: 10, difficulty: 'Extrema' },
  { id: 'soul_of_gold', name: 'Soul of Gold', chapters: 12, difficulty: 'Divina' },
] as const;

type SagaDefinition = (typeof SAGAS)[number];

const getChapterDamageTaken = (difficulty: string) => {
  if (difficulty === 'Divina') return 45;
  if (difficulty === 'Extrema') return 40;
  if (difficulty === 'Dificil') return 35;
  return 28;
};

export const SaintMode: React.FC = () => {
  const { user, profile } = useAuth();
  const { activeSpecter, bonuses: combatBonuses } = useMemo(() => getCombatContext(profile), [profile]);
  const [gameState, setGameState] = useState<'map' | 'playing' | 'result'>('map');
  const [selectedSaga, setSelectedSaga] = useState<SagaDefinition>(SAGAS[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [chapterBossHealth, setChapterBossHealth] = useState(100);
  const [specterBarrierCharges, setSpecterBarrierCharges] = useState(0);
  const [lastResultWon, setLastResultWon] = useState(false);

  const progress = profile?.saintModeProgress || { saga: 'lost_canvas', chapter: 1 };
  const maxPlayerHealth = 100 + combatBonuses.bonusHealth;

  const getSagaIndex = (sagaId: string) => SAGAS.findIndex((saga) => saga.id === sagaId);
  const currentSagaIndex = getSagaIndex(progress.saga);

  const startChapter = async (saga: SagaDefinition, chapter: number) => {
    setIsGenerating(true);
    const generated = getLegendChapterTrivia(saga.id, chapter, saga.chapters, saga.difficulty, 5);

    if (generated.length === 0) {
      toast.error('Error al cargar el capitulo.');
      setIsGenerating(false);
      return;
    }

    setQuestions(generated);
    setCurrentQ(0);
    setPlayerHealth(maxPlayerHealth);
    setChapterBossHealth(100);
    setSelectedSaga(saga);
    setSelectedChapter(chapter);
    setSpecterBarrierCharges(combatBonuses.startingShields);
    setLastResultWon(false);
    setGameState('playing');
    setIsGenerating(false);
    audio.playSFX('click');
  };

  const finishChapter = async (won: boolean) => {
    setLastResultWon(won);
    setGameState('result');

    if (!won || !user || !profile) {
      toast.error('Has sido derrotado en este capitulo.');
      return;
    }

    const docRef = doc(db, 'users', user.uid);
    const updates: Record<string, unknown> = {
      obolos: increment(Math.floor(500 * (getSagaIndex(selectedSaga.id) + 1) * combatBonuses.obolosMultiplier)),
    };

    let nextSagaId = progress.saga;
    let nextChapter = progress.chapter;

    if (selectedSaga.id === progress.saga && selectedChapter === progress.chapter) {
      if (selectedChapter < selectedSaga.chapters) {
        nextChapter += 1;
      } else {
        const nextSagaIndex = getSagaIndex(selectedSaga.id) + 1;
        if (nextSagaIndex < SAGAS.length) {
          nextSagaId = SAGAS[nextSagaIndex].id;
          nextChapter = 1;
        }

        const loot = rollLoot(true);
        const bonusLoot = Math.random() < combatBonuses.lootChanceBonus ? rollLoot(true) : null;
        if (loot) {
          updates.gearInventory = bonusLoot ? arrayUnion(loot, bonusLoot) : arrayUnion(loot);
          toast.success(`Saga completada. Recompensa: ${loot.name}`);
        }

        const title = `Heroe de ${selectedSaga.name}`;
        if (!profile.titles?.includes(title)) {
          updates.titles = arrayUnion(title);
        }
      }

      updates.saintModeProgress = { saga: nextSagaId, chapter: nextChapter };
    }

    await updateDoc(docRef, updates);
    toast.success('Capitulo superado.');
  };

  const advanceChapter = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((previous) => previous + 1);
      return;
    }

    void finishChapter(chapterBossHealth <= 0);
  };

  const handleAnswer = (selectedIndex: number) => {
    const question = questions[currentQ];
    const isCorrect = selectedIndex === question.answer;

    if (isCorrect) {
      audio.playSFX('success');
      const nextBossHealth = Math.max(0, chapterBossHealth - 25);
      setChapterBossHealth(nextBossHealth);
      if (nextBossHealth <= 0) {
        setChapterBossHealth(0);
        void finishChapter(true);
        return;
      }
      advanceChapter();
      return;
    }

    if (specterBarrierCharges > 0) {
      setSpecterBarrierCharges((current) => Math.max(0, current - 1));
      toast.info(activeSpecter?.ability.name ? `La habilidad ${activeSpecter.ability.name} bloqueo el golpe.` : 'Barrera espectral activada.');
      audio.playSFX('shield');
      advanceChapter();
      return;
    }

    if (Math.random() < combatBonuses.dodgeChance) {
      toast.success(activeSpecter?.ability.name ? `${activeSpecter.ability.name}: evasion perfecta.` : 'Evasion exitosa.');
      audio.playSFX('success');
      advanceChapter();
      return;
    }

    audio.playSFX('damage');
    const nextPlayerHealth = Math.max(0, playerHealth - getChapterDamageTaken(selectedSaga.difficulty));
    setPlayerHealth(nextPlayerHealth);

    if (nextPlayerHealth <= 0) {
      void finishChapter(false);
      return;
    }

    advanceChapter();
  };

  if (gameState === 'map') {
    return (
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <BookOpen className="w-16 h-16 text-yellow-500 mx-auto animate-pulse" />
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 neon-text-accent uppercase tracking-[0.2em]">
            Modo Leyenda
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Cronicas de los Santos</p>
        </div>

        {activeSpecter && (
          <div className="max-w-2xl mx-auto bg-background/50 border border-cyan-500/20 p-4 clip-diagonal text-left space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">Habilidad del Espectro</p>
            <p className="font-display text-lg text-white">{activeSpecter.ability.name}</p>
            <p className="text-xs font-mono text-muted-foreground">{activeSpecter.ability.description}</p>
          </div>
        )}

        <div className="space-y-8">
          {SAGAS.map((saga, index) => {
            const isUnlocked = index <= currentSagaIndex;
            const isCurrentSaga = index === currentSagaIndex;

            return (
              <Card key={saga.id} className={`glass-panel clip-card relative overflow-hidden transition-all ${isUnlocked ? 'border-yellow-500/30' : 'border-muted/30 opacity-50'}`}>
                <CardHeader className={`border-b bg-background/40 ${isUnlocked ? 'border-yellow-500/20' : 'border-muted/20'}`}>
                  <CardTitle className="font-display text-2xl text-white tracking-widest uppercase flex items-center justify-between">
                    <span>{saga.name}</span>
                    {!isUnlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="text-xs uppercase tracking-[0.3em] font-mono text-yellow-300">
                    Dificultad base: {saga.difficulty}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {Array.from({ length: saga.chapters }).map((_, indexChapter) => {
                      const chapterNum = indexChapter + 1;
                      const isChapterUnlocked = isUnlocked && (!isCurrentSaga || chapterNum <= progress.chapter);
                      const isCompleted = index < currentSagaIndex || (isCurrentSaga && chapterNum < progress.chapter);

                      return (
                        <Button
                          key={chapterNum}
                          onClick={() => void startChapter(saga, chapterNum)}
                          disabled={!isChapterUnlocked || isGenerating}
                          variant={isCompleted ? 'default' : 'outline'}
                          className={`w-16 h-16 clip-diagonal font-display text-xl ${
                            isCompleted
                              ? 'bg-yellow-600/50 text-yellow-200 border-yellow-500/50'
                              : isChapterUnlocked
                                ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/20'
                                : 'border-muted text-muted-foreground'
                          }`}
                        >
                          {chapterNum}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const question = questions[currentQ];
    if (!question) return null;

    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-8 px-4 py-2 bg-background/80 border border-yellow-500/50 clip-diagonal">
          <span className="font-mono text-yellow-400">{selectedSaga.name} - Cap. {selectedChapter}</span>
          <span className="font-mono text-cyan-300">Barreras: {specterBarrierCharges}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2 p-4 bg-background/70 border border-emerald-500/20 clip-diagonal">
            <div className="flex justify-between text-[11px] uppercase tracking-widest font-mono text-emerald-300">
              <span>Vida del Espectro</span>
              <span>{Math.max(0, playerHealth)} / {maxPlayerHealth}</span>
            </div>
            <div className="h-4 bg-background border border-emerald-500/30 overflow-hidden clip-diagonal">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300" style={{ width: `${(Math.max(0, playerHealth) / Math.max(maxPlayerHealth, 1)) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-2 p-4 bg-background/70 border border-red-500/20 clip-diagonal">
            <div className="flex justify-between text-[11px] uppercase tracking-widest font-mono text-red-300">
              <span>Vida del Jefe</span>
              <span>{chapterBossHealth}%</span>
            </div>
            <div className="h-4 bg-background border border-red-500/30 overflow-hidden clip-diagonal">
              <div className="h-full bg-gradient-to-r from-red-700 to-orange-500 transition-all duration-300" style={{ width: `${chapterBossHealth}%` }} />
            </div>
          </div>
        </div>

        <Card className="glass-panel border-yellow-500/50 clip-card p-8 relative overflow-hidden">
          <div className="mb-4 text-center text-[10px] uppercase tracking-[0.3em] font-mono text-muted-foreground">
            Cronica {currentQ + 1} / {questions.length}
          </div>
          <h3 className="text-xl font-sans font-bold text-white mb-8 text-center relative z-10">{question.q}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 text-lg font-sans tracking-wide border-yellow-500/30 hover:border-yellow-400 hover:bg-yellow-500/20 transition-all clip-diagonal"
                onClick={() => handleAnswer(index)}
              >
                {option}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 relative z-10">
        {lastResultWon ? <Star className="w-24 h-24 text-yellow-400 mx-auto" /> : <Shield className="w-24 h-24 text-red-500 mx-auto" />}
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">
          {lastResultWon ? 'Capitulo Superado' : 'Derrota'}
        </h2>
        <div className="p-6 glass-panel border-yellow-500/30 clip-card text-left space-y-3">
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Vida restante</span>
            <span className="text-emerald-300">{Math.max(0, playerHealth)}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Vida del jefe</span>
            <span className="text-red-300">{chapterBossHealth}</span>
          </div>
          <div className="flex justify-between text-sm font-mono">
            <span className="text-muted-foreground">Barreras restantes</span>
            <span className="text-cyan-300">{specterBarrierCharges}</span>
          </div>
        </div>
        <Button onClick={() => setGameState('map')} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver al Mapa
        </Button>
      </div>
    );
  }

  return null;
};
