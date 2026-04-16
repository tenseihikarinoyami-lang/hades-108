import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BookOpen, Star, Lock, Shield, Swords, ArrowRight } from 'lucide-react';
import { audio } from '@/lib/audio';
import { arrayUnion, doc, updateDoc, increment } from 'firebase/firestore';
import { getCombatContext } from '@/lib/combat';
import { db } from '@/lib/firebase';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { rollLoot } from '@/lib/rpg';

const SAGAS = [
  { id: 'lost_canvas', name: 'The Lost Canvas', chapters: 5, difficulty: 'FÃ¡cil' },
  { id: 'sanctuary', name: 'Saga del Santuario', chapters: 12, difficulty: 'Media' },
  { id: 'asgard', name: 'Saga de Asgard', chapters: 7, difficulty: 'Media' },
  { id: 'poseidon', name: 'Saga de PoseidÃ³n', chapters: 7, difficulty: 'DifÃ­cil' },
  { id: 'hades', name: 'Saga de Hades', chapters: 10, difficulty: 'Extrema' },
  { id: 'soul_of_gold', name: 'Soul of Gold', chapters: 12, difficulty: 'Divina' }
];

export const SaintMode: React.FC = () => {
  const { user, profile } = useAuth();
  const { activeSpecter, bonuses: combatBonuses } = useMemo(() => getCombatContext(profile), [profile]);
  const [gameState, setGameState] = useState<'map' | 'playing' | 'result'>('map');
  const [selectedSaga, setSelectedSaga] = useState(SAGAS[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [health, setHealth] = useState(100);
  const [specterBarrierCharges, setSpecterBarrierCharges] = useState(0);

  const progress = profile?.saintModeProgress || { saga: 'lost_canvas', chapter: 1 };

  const getSagaIndex = (sagaId: string) => SAGAS.findIndex(s => s.id === sagaId);
  const currentSagaIndex = getSagaIndex(progress.saga);

  const startChapter = async (saga: typeof SAGAS[0], chapter: number) => {
    setIsGenerating(true);
    // Generate questions specific to the saga
    const prompt = `Preguntas sobre Saint Seiya, especÃ­ficamente de la ${saga.name}, capÃ­tulo/parte ${chapter}. Dificultad: ${saga.difficulty}.`;
    const generated = await generateInfiniteTrivia(prompt, 5); // 5 questions per chapter
    
    if (generated.length === 0) {
      toast.error("Error al cargar el capÃ­tulo.");
      setIsGenerating(false);
      return;
    }

    setQuestions(generated);
    setCurrentQ(0);
    setHealth(100 + combatBonuses.bonusHealth);
    setSelectedSaga(saga);
    setSelectedChapter(chapter);
    setSpecterBarrierCharges(combatBonuses.startingShields);
    setGameState('playing');
    setIsGenerating(false);
    audio.playSFX('click');
  };

  const handleAnswer = (selectedIndex: number) => {
    const q = questions[currentQ];
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      audio.playSFX('success');
      if (currentQ + 1 < questions.length) {
        setCurrentQ(prev => prev + 1);
      } else {
        finishChapter(true);
      }
    } else {
      if (specterBarrierCharges > 0) {
        setSpecterBarrierCharges((current) => Math.max(0, current - 1));
        toast.info(activeSpecter?.ability.name ? `La habilidad ${activeSpecter.ability.name} bloqueo el golpe.` : "Barrera espectral activada.");
        audio.playSFX('shield');
        if (currentQ + 1 < questions.length) {
          setCurrentQ(prev => prev + 1);
        } else {
          finishChapter(true);
        }
        return;
      }

      if (Math.random() < combatBonuses.dodgeChance) {
        toast.success(activeSpecter?.ability.name ? `${activeSpecter.ability.name}: evasion perfecta.` : 'Evasion exitosa.');
        audio.playSFX('success');
        if (currentQ + 1 < questions.length) {
          setCurrentQ(prev => prev + 1);
        } else {
          finishChapter(true);
        }
        return;
      }

      audio.playSFX('damage');
      const damage = selectedSaga.difficulty === 'Divina' ? 50 : selectedSaga.difficulty === 'Extrema' ? 40 : 30;
      setHealth(h => h - damage);
      if (health - damage <= 0) {
        finishChapter(false);
      } else {
        if (currentQ + 1 < questions.length) {
          setCurrentQ(prev => prev + 1);
        } else {
          finishChapter(true);
        }
      }
    }
  };

  const finishChapter = async (won: boolean) => {
    setGameState('result');
    if (won && user && profile) {
      const docRef = doc(db, 'users', user.uid);
      const updates: any = {
        obolos: increment(Math.floor((500 * (getSagaIndex(selectedSaga.id) + 1)) * combatBonuses.obolosMultiplier))
      };

      // Progress logic
      let nextSagaId = progress.saga;
      let nextChapter = progress.chapter;

      if (selectedSaga.id === progress.saga && selectedChapter === progress.chapter) {
        if (selectedChapter < selectedSaga.chapters) {
          nextChapter++;
        } else {
          // Finished Saga
          const nextSagaIndex = getSagaIndex(selectedSaga.id) + 1;
          if (nextSagaIndex < SAGAS.length) {
            nextSagaId = SAGAS[nextSagaIndex].id;
            nextChapter = 1;
          }
          
          // Saga completion reward
          const loot = rollLoot(true); // Boss loot
          const bonusLoot = Math.random() < combatBonuses.lootChanceBonus ? rollLoot(true) : null;
          if (loot) {
            updates.gearInventory = bonusLoot ? arrayUnion(loot, bonusLoot) : arrayUnion(loot);
            toast.success(`Â¡Saga Completada! Recompensa: ${loot.name}`);
          }
          const title = `HÃ©roe de ${selectedSaga.name}`;
          if (!profile.titles?.includes(title)) {
            updates.titles = arrayUnion(title);
          }
        }
        updates.saintModeProgress = { saga: nextSagaId, chapter: nextChapter };
      }
      await updateDoc(docRef, updates);
      toast.success("Â¡CapÃ­tulo superado!");
    } else {
      toast.error("Has sido derrotado en este capÃ­tulo.");
    }
  };

  if (gameState === 'map') {
    return (
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <BookOpen className="w-16 h-16 text-yellow-500 mx-auto animate-pulse" />
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 neon-text-accent uppercase tracking-[0.2em]">
            Modo Leyenda
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">CrÃ³nicas de los Santos</p>
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
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    {Array.from({ length: saga.chapters }).map((_, i) => {
                      const chapterNum = i + 1;
                      const isChapterUnlocked = isUnlocked && (!isCurrentSaga || chapterNum <= progress.chapter);
                      const isCompleted = index < currentSagaIndex || (isCurrentSaga && chapterNum < progress.chapter);

                      return (
                        <Button
                          key={chapterNum}
                          onClick={() => startChapter(saga, chapterNum)}
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
    const q = questions[currentQ];
    if (!q) return null;
    
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-8 px-4 py-2 bg-background/80 border border-yellow-500/50 clip-diagonal">
          <span className="font-mono text-yellow-400">{selectedSaga.name} - Cap. {selectedChapter}</span>
          <span className="font-mono text-green-400">HP: {health}{specterBarrierCharges > 0 ? ` | Barreras: ${specterBarrierCharges}` : ''}</span>
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
    const won = health > 0;
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 relative z-10">
        {won ? <Star className="w-24 h-24 text-yellow-400 mx-auto" /> : <Shield className="w-24 h-24 text-red-500 mx-auto" />}
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">
          {won ? 'CapÃ­tulo Superado' : 'Derrota'}
        </h2>
        <Button onClick={() => setGameState('map')} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver al Mapa
        </Button>
      </div>
    );
  }

  return null;
};

