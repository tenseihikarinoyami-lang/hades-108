import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Skull, Flame, Trophy, Sparkles, PackageOpen, Snowflake, Moon, Circle, ArrowUp, ShoppingBag, HeartPulse } from 'lucide-react';
import { audio } from '@/lib/audio';
import { getTowerTrivia } from '@/data/nonArenaTriviaBank';
import { type GeneratedTrivia } from '@/lib/gemini';
import { rollLoot, Equipment, RARITY_COLORS, Element, getElementMultiplier } from '@/lib/rpg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCombatContextFor } from '@/lib/combat';
import { getWeeklyEventForMode } from '@/data/weeklyEvents';
import { captureError, trackEconomyReward, trackModeRun } from '@/lib/analytics';
import { applyRunRelicBonuses, getRelicOffers, RunRelic } from '@/lib/roguelite';

export const Tower: React.FC = () => {
  const { user, profile } = useAuth();
  const [runRelics, setRunRelics] = useState<RunRelic[]>([]);
  const [intermissionOffers, setIntermissionOffers] = useState<RunRelic[]>([]);
  const [intermissionType, setIntermissionType] = useState<'relic' | 'merchant' | null>(null);
  const runRelicBonuses = useMemo(() => applyRunRelicBonuses(runRelics), [runRelics]);
  
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'intermission' | 'result'>('intro');
  const [currentFloor, setCurrentFloor] = useState(1);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fighting Mechanics
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isDamaged, setIsDamaged] = useState(false);
  const [isEnemyDamaged, setIsEnemyDamaged] = useState(false);
  const [revealedImage, setRevealedImage] = useState(false);
  const [enemyElement, setEnemyElement] = useState<Element>('Neutral');
  const [isBossStage, setIsBossStage] = useState(false);
  
  // Run Stats
  const [runLoot, setRunLoot] = useState<Equipment[]>([]);
  const [runStarFragments, setRunStarFragments] = useState(0);
  const [specterBarrierCharges, setSpecterBarrierCharges] = useState(0);
  const weeklyEvent = useMemo(() => getWeeklyEventForMode('Torre'), []);
  const combatContext = useMemo(
    () => getCombatContextFor(profile, {
      mode: 'tower',
      enemyElement,
      enemyTags: [isBossStage ? 'boss' : 'floor', `floor-${currentFloor}`],
    }),
    [profile, enemyElement, isBossStage, currentFloor]
  );
  const { activeSpecter, activeSetEffect, awakeningLevel, collectionProgress } = combatContext;
  const combatBonuses = useMemo(
    () => ({
      damageMultiplier: combatContext.bonuses.damageMultiplier * runRelicBonuses.damageMultiplier,
      bonusHealth: combatContext.bonuses.bonusHealth + runRelicBonuses.bonusHealth,
      bonusTime: combatContext.bonuses.bonusTime + runRelicBonuses.bonusTime,
      lootChanceBonus: combatContext.bonuses.lootChanceBonus + runRelicBonuses.lootChanceBonus,
      dodgeChance: combatContext.bonuses.dodgeChance + runRelicBonuses.dodgeChance,
      startingShields: combatContext.bonuses.startingShields + runRelicBonuses.startingShields,
      obolosMultiplier: combatContext.bonuses.obolosMultiplier * runRelicBonuses.obolosMultiplier * (weeklyEvent?.effect.obolosMultiplier || 1),
      comboBonus: combatContext.bonuses.comboBonus + runRelicBonuses.comboBonus,
      memoryDropBonus: combatContext.bonuses.memoryDropBonus + runRelicBonuses.memoryDropBonus,
    }),
    [combatContext.bonuses, runRelicBonuses, weeklyEvent]
  );
  const getMaxHealth = useMemo(
    () => 100 + (profile?.equippedGear?.armor?.stats?.health || 0) + combatBonuses.bonusHealth,
    [profile?.equippedGear?.armor?.stats?.health, combatBonuses.bonusHealth]
  );

  // Timer Effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !revealedImage) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing' && !revealedImage) {
      handleTimeOut();
    }
  }, [timeLeft, gameState, revealedImage]);

  const getFloorTime = (bossFloor: boolean) => {
    let initialTime = bossFloor ? 10 : 15;
    if (profile?.equippedGear?.artifact?.stats?.time) initialTime += profile.equippedGear.artifact.stats.time;
    if (profile?.faction === 'Griffon') initialTime += 3;
    initialTime += combatBonuses.bonusTime;
    return initialTime;
  };

  const openIntermission = (type: 'relic' | 'merchant') => {
    setIntermissionType(type);
    setIntermissionOffers(getRelicOffers('tower', currentFloor, runRelics.map((relic) => relic.id), type));
    setGameState('intermission');
  };

  const startFloor = async (floor: number) => {
    setIsGenerating(true);
    const generated = getTowerTrivia(floor, 5);
    
    if (generated.length === 0) {
      toast.error("Error al generar el piso. Intenta de nuevo.");
      captureError('tower_floor_generation_failed', 'tower.startFloor', { floor }, user?.uid);
      setIsGenerating(false);
      return;
    }
    
    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setIsGenerating(false);
    setGameState('playing');
    
    // Initialize floor
    setIsBossStage(false);
    setEnemyHealth(100);
    setRevealedImage(false);
    
    const elements: Element[] = ['Fuego', 'Hielo', 'Rayo', 'Oscuridad', 'Neutral'];
    setEnemyElement(elements[Math.floor(Math.random() * elements.length)]);
    
    setTimeLeft(getFloorTime(false));
    
    // Health carries over between floors, but we cap it at max
    if (floor === 1) setPlayerHealth(getMaxHealth);
  };

  const handleStartRun = () => {
    audio.playSFX('click');
    setCurrentFloor(1);
    setRunLoot([]);
    setRunStarFragments(0);
    setRunRelics([]);
    setIntermissionOffers([]);
    setIntermissionType(null);
    setSpecterBarrierCharges(combatContext.bonuses.startingShields);
    window.setTimeout(() => startFloor(1), 0);
  };

  const triggerDamage = (target: 'player' | 'enemy') => {
    if (target === 'player') {
      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 500);
    } else {
      setIsEnemyDamaged(true);
      setTimeout(() => setIsEnemyDamaged(false), 500);
    }
  };

  const handleTimeOut = () => {
    if (specterBarrierCharges > 0) {
      setSpecterBarrierCharges((current) => Math.max(0, current - 1));
      audio.playSFX('shield');
      toast.info(activeSpecter?.ability.name ? `La habilidad ${activeSpecter.ability.name} bloqueo el castigo.` : 'Barrera espectral activada.');
      moveToNextQuestion(true);
      return;
    }

    audio.playSFX('damage');
    triggerDamage('player');
    const nextPlayerHealth = Math.max(0, playerHealth - 25);
    setPlayerHealth(nextPlayerHealth);
    toast.error("Â¡TIEMPO AGOTADO! DaÃ±o crÃ­tico recibido.");
    moveToNextQuestion(false, nextPlayerHealth);
  };

  const handleAnswer = async (selectedIndex: number) => {
    if (revealedImage) return;
    
    const q = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === q.answer;
    const totalQuestions = questions.length;
    
    if (isCorrect) {
      audio.playSFX('success');
      
      const playerWeaponElement = profile?.equippedGear?.weapon?.element || 'Neutral';
      const multiplier = getElementMultiplier(playerWeaponElement, enemyElement) * combatBonuses.damageMultiplier;
      
      const baseDamage = 100 / totalQuestions;
      setEnemyHealth(h => Math.max(0, h - (baseDamage * multiplier)));
      triggerDamage('enemy');
      setRevealedImage(true);
      
      // Loot Drop Logic for Tower
      // Higher floors = better loot chance
      const lootChance = (isBossStage ? 1.0 : 0.2 + (currentFloor * 0.02)) + combatBonuses.lootChanceBonus + (weeklyEvent?.effect.lootChanceBonus || 0);
      if (Math.random() < lootChance) {
        const droppedLoot = rollLoot(isBossStage);
        if (droppedLoot) {
          setRunLoot(prev => [...prev, droppedLoot]);
          toast(`Â¡BotÃ­n Obtenido! ${droppedLoot.name}`, {
            icon: <PackageOpen className={`w-5 h-5 ${RARITY_COLORS[droppedLoot.rarity].split(' ')[0]}`} />,
            style: { background: 'rgba(0,0,0,0.8)', border: `1px solid currentColor`, color: '#fff' }
          });
        }
      }
      
      // Star Fragments drop
      if (Math.random() < 0.3 || isBossStage) {
        const fragments = isBossStage ? Math.floor(Math.random() * 3) + 1 + runRelicBonuses.starFragmentBonus : 1;
        setRunStarFragments(prev => prev + fragments);
        toast.success(`+${fragments} Fragmento(s) de Estrella`);
      }
      
      setTimeout(() => {
        moveToNextQuestion(true);
      }, 2500);
    } else {
      if (specterBarrierCharges > 0) {
        setSpecterBarrierCharges((current) => Math.max(0, current - 1));
        audio.playSFX('shield');
        toast.info(activeSpecter?.ability.name ? `La habilidad ${activeSpecter.ability.name} bloqueo el impacto.` : 'Barrera espectral activada.');
        moveToNextQuestion(true);
        return;
      }

      let damage = isBossStage ? 40 + (currentFloor * 2) : 20 + currentFloor;
      
      const playerArmorElement = profile?.equippedGear?.armor?.element || 'Neutral';
      const defenseMultiplier = getElementMultiplier(enemyElement, playerArmorElement);
      
      damage = Math.floor(damage * defenseMultiplier);

      if (Math.random() < combatBonuses.dodgeChance) {
        damage = 0;
        toast.success(activeSpecter?.ability.name ? `${activeSpecter.ability.name}: evasion perfecta.` : 'Evasion exitosa.');
      }
      
      audio.playSFX(damage === 0 ? 'success' : 'damage');
      const nextPlayerHealth = Math.max(0, playerHealth - damage);
      setPlayerHealth(nextPlayerHealth);
      if (damage > 0) triggerDamage('player');
      if (damage === 0) {
        moveToNextQuestion(false, nextPlayerHealth);
        return;
      }
      
      if (defenseMultiplier > 1) toast.error("Â¡GOLPE CRÃTICO! (SÃºper Efectivo)");
      else if (defenseMultiplier < 1) toast.error("Tu armadura resistiÃ³ parte del impacto.");
      else toast.error("Â¡EVASIÃ“N FALLIDA! DaÃ±o recibido.");
      
      moveToNextQuestion(false, nextPlayerHealth);
    }
  };

  const moveToNextQuestion = (wasCorrect: boolean, nextPlayerHealth: number = playerHealth) => {
    const totalQuestions = questions.length;

    if (!wasCorrect && nextPlayerHealth <= 0) {
      finishRun(false);
      return;
    }

    if (currentQuestionIndex + 1 < totalQuestions) {
      const nextQ = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQ);
      
      const isNextBoss = nextQ === totalQuestions - 1;
      setIsBossStage(isNextBoss);
      
      if (isNextBoss) {
        audio.playSFX('error');
        toast.error("Â¡JEFE DEL PISO ACERCÃNDOSE!", {
           style: { background: 'rgba(255, 0, 0, 0.2)', border: '1px solid red', color: '#fff' }
        });
      }

      const elements: Element[] = ['Fuego', 'Hielo', 'Rayo', 'Oscuridad', 'Neutral'];
      setEnemyElement(elements[Math.floor(Math.random() * elements.length)]);

      setTimeLeft(getFloorTime(isNextBoss));
      setRevealedImage(false);
    } else {
      // Floor cleared!
      toast.success(`Â¡Piso ${currentFloor} superado!`);
      const nextFloor = currentFloor + 1;
      if (currentFloor % 5 === 0) {
        openIntermission('merchant');
      } else if (currentFloor % 3 === 0) {
        openIntermission('relic');
      } else {
        setCurrentFloor(nextFloor);
        startFloor(nextFloor);
      }
    }
  };

  const finishRun = async (survived: boolean) => {
    setGameState('result');
    if (user && profile) {
      try {
        const docRef = doc(db, 'users', user.uid);
        
        const newHighestFloor = Math.max(profile.highestTowerFloor || 0, currentFloor - 1);
        
        const updates: Record<string, any> = {
          starFragments: increment(runStarFragments),
          highestTowerFloor: newHighestFloor
        };

        if (runLoot.length > 0) {
          updates.gearInventory = arrayUnion(...runLoot);
        }

        await updateDoc(docRef, updates);
        trackEconomyReward('tower', { starFragments: runStarFragments, loot: runLoot.length, highestFloor: newHighestFloor }, user.uid);
        trackModeRun('tower', survived ? 'win' : 'lose', { floor: currentFloor, relics: runRelics.length, loot: runLoot.length }, user.uid);
        
      } catch (error) {
        console.error("Error saving run results", error);
        captureError(error, 'tower.finishRun', { floor: currentFloor }, user.uid);
      }
    }
  };

  const handleClaimRelic = (relic: RunRelic) => {
    audio.playSFX('success');
    setRunRelics((current) => [...current, relic]);
    toast.success(`${relic.name} se une a tu build de la run.`);
    const nextFloor = currentFloor + 1;
    setCurrentFloor(nextFloor);
    setPlayerHealth((current) => Math.min(getMaxHealth + (relic.bonuses.bonusHealth || 0), current + (relic.bonuses.healingBonus || 0)));
    setSpecterBarrierCharges((current) => current + (relic.bonuses.startingShields || 0));
    window.setTimeout(() => startFloor(nextFloor), 0);
  };

  const handleMerchantChoice = (choice: RunRelic | 'heal' | 'skip') => {
    const nextFloor = currentFloor + 1;

    if (choice === 'heal') {
      audio.playSFX('success');
      setPlayerHealth((current) => Math.min(getMaxHealth, current + 30 + runRelicBonuses.healingBonus));
      toast.success('El mercader remienda tu armadura y restaura tu vigor.');
    } else if (choice !== 'skip') {
      const relicCost = 3;
      if (runStarFragments < relicCost) {
        toast.error(`Necesitas ${relicCost} fragmentos estelares para comprar ${choice.name}.`);
        return;
      }
      audio.playSFX('success');
      setRunStarFragments((current) => Math.max(0, current - relicCost));
      setRunRelics((current) => [...current, choice]);
      toast.success(`Compraste ${choice.name} por ${relicCost} fragmentos.`);
    } else {
      audio.playSFX('click');
    }

    setCurrentFloor(nextFloor);
    window.setTimeout(() => startFloor(nextFloor), 0);
  };

  const getElementIcon = (element: Element) => {
    switch (element) {
      case 'Fuego': return <Flame className="w-4 h-4 text-red-500" />;
      case 'Hielo': return <Snowflake className="w-4 h-4 text-blue-300" />;
      case 'Rayo': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Oscuridad': return <Moon className="w-4 h-4 text-purple-600" />;
      default: return <Circle className="w-4 h-4 text-slate-400" />;
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 relative z-10 text-center">
        <div className="space-y-4 mb-12">
          <h1 className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-900 neon-text-accent uppercase tracking-[0.2em]">
            Torre de los 108 Espectros
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Ascenso Infinito</p>
        </div>

        <Card className="glass-panel border-purple-500/30 clip-card bg-background/60 p-8">
          <div className="space-y-6">
            <p className="text-lg text-slate-300">
              EnfrÃ©ntate a oleadas interminables de enemigos generados por el OrÃ¡culo. 
              Cada piso es mÃ¡s difÃ­cil que el anterior.
            </p>
            {activeSpecter && (
              <div className="bg-background/50 border border-cyan-500/20 p-4 clip-diagonal max-w-2xl mx-auto text-left space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">Habilidad del Espectro</p>
                <p className="font-display text-lg text-white">{activeSpecter.ability.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{activeSpecter.ability.description}</p>
              </div>
            )}
            {activeSetEffect && (
              <div className="bg-background/50 border border-yellow-500/20 p-4 clip-diagonal max-w-2xl mx-auto text-left space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-400">Bono de Set Activo</p>
                <p className="font-display text-lg text-white">{activeSetEffect.title}</p>
                <p className="text-xs font-mono text-muted-foreground">{activeSetEffect.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono text-muted-foreground">
              <div className="p-4 border border-purple-500/20 clip-diagonal">
                <Skull className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                Si mueres, la run termina, pero conservas el botÃ­n.
              </div>
              <div className="p-4 border border-purple-500/20 clip-diagonal">
                <Sparkles className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                Alta probabilidad de Fragmentos de Estrella.
              </div>
              <div className="p-4 border border-purple-500/20 clip-diagonal">
                <ArrowUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                RÃ©cord actual: Piso {profile?.highestTowerFloor || 0}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
              <div className="p-4 border border-cyan-500/20 clip-diagonal bg-background/40 text-left">
                <div className="text-[10px] uppercase tracking-widest text-cyan-400 mb-2">Sinergia del Espectro</div>
                <div className="text-white">Despertar {awakeningLevel}/3</div>
                <div className="text-muted-foreground text-xs">{collectionProgress.completedFamilies.length} familias completas</div>
              </div>
              <div className="p-4 border border-yellow-500/20 clip-diagonal bg-background/40 text-left">
                <div className="text-[10px] uppercase tracking-widest text-yellow-400 mb-2">Sistema Roguelite</div>
                <div className="text-white">Reliquias cada 3 pisos</div>
                <div className="text-muted-foreground text-xs">Mercader y descanso cada 5 pisos</div>
              </div>
              <div className="p-4 border border-emerald-500/20 clip-diagonal bg-background/40 text-left">
                <div className="text-[10px] uppercase tracking-widest text-emerald-400 mb-2">Meta de Run</div>
                <div className="text-white">Escalar, comprar y adaptar build</div>
                <div className="text-muted-foreground text-xs">Tu build cambia piso a piso</div>
              </div>
            </div>
            {weeklyEvent && (
              <div className="max-w-2xl mx-auto bg-background/50 border border-amber-500/20 p-4 clip-diagonal text-left space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Evento semanal activo</p>
                <p className="font-display text-lg text-white">{weeklyEvent.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{weeklyEvent.bonuses.join(' | ')}</p>
              </div>
            )}
            <Button 
              onClick={handleStartRun} 
              disabled={isGenerating}
              className="w-full max-w-md mx-auto bg-purple-600 hover:bg-purple-500 text-white font-display text-xl py-8 tracking-widest uppercase clip-diagonal transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
            >
              {isGenerating ? 'Abriendo las puertas...' : 'Entrar a la Torre'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'playing' && questions.length > 0) {
    const q = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    
    return (
      <div className={`max-w-4xl mx-auto mt-4 transition-all duration-100 ${isDamaged ? 'animate-shake' : ''}`}>
        
        {/* Tower Status Bar */}
        <div className="flex justify-between items-center mb-4 px-4 py-2 bg-purple-900/30 border border-purple-500/30 clip-diagonal">
          <span className="font-display text-purple-400 tracking-widest uppercase">Piso {currentFloor}</span>
          <div className="flex gap-4 font-mono text-xs">
            <span className="flex items-center gap-1 text-cyan-400"><Sparkles className="w-3 h-3"/> {runStarFragments}</span>
            <span className="flex items-center gap-1 text-yellow-400"><PackageOpen className="w-3 h-3"/> {runLoot.length}</span>
            <span className="flex items-center gap-1 text-emerald-400"><Shield className="w-3 h-3"/> {runRelics.length}</span>
          </div>
        </div>

        {/* HUD: Health Bars & Timer */}
        <div className={`flex items-center justify-between mb-8 bg-background/80 p-4 rounded-sm border clip-diagonal relative z-20 ${isBossStage ? 'border-primary/50 shadow-[0_0_20px_rgba(255,0,0,0.2)]' : 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]'}`}>
          
          <div className="absolute -left-6 -top-6 z-30">
            <Avatar className="w-16 h-16 border-2 border-purple-500 clip-hex shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-background">
              <AvatarImage src={profile?.photoURL || user?.photoURL || ''} className="object-cover" />
              <AvatarFallback className="bg-secondary text-purple-400 font-display text-xl">
                {profile?.specterName?.[0] || 'E'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 space-y-2 pl-12">
            <div className="flex justify-between text-xs font-mono font-bold tracking-widest text-purple-400">
              <span>{profile?.specterName?.toUpperCase() || 'ESPECTRO'}</span>
              <span className="flex items-center gap-2">
                {specterBarrierCharges > 0 && <Sparkles className="w-3 h-3 text-cyan-400" title={activeSpecter?.ability.name || 'Barrera espectral'} />}
                <span className={playerHealth <= 25 ? 'text-primary animate-pulse' : ''}>{Math.max(0, playerHealth)} HP</span>
              </span>
            </div>
            <div className="h-4 bg-background border border-purple-500/50 rounded-sm overflow-hidden clip-diagonal relative">
              {isDamaged && <div className="absolute inset-0 bg-primary/50 z-10" />}
              <motion.div 
                className={`h-full ${playerHealth <= 25 ? 'bg-primary' : 'bg-purple-500'} shadow-[0_0_10px_currentColor]`}
                initial={{ width: '100%' }}
                animate={{ width: `${(playerHealth / Math.max(getMaxHealth, 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="mx-8 flex flex-col items-center justify-center relative">
            <div className={`absolute inset-0 border-2 clip-hex opacity-50 ${timeLeft <= 5 ? 'border-primary animate-ping' : 'border-purple-500'}`} />
            <div className={`text-4xl font-display font-bold w-16 h-16 flex items-center justify-center clip-hex bg-background/80 ${timeLeft <= 5 ? 'text-primary neon-text-primary' : 'text-white'}`}>
              {timeLeft}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold tracking-widest text-primary">
              <span className="flex items-center gap-2">
                {isBossStage ? 'JEFE DEL PISO' : 'ESPECTRO MENOR'}
                <span title={`Elemento Enemigo: ${enemyElement}`}>{getElementIcon(enemyElement)}</span>
              </span>
              <span>{Math.ceil(enemyHealth)}%</span>
            </div>
            <div className="h-4 bg-background border border-primary/50 rounded-sm overflow-hidden clip-diagonal relative">
              {isEnemyDamaged && <div className="absolute inset-0 bg-accent/50 z-10" />}
              <motion.div 
                className="h-full bg-primary shadow-[0_0_10px_currentColor]"
                initial={{ width: '100%' }}
                animate={{ width: `${enemyHealth}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className={`overflow-hidden relative min-h-[400px] flex flex-col justify-end clip-card ${isBossStage ? 'border-primary/50 shadow-[0_0_40px_rgba(255,0,0,0.2)]' : 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]'}`}>
          <div className="absolute inset-0 scanline opacity-20 pointer-events-none z-30" />
          
          <div 
            className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-1000"
            style={{ backgroundImage: `url(${q.bgImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'})` }}
          />
          <div className={`absolute inset-0 transition-colors duration-1000 z-10 ${revealedImage ? 'bg-background/40' : 'bg-background/95'}`} />
          
          <div className="relative z-20 p-8 bg-gradient-to-t from-background via-background/90 to-transparent pt-32">
            <div className="text-center mb-8">
              <span className="text-xs font-mono text-purple-400 tracking-[0.3em] uppercase mb-2 block">
                [ COMBATE {currentQuestionIndex + 1} / {totalQuestions} ]
              </span>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{q.q}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, idx) => (
                <Button 
                  key={idx} 
                  variant="outline" 
                  disabled={revealedImage}
                  className={`h-auto py-4 text-lg font-sans tracking-wide border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 transition-all clip-diagonal relative overflow-hidden group ${revealedImage && idx === q.answer ? 'bg-purple-500/40 border-purple-400 text-white' : 'bg-background/80 text-muted-foreground'}`}
                  onClick={() => handleAnswer(idx)}
                  onMouseEnter={() => audio.playSFX('hover')}
                >
                  <span className="relative z-10">{opt}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'intermission') {
    return (
      <div className="max-w-5xl mx-auto mt-16 space-y-8 relative z-10">
        <div className="text-center space-y-3">
          {intermissionType === 'merchant' ? <ShoppingBag className="w-14 h-14 text-yellow-400 mx-auto" /> : <HeartPulse className="w-14 h-14 text-cyan-400 mx-auto" />}
          <h2 className="text-4xl font-display text-white uppercase tracking-widest">
            {intermissionType === 'merchant' ? 'Mercader del Abismo' : 'Camara de Reliquias'}
          </h2>
          <p className="text-sm font-mono text-muted-foreground">
            {intermissionType === 'merchant'
              ? 'Cada 5 pisos aparece un mercader. Compra una reliquia o cura tu armadura antes del siguiente salto.'
              : 'Cada 3 pisos eliges una reliquia temporal para adaptar tu ascenso.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {intermissionOffers.map((relic) => (
            <Card key={relic.id} className="glass-panel border-purple-500/20 clip-card">
              <CardHeader className="border-b border-purple-500/10">
                <CardTitle className="font-display text-lg text-white">{relic.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="text-xs uppercase tracking-widest text-purple-300">{relic.tier}</div>
                <p className="text-sm text-white/90">{relic.description}</p>
                <Button
                  onClick={() => (intermissionType === 'merchant' ? handleMerchantChoice(relic) : handleClaimRelic(relic))}
                  className="w-full clip-diagonal bg-purple-600 hover:bg-purple-500 text-white uppercase tracking-widest"
                >
                  {intermissionType === 'merchant' ? 'Comprar (3 fragmentos)' : 'Tomar Reliquia'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {intermissionType === 'merchant' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-panel border-emerald-500/20 clip-card">
              <CardContent className="pt-6 space-y-3">
                <div className="font-display text-white text-xl">Reparacion Completa</div>
                <p className="text-sm text-muted-foreground">Restaura 30 HP mas tus bonos de curacion temporal.</p>
                <Button onClick={() => handleMerchantChoice('heal')} className="w-full clip-diagonal bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-widest">
                  Curarme y Seguir
                </Button>
              </CardContent>
            </Card>
            <Card className="glass-panel border-accent/20 clip-card">
              <CardContent className="pt-6 space-y-3">
                <div className="font-display text-white text-xl">Continuar Sin Comprar</div>
                <p className="text-sm text-muted-foreground">Conserva tus fragmentos y sube al siguiente piso.</p>
                <Button onClick={() => handleMerchantChoice('skip')} variant="outline" className="w-full clip-diagonal border-accent/30 uppercase tracking-widest">
                  Saltar la Tienda
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {runRelics.length > 0 && (
          <Card className="glass-panel border-cyan-500/20 clip-card">
            <CardHeader className="border-b border-cyan-500/10">
              <CardTitle className="font-display text-lg text-cyan-300">Build actual de la run</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-wrap gap-2">
              {runRelics.map((relic) => (
                <span key={relic.id} className="px-3 py-2 border border-cyan-500/20 bg-background/50 text-xs font-mono text-white clip-diagonal">
                  {relic.name}
                </span>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-6"
        >
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <Skull className="w-full h-full text-primary neon-text-primary relative z-10" />
          </div>
          <h2 className="text-5xl font-display font-bold text-primary uppercase tracking-widest">CaÃ­do</h2>
          <p className="text-muted-foreground font-mono tracking-widest text-sm">TU ASCENSO HA TERMINADO.</p>
          
          <div className="p-6 glass-panel border-purple-500/30 clip-card relative overflow-hidden text-left space-y-4">
            <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
              <span className="text-sm text-purple-400 uppercase tracking-widest font-mono">Piso Alcanzado</span>
              <span className="text-2xl font-display font-bold text-white">{currentFloor}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
              <span className="text-sm text-cyan-400 uppercase tracking-widest font-mono">Fragmentos Obtenidos</span>
              <span className="text-xl font-mono font-bold text-white">+{runStarFragments}</span>
            </div>

            <div>
              <span className="text-sm text-yellow-400 uppercase tracking-widest font-mono block mb-2">BotÃ­n Recuperado</span>
              {runLoot.length === 0 ? (
                <span className="text-xs text-muted-foreground font-mono">Ninguno</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {runLoot.map((item, i) => (
                    <span key={i} className={`text-xs font-mono px-2 py-1 border clip-diagonal ${RARITY_COLORS[item.rarity]}`}>
                      {item.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {runRelics.length > 0 && (
              <div>
                <span className="text-sm text-cyan-400 uppercase tracking-widest font-mono block mb-2">Reliquias de la Run</span>
                <div className="flex flex-wrap gap-2">
                  {runRelics.map((relic) => (
                    <span key={relic.id} className="text-xs font-mono px-2 py-1 border border-cyan-500/30 bg-cyan-500/10 clip-diagonal text-white">
                      {relic.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button onClick={() => { audio.playSFX('click'); setGameState('intro'); }} className="w-full bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 border border-purple-500/50 clip-diagonal py-6 font-bold tracking-widest uppercase transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] group" onMouseEnter={() => audio.playSFX('hover')}>
            <span className="group-hover:tracking-[0.3em] transition-all duration-300">Volver a la Entrada</span>
          </Button>
        </motion.div>
      </div>
    );
  }

  return null;
};
