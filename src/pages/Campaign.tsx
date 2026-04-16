import React, { useMemo, useState } from 'react';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { Flame, Lock, Map, Shield, Star, Swords } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getCampaignLevelTrivia } from '@/data/nonArenaTriviaBank';
import { audio } from '@/lib/audio';
import { getCombatContext } from '@/lib/combat';
import { db } from '@/lib/firebase';
import { type GeneratedTrivia } from '@/lib/gemini';
import { rollLoot } from '@/lib/rpg';

type CampaignLevel = {
  id: number;
  name: string;
  topic: string;
  difficulty: string;
};

type CampaignSaga = {
  name: string;
  icon: typeof Map;
  color: string;
  accent: string;
  inverse?: boolean;
  bossPhases?: boolean;
  levels: CampaignLevel[];
};

const SAGAS: Record<'descenso' | 'titanes' | 'ira', CampaignSaga> = {
  descenso: {
    name: 'El Descenso',
    icon: Map,
    color: 'from-purple-400 via-pink-500 to-purple-400',
    accent: 'purple-500',
    levels: [
      { id: 1, name: 'Las Puertas del Infierno', topic: 'Mitologia Griega Basica', difficulty: 'Facil' },
      { id: 2, name: 'El Rio Aqueronte', topic: 'Rios del Inframundo', difficulty: 'Facil' },
      { id: 3, name: 'El Tribunal de Minos', topic: 'Jueces del Inframundo', difficulty: 'Media' },
      { id: 4, name: 'Prision de los Avaros', topic: 'Castigos Mitologicos', difficulty: 'Media' },
      { id: 5, name: 'El Muro de los Lamentos', topic: 'Dioses Primordiales', difficulty: 'Dificil' },
      { id: 6, name: 'Campos Eliseos', topic: 'Heroes Griegos', difficulty: 'Dificil' },
      { id: 7, name: 'Templo de Hades', topic: 'Hades y Persefone', difficulty: 'Extrema' },
    ],
  },
  titanes: {
    name: 'El Despertar de los Titanes',
    icon: Flame,
    color: 'from-orange-500 via-red-600 to-orange-500',
    accent: 'orange-500',
    inverse: true,
    levels: [
      { id: 1, name: 'Prision de Cronos', topic: 'Titanes y Gigantes', difficulty: 'Facil' },
      { id: 2, name: 'El Oceano de Tetis', topic: 'Dioses Preolimpicos', difficulty: 'Media' },
      { id: 3, name: 'La Forja de los Ciclopes', topic: 'Armas Legendarias', difficulty: 'Media' },
      { id: 4, name: 'El Trono de Rea', topic: 'Genealogia Divina', difficulty: 'Dificil' },
      { id: 5, name: 'El Abismo de Tartaro', topic: 'Monstruos Primordiales', difficulty: 'Extrema' },
    ],
  },
  ira: {
    name: 'La Ira de los Dioses',
    icon: Swords,
    color: 'from-red-500 via-yellow-600 to-red-500',
    accent: 'red-500',
    bossPhases: true,
    levels: [
      { id: 1, name: 'El Juicio de Zeus', topic: 'Rayo y Justicia', difficulty: 'Media' },
      { id: 2, name: 'La Furia de Poseidon', topic: 'Mares y Terremotos', difficulty: 'Dificil' },
      { id: 3, name: 'El Dominio de Hades', topic: 'Muerte y Riqueza', difficulty: 'Dificil' },
      { id: 4, name: 'La Sabiduria de Atenea', topic: 'Guerra y Estrategia', difficulty: 'Extrema' },
      { id: 5, name: 'El Olimpo en Llamas', topic: 'Caos Divino', difficulty: 'Extrema' },
    ],
  },
};

const getDamageTaken = (difficulty: string) => {
  if (difficulty === 'Extrema') return 50;
  if (difficulty === 'Dificil') return 40;
  return 30;
};

export const Campaign: React.FC = () => {
  const { user, profile } = useAuth();
  const { activeSpecter, bonuses: combatBonuses } = useMemo(() => getCombatContext(profile), [profile]);
  const [activeSaga, setActiveSaga] = useState<keyof typeof SAGAS>('descenso');
  const [gameState, setGameState] = useState<'saga-select' | 'map' | 'playing' | 'result'>('saga-select');
  const [selectedLevel, setSelectedLevel] = useState<CampaignLevel>(SAGAS.descenso.levels[0]);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [guardianHealth, setGuardianHealth] = useState(100);
  const [bossPhase, setBossPhase] = useState(1);
  const [specterBarrierCharges, setSpecterBarrierCharges] = useState(0);
  const [lastResultWon, setLastResultWon] = useState(false);

  const progress = profile?.campaignProgress || 1;
  const maxPlayerHealth = 100 + combatBonuses.bonusHealth;

  const startLevel = async (level: CampaignLevel) => {
    setIsGenerating(true);
    const generated = getCampaignLevelTrivia(activeSaga, level.id, 5, level.difficulty);

    if (generated.length === 0) {
      toast.error('Error al cargar el nivel.');
      setIsGenerating(false);
      return;
    }

    setQuestions(generated);
    setCurrentQ(0);
    setPlayerHealth(maxPlayerHealth);
    setGuardianHealth(100);
    setBossPhase(1);
    setSelectedLevel(level);
    setSpecterBarrierCharges(combatBonuses.startingShields);
    setLastResultWon(false);
    setGameState('playing');
    setIsGenerating(false);
    audio.playSFX('click');
  };

  const finishLevel = async (won: boolean) => {
    setLastResultWon(won);
    setGameState('result');

    if (!won || !user || !profile) {
      toast.error('Has sido derrotado.');
      return;
    }

    const docRef = doc(db, 'users', user.uid);
    const updates: Record<string, unknown> = {
      obolos: increment(Math.floor(1000 * selectedLevel.id * combatBonuses.obolosMultiplier)),
    };

    const saga = SAGAS[activeSaga];
    if (selectedLevel.id === progress) {
      updates.campaignProgress = progress + 1;

      if (selectedLevel.id % 3 === 0 || selectedLevel.id === saga.levels.length) {
        const loot = rollLoot(true);
        const bonusLoot = Math.random() < combatBonuses.lootChanceBonus ? rollLoot(true) : null;
        if (loot) {
          updates.gearInventory = bonusLoot ? arrayUnion(loot, bonusLoot) : arrayUnion(loot);
          toast.success(`Nivel completado. Recompensa: ${loot.name}`);
        }
      }

      const title = `Conquistador de ${saga.name}`;
      if (selectedLevel.id === saga.levels.length && !profile.titles?.includes(title)) {
        updates.titles = arrayUnion(title);
      }
    }

    await updateDoc(docRef, updates);
    toast.success('Nivel superado.');
  };

  const advanceAfterGuard = (wonIfEnd = false) => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((previous) => previous + 1);
      return;
    }

    void finishLevel(wonIfEnd);
  };

  const handleAnswer = async (selectedIndex: number) => {
    const question = questions[currentQ];
    const saga = SAGAS[activeSaga];
    const isInverse = Boolean(saga.inverse);
    const isCorrect = isInverse ? selectedIndex !== question.answer : selectedIndex === question.answer;

    if (isCorrect) {
      audio.playSFX('success');
      const damage = bossPhase === 2 ? 34 : 25;
      const nextGuardianHealth = Math.max(0, guardianHealth - damage);
      setGuardianHealth(nextGuardianHealth);

      if (saga.bossPhases && bossPhase === 1 && nextGuardianHealth <= 50) {
        setBossPhase(2);
        setQuestions((current) => [...current, ...getCampaignLevelTrivia(activeSaga, selectedLevel.id, 3, 'Extrema')]);
        toast.warning('El guardian cambio de fase. La batalla se intensifica.');
      }

      if (nextGuardianHealth <= 0) {
        setGuardianHealth(0);
        void finishLevel(true);
        return;
      }

      advanceAfterGuard(false);
      return;
    }

    if (specterBarrierCharges > 0) {
      setSpecterBarrierCharges((current) => Math.max(0, current - 1));
      toast.info(activeSpecter?.ability.name ? `La habilidad ${activeSpecter.ability.name} bloqueo el golpe.` : 'Barrera espectral activada.');
      audio.playSFX('shield');
      advanceAfterGuard(guardianHealth <= 0);
      return;
    }

    if (Math.random() < combatBonuses.dodgeChance) {
      toast.success(activeSpecter?.ability.name ? `${activeSpecter.ability.name}: evasion perfecta.` : 'Evasion exitosa.');
      audio.playSFX('success');
      advanceAfterGuard(guardianHealth <= 0);
      return;
    }

    audio.playSFX('damage');
    const damageTaken = getDamageTaken(selectedLevel.difficulty);
    const nextPlayerHealth = Math.max(0, playerHealth - damageTaken);
    setPlayerHealth(nextPlayerHealth);

    if (nextPlayerHealth <= 0) {
      void finishLevel(false);
      return;
    }

    advanceAfterGuard(guardianHealth <= 0);
  };

  if (gameState === 'saga-select') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <Map className="w-16 h-16 text-accent mx-auto animate-pulse" />
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
            Cronicas Divinas
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Selecciona una Saga</p>
        </div>

        {activeSpecter && (
          <div className="max-w-2xl mx-auto bg-background/50 border border-cyan-500/20 p-4 clip-diagonal text-left space-y-2 mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">Habilidad del Espectro</p>
            <p className="font-display text-lg text-white">{activeSpecter.ability.name}</p>
            <p className="text-xs font-mono text-muted-foreground">{activeSpecter.ability.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(SAGAS).map(([id, saga]) => (
            <Card
              key={id}
              className="glass-panel border-accent/20 hover:border-accent transition-all cursor-pointer clip-card group"
              onClick={() => {
                setActiveSaga(id as keyof typeof SAGAS);
                setGameState('map');
                audio.playSFX('click');
              }}
            >
              <CardContent className="p-8 text-center space-y-6">
                <saga.icon className={`w-20 h-20 mx-auto transition-transform group-hover:scale-110 ${id === 'descenso' ? 'text-purple-500' : 'text-orange-500'}`} />
                <h3 className={`text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r ${saga.color} uppercase tracking-widest`}>
                  {saga.name}
                </h3>
                {saga.inverse && (
                  <div className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-500 text-[10px] font-mono uppercase tracking-tighter">
                    Mecanica: Trivia inversa
                  </div>
                )}
                <p className="text-sm text-muted-foreground font-sans">
                  {id === 'descenso' ? 'Enfrentate a los guardianes del Inframundo.' : 'Desafia a las fuerzas divinas y titanicas.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'map') {
    const saga = SAGAS[activeSaga];
    return (
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <Button variant="ghost" onClick={() => setGameState('saga-select')} className="text-accent hover:text-white uppercase tracking-widest text-xs mb-4">
            Volver a Sagas
          </Button>
          <saga.icon className={`w-16 h-16 mx-auto animate-pulse ${activeSaga === 'descenso' ? 'text-purple-500' : 'text-orange-500'}`} />
          <h1 className={`text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r ${saga.color} neon-text-accent uppercase tracking-[0.2em]`}>
            {saga.name}
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Campana principal</p>
        </div>

        <div className="space-y-4 relative">
          {saga.levels.map((level) => {
            const isUnlocked = level.id <= progress;
            const isCurrent = level.id === progress;

            return (
              <Card key={level.id} className={`glass-panel relative overflow-hidden transition-all ${isUnlocked ? `border-${saga.accent}/50` : 'border-muted/30 opacity-50'}`}>
                <CardContent className="p-6 flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl border-4 ${isCurrent ? `border-${saga.accent} bg-${saga.accent}/20 text-${saga.accent} shadow-[0_0_15px_rgba(0,240,255,0.5)]` : isUnlocked ? `border-${saga.accent}/50 text-${saga.accent}` : 'border-muted text-muted-foreground'}`}>
                    {level.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">{level.name}</h3>
                    <p className="text-sm font-mono text-muted-foreground">Tema: {level.topic}</p>
                  </div>
                  <div>
                    {isUnlocked ? (
                      <Button onClick={() => void startLevel(level)} disabled={isGenerating} className={`bg-${saga.accent} hover:opacity-80 text-white clip-diagonal uppercase tracking-widest`}>
                        {isGenerating ? 'Cargando...' : 'Entrar'}
                      </Button>
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
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
    const saga = SAGAS[activeSaga];
    const question = questions[currentQ];
    if (!question) return null;

    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className={`flex justify-between items-center mb-8 px-4 py-2 bg-background/80 border border-${saga.accent}/50 clip-diagonal`}>
          <div className="flex items-center gap-4">
            <span className={`font-mono text-${saga.accent}`}>{selectedLevel.name}</span>
            {saga.bossPhases && (
              <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/50 text-red-500 text-[10px] uppercase font-mono">
                Fase {bossPhase}
              </span>
            )}
          </div>
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
              <span>Vida del Guardian</span>
              <span>{guardianHealth}%</span>
            </div>
            <div className="h-4 bg-background border border-red-500/30 overflow-hidden clip-diagonal">
              <div className="h-full bg-gradient-to-r from-red-700 to-orange-500 transition-all duration-300" style={{ width: `${guardianHealth}%` }} />
            </div>
          </div>
        </div>

        {saga.inverse && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-500 text-center font-display uppercase tracking-widest animate-pulse">
            Elige la respuesta incorrecta
          </div>
        )}

        <Card className={`glass-panel border-${saga.accent}/50 clip-card p-8 relative overflow-hidden`}>
          <div className="mb-4 text-center text-[10px] uppercase tracking-[0.3em] font-mono text-muted-foreground">
            Enfrentamiento {currentQ + 1} / {questions.length}
          </div>
          <h3 className="text-xl font-sans font-bold text-white mb-8 text-center relative z-10">{question.q}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto py-4 text-lg font-sans tracking-wide border-${saga.accent}/30 hover:border-${saga.accent} hover:bg-${saga.accent}/20 transition-all clip-diagonal`}
                onClick={() => void handleAnswer(index)}
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
    const saga = SAGAS[activeSaga];
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 relative z-10">
        {lastResultWon ? <Star className={`w-24 h-24 text-${saga.accent} mx-auto`} /> : <Shield className="w-24 h-24 text-red-500 mx-auto" />}
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">
          {lastResultWon ? 'Nivel Superado' : 'Derrota'}
        </h2>
        <div className="glass-panel border-accent/20 clip-card p-5 text-left space-y-2 text-sm font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vida restante</span>
            <span className="text-emerald-300">{Math.max(0, playerHealth)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vida del guardian</span>
            <span className="text-red-300">{guardianHealth}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Barreras restantes</span>
            <span className="text-cyan-300">{specterBarrierCharges}</span>
          </div>
        </div>
        <Button onClick={() => setGameState('map')} className={`w-full bg-${saga.accent} hover:opacity-80 text-white clip-diagonal py-6 uppercase tracking-widest`}>
          Volver al Mapa
        </Button>
      </div>
    );
  }

  return null;
};
