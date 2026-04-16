import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Map, Star, Lock, Shield, Swords, ArrowRight, Flame } from 'lucide-react';
import { audio } from '@/lib/audio';
import { arrayUnion, doc, updateDoc, increment } from 'firebase/firestore';
import { getCombatContext } from '@/lib/combat';
import { db } from '@/lib/firebase';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { rollLoot } from '@/lib/rpg';

const SAGAS = {
  'descenso': {
    name: 'El Descenso',
    icon: Map,
    color: 'from-purple-400 via-pink-500 to-purple-400',
    accent: 'purple-500',
    levels: [
      { id: 1, name: 'Las Puertas del Infierno', topic: 'MitologÃ­a Griega BÃ¡sica', difficulty: 'FÃ¡cil' },
      { id: 2, name: 'El RÃ­o Aqueronte', topic: 'RÃ­os del Inframundo', difficulty: 'FÃ¡cil' },
      { id: 3, name: 'El Tribunal de Minos', topic: 'Jueces del Inframundo', difficulty: 'Media' },
      { id: 4, name: 'PrisiÃ³n de los Avaros', topic: 'Castigos MitolÃ³gicos', difficulty: 'Media' },
      { id: 5, name: 'El Muro de los Lamentos', topic: 'Dioses Primordiales', difficulty: 'DifÃ­cil' },
      { id: 6, name: 'Campos ElÃ­seos', topic: 'HÃ©roes Griegos', difficulty: 'DifÃ­cil' },
      { id: 7, name: 'Templo de Hades', topic: 'Hades y PersÃ©fone', difficulty: 'Extrema' }
    ]
  },
  'titanes': {
    name: 'El Despertar de los Titanes',
    icon: Flame,
    color: 'from-orange-500 via-red-600 to-orange-500',
    accent: 'orange-500',
    inverse: true,
    levels: [
      { id: 1, name: 'PrisiÃ³n de Cronos', topic: 'Titanes y Gigantes', difficulty: 'FÃ¡cil' },
      { id: 2, name: 'El OcÃ©ano de Tetis', topic: 'Dioses Pre-OlÃ­mpicos', difficulty: 'Media' },
      { id: 3, name: 'La Forja de los CÃ­clopes', topic: 'Armas Legendarias', difficulty: 'Media' },
      { id: 4, name: 'El Trono de Rea', topic: 'GenealogÃ­a Divina', difficulty: 'DifÃ­cil' },
      { id: 5, name: 'El Abismo de TÃ¡rtaro', topic: 'Monstruos Primordiales', difficulty: 'Extrema' }
    ]
  },
  'ira': {
    name: 'La Ira de los Dioses',
    icon: Swords,
    color: 'from-red-500 via-yellow-600 to-red-500',
    accent: 'red-500',
    bossPhases: true,
    levels: [
      { id: 1, name: 'El Juicio de Zeus', topic: 'Rayo y Justicia', difficulty: 'Media' },
      { id: 2, name: 'La Furia de PoseidÃ³n', topic: 'Mares y Terremotos', difficulty: 'DifÃ­cil' },
      { id: 3, name: 'El Dominio de Hades', topic: 'Muerte y Riqueza', difficulty: 'DifÃ­cil' },
      { id: 4, name: 'La SabidurÃ­a de Atenea', topic: 'Guerra y Estrategia', difficulty: 'Extrema' },
      { id: 5, name: 'El Olimpo en Llamas', topic: 'Caos Divino', difficulty: 'Extrema' }
    ]
  }
};

export const Campaign: React.FC = () => {
  const { user, profile } = useAuth();
  const { activeSpecter, bonuses: combatBonuses } = useMemo(() => getCombatContext(profile), [profile]);
  const [activeSaga, setActiveSaga] = useState<keyof typeof SAGAS>('descenso');
  const [gameState, setGameState] = useState<'saga-select' | 'map' | 'playing' | 'result'>('saga-select');
  const [selectedLevel, setSelectedLevel] = useState(SAGAS.descenso.levels[0]);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [health, setHealth] = useState(100);
  const [bossPhase, setBossPhase] = useState(1);
  const [specterBarrierCharges, setSpecterBarrierCharges] = useState(0);

  const progress = profile?.campaignProgress || 1;
  const titansProgress = profile?.campaignProgress || 1; // For now shared, could be separate

  const startLevel = async (level: any) => {
    setIsGenerating(true);
    const saga = SAGAS[activeSaga];
    const prompt = `Preguntas sobre ${level.topic}. Dificultad: ${level.difficulty}. ${saga.inverse ? 'IMPORTANTE: El jugador debe elegir la respuesta INCORRECTA.' : ''}`;
    const generated = await generateInfiniteTrivia(prompt, 5);
    
    if (generated.length === 0) {
      toast.error("Error al cargar el nivel.");
      setIsGenerating(false);
      return;
    }

    setQuestions(generated);
    setCurrentQ(0);
    setHealth(100 + combatBonuses.bonusHealth);
    setBossPhase(1);
    setSelectedLevel(level);
    setSpecterBarrierCharges(combatBonuses.startingShields);
    setGameState('playing');
    setIsGenerating(false);
    audio.playSFX('click');
  };

  const handleAnswer = async (selectedIndex: number) => {
    const q = questions[currentQ];
    const saga = SAGAS[activeSaga];
    const isInverse = 'inverse' in saga && saga.inverse;
    const isCorrect = isInverse ? selectedIndex !== q.answer : selectedIndex === q.answer;

    if (isCorrect) {
      audio.playSFX('success');
      
      // Phase shift check
      if ('bossPhases' in saga && saga.bossPhases && bossPhase === 1 && currentQ >= 2) {
        setBossPhase(2);
        toast.warning("Â¡EL DIOS HA CAMBIADO DE FASE! La dificultad aumenta.");
        audio.playSFX('boss_phase'); // Assuming we add this or use another
        // Generate harder questions for phase 2
        setIsGenerating(true);
        const generated = await generateInfiniteTrivia(selectedLevel.topic, 3, 'Extrema');
        setQuestions(prev => [...prev, ...generated]);
        setIsGenerating(false);
      }

      if (currentQ + 1 < questions.length) {
        setCurrentQ(prev => prev + 1);
      } else {
        finishLevel(true);
      }
    } else {
      if (specterBarrierCharges > 0) {
        setSpecterBarrierCharges((current) => Math.max(0, current - 1));
        toast.info(activeSpecter?.ability.name ? `La habilidad ${activeSpecter.ability.name} bloqueo el golpe.` : "Barrera espectral activada.");
        audio.playSFX('shield');
        if (currentQ + 1 < questions.length) {
          setCurrentQ(prev => prev + 1);
        } else {
          finishLevel(true);
        }
        return;
      }

      if (Math.random() < combatBonuses.dodgeChance) {
        toast.success(activeSpecter?.ability.name ? `${activeSpecter.ability.name}: evasion perfecta.` : 'Evasion exitosa.');
        audio.playSFX('success');
        if (currentQ + 1 < questions.length) {
          setCurrentQ(prev => prev + 1);
        } else {
          finishLevel(true);
        }
        return;
      }

      audio.playSFX('damage');
      const damage = selectedLevel.difficulty === 'Extrema' ? 50 : selectedLevel.difficulty === 'DifÃ­cil' ? 40 : 30;
      setHealth(h => h - damage);
      if (health - damage <= 0) {
        finishLevel(false);
      } else {
        if (currentQ + 1 < questions.length) {
          setCurrentQ(prev => prev + 1);
        } else {
          finishLevel(true);
        }
      }
    }
  };

  const finishLevel = async (won: boolean) => {
    setGameState('result');
    if (won && user && profile) {
      const docRef = doc(db, 'users', user.uid);
      const updates: any = {
        obolos: increment(Math.floor((1000 * selectedLevel.id) * combatBonuses.obolosMultiplier))
      };

      const saga = SAGAS[activeSaga];
      if (selectedLevel.id === progress) {
        updates.campaignProgress = progress + 1;
        
        // Boss loot on specific levels
        if (selectedLevel.id % 3 === 0 || selectedLevel.id === saga.levels.length) {
          const loot = rollLoot(true);
          const bonusLoot = Math.random() < combatBonuses.lootChanceBonus ? rollLoot(true) : null;
          if (loot) {
            updates.gearInventory = bonusLoot ? arrayUnion(loot, bonusLoot) : arrayUnion(loot);
            toast.success(`Â¡Nivel Completado! Recompensa: ${loot.name}`);
          }
        }
        
        if (selectedLevel.id === saga.levels.length && !profile.titles?.includes(`Conquistador de ${saga.name}`)) {
          updates.titles = arrayUnion(`Conquistador de ${saga.name}`);
        }

      }
      await updateDoc(docRef, updates);
      toast.success("Â¡Nivel superado!");
    } else {
      toast.error("Has sido derrotado.");
    }
  };

  if (gameState === 'saga-select') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <Map className="w-16 h-16 text-accent mx-auto animate-pulse" />
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
            CrÃ³nicas Divinas
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
              className={`glass-panel border-accent/20 hover:border-accent transition-all cursor-pointer clip-card group`}
              onClick={() => {
                setActiveSaga(id as any);
                setGameState('map');
                audio.playSFX('click');
              }}
            >
              <CardContent className="p-8 text-center space-y-6">
                <saga.icon className={`w-20 h-20 mx-auto transition-transform group-hover:scale-110 ${id === 'descenso' ? 'text-purple-500' : 'text-orange-500'}`} />
                <h3 className={`text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r ${saga.color} uppercase tracking-widest`}>
                  {saga.name}
                </h3>
                {('inverse' in saga && saga.inverse) && (
                  <div className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-500 text-[10px] font-mono uppercase tracking-tighter">
                    MecÃ¡nica: Trivia Inversa
                  </div>
                )}
                <p className="text-sm text-muted-foreground font-sans">
                  {id === 'descenso' ? 'EnfrÃ©ntate a los guardianes del Inframundo.' : 'DesafÃ­a a los antiguos gobernantes del mundo.'}
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
          <Button 
            variant="ghost" 
            onClick={() => setGameState('saga-select')}
            className="text-accent hover:text-white uppercase tracking-widest text-xs mb-4"
          >
            â† Volver a Sagas
          </Button>
          <saga.icon className={`w-16 h-16 mx-auto animate-pulse ${activeSaga === 'descenso' ? 'text-purple-500' : 'text-orange-500'}`} />
          <h1 className={`text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r ${saga.color} neon-text-accent uppercase tracking-[0.2em]`}>
            {saga.name}
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">CampaÃ±a Principal</p>
        </div>

        <div className="space-y-4 relative">
          <div className={`absolute left-8 top-8 bottom-8 w-1 bg-${saga.accent}/20 -z-10`} />

          {saga.levels.map((level, index) => {
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
                      <Button 
                        onClick={() => startLevel(level)}
                        disabled={isGenerating}
                        className={`bg-${saga.accent} hover:opacity-80 text-white clip-diagonal uppercase tracking-widest`}
                      >
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
    const q = questions[currentQ];
    const saga = SAGAS[activeSaga];
    if (!q) return null;
    
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className={`flex justify-between items-center mb-8 px-4 py-2 bg-background/80 border border-${saga.accent}/50 clip-diagonal`}>
          <div className="flex items-center gap-4">
            <span className={`font-mono text-${saga.accent}`}>{selectedLevel.name}</span>
            {('bossPhases' in saga && saga.bossPhases) && (
              <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/50 text-red-500 text-[10px] uppercase font-mono">
                Fase {bossPhase}
              </span>
            )}
          </div>
          <span className="font-mono text-green-400">HP: {health}{specterBarrierCharges > 0 ? ` | Barreras: ${specterBarrierCharges}` : ''}</span>
        </div>

        {saga.inverse && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-500 text-center font-display uppercase tracking-widest animate-pulse">
            âš ï¸ Â¡ELIGE LA RESPUESTA INCORRECTA! âš ï¸
          </div>
        )}
        
        <Card className={`glass-panel border-${saga.accent}/50 clip-card p-8 relative overflow-hidden`}>
          <h3 className="text-xl font-sans font-bold text-white mb-8 text-center relative z-10">{q.q}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {q.options.map((opt, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                className={`h-auto py-4 text-lg font-sans tracking-wide border-${saga.accent}/30 hover:border-${saga.accent} hover:bg-${saga.accent}/20 transition-all clip-diagonal`}
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
    const saga = SAGAS[activeSaga];
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 relative z-10">
        {won ? <Star className={`w-24 h-24 text-${saga.accent} mx-auto`} /> : <Shield className="w-24 h-24 text-red-500 mx-auto" />}
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">
          {won ? 'Nivel Superado' : 'Derrota'}
        </h2>
        <Button onClick={() => setGameState('map')} className={`w-full bg-${saga.accent} hover:opacity-80 text-white clip-diagonal py-6 uppercase tracking-widest`}>
          Volver al Mapa
        </Button>
      </div>
    );
  }

  return null;
};

