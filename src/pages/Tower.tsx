import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Skull, Flame, Trophy, Sparkles, PackageOpen, Snowflake, Moon, Circle, ArrowUp } from 'lucide-react';
import { audio } from '@/lib/audio';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { rollLoot, Equipment, RARITY_COLORS, Element, getElementMultiplier } from '@/lib/rpg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Tower: React.FC = () => {
  const { user, profile } = useAuth();
  
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
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

  // Timer Effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !revealedImage) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing' && !revealedImage) {
      handleTimeOut();
    }
  }, [timeLeft, gameState, revealedImage]);

  const startFloor = async (floor: number) => {
    setIsGenerating(true);
    // Difficulty scales with floor
    const difficulty = floor > 20 ? 'Dios' : floor > 10 ? 'Espectro' : floor > 5 ? 'Caballero de Plata' : 'Caballero de Bronce';
    const generated = await generateInfiniteTrivia(difficulty, 5);
    
    if (generated.length === 0) {
      toast.error("Error al generar el piso. Intenta de nuevo.");
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
    
    let initialTime = 15;
    if (profile?.equippedGear?.artifact?.stats?.time) initialTime += profile.equippedGear.artifact.stats.time;
    if (profile?.faction === 'Griffon') initialTime += 3;
    setTimeLeft(initialTime);
    
    // Health carries over between floors, but we cap it at max
    let maxHealth = 100;
    if (profile?.equippedGear?.armor?.stats?.health) maxHealth += profile.equippedGear.armor.stats.health;
    if (floor === 1) setPlayerHealth(maxHealth);
  };

  const handleStartRun = () => {
    audio.playSFX('click');
    setCurrentFloor(1);
    setRunLoot([]);
    setRunStarFragments(0);
    startFloor(1);
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
    audio.playSFX('damage');
    triggerDamage('player');
    const nextPlayerHealth = Math.max(0, playerHealth - 25);
    setPlayerHealth(nextPlayerHealth);
    toast.error("¡TIEMPO AGOTADO! Daño crítico recibido.");
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
      const multiplier = getElementMultiplier(playerWeaponElement, enemyElement);
      
      const baseDamage = 100 / totalQuestions;
      setEnemyHealth(h => Math.max(0, h - (baseDamage * multiplier)));
      triggerDamage('enemy');
      setRevealedImage(true);
      
      // Loot Drop Logic for Tower
      // Higher floors = better loot chance
      const lootChance = isBossStage ? 1.0 : 0.2 + (currentFloor * 0.02);
      if (Math.random() < lootChance) {
        const droppedLoot = rollLoot(isBossStage);
        if (droppedLoot) {
          setRunLoot(prev => [...prev, droppedLoot]);
          toast(`¡Botín Obtenido! ${droppedLoot.name}`, {
            icon: <PackageOpen className={`w-5 h-5 ${RARITY_COLORS[droppedLoot.rarity].split(' ')[0]}`} />,
            style: { background: 'rgba(0,0,0,0.8)', border: `1px solid currentColor`, color: '#fff' }
          });
        }
      }
      
      // Star Fragments drop
      if (Math.random() < 0.3 || isBossStage) {
        const fragments = isBossStage ? Math.floor(Math.random() * 3) + 1 : 1;
        setRunStarFragments(prev => prev + fragments);
        toast.success(`+${fragments} Fragmento(s) de Estrella`);
      }
      
      setTimeout(() => {
        moveToNextQuestion(true);
      }, 2500);
    } else {
      let damage = isBossStage ? 40 + (currentFloor * 2) : 20 + currentFloor;
      
      const playerArmorElement = profile?.equippedGear?.armor?.element || 'Neutral';
      const defenseMultiplier = getElementMultiplier(enemyElement, playerArmorElement);
      
      damage = Math.floor(damage * defenseMultiplier);
      
      audio.playSFX('damage');
      const nextPlayerHealth = Math.max(0, playerHealth - damage);
      setPlayerHealth(nextPlayerHealth);
      triggerDamage('player');
      
      if (defenseMultiplier > 1) toast.error("¡GOLPE CRÍTICO! (Súper Efectivo)");
      else if (defenseMultiplier < 1) toast.error("Tu armadura resistió parte del impacto.");
      else toast.error("¡EVASIÓN FALLIDA! Daño recibido.");
      
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
        toast.error("¡JEFE DEL PISO ACERCÁNDOSE!", {
           style: { background: 'rgba(255, 0, 0, 0.2)', border: '1px solid red', color: '#fff' }
        });
      }

      const elements: Element[] = ['Fuego', 'Hielo', 'Rayo', 'Oscuridad', 'Neutral'];
      setEnemyElement(elements[Math.floor(Math.random() * elements.length)]);

      let nextTime = isNextBoss ? 10 : 15;
      if (profile?.equippedGear?.artifact?.stats?.time) nextTime += profile.equippedGear.artifact.stats.time;
      if (profile?.faction === 'Griffon') nextTime += 3;
      setTimeLeft(nextTime);
      setRevealedImage(false);
    } else {
      // Floor cleared!
      toast.success(`¡Piso ${currentFloor} superado!`);
      setCurrentFloor(prev => prev + 1);
      startFloor(currentFloor + 1);
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
        
      } catch (error) {
        console.error("Error saving run results", error);
      }
    }
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
              Enfréntate a oleadas interminables de enemigos generados por el Oráculo. 
              Cada piso es más difícil que el anterior.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono text-muted-foreground">
              <div className="p-4 border border-purple-500/20 clip-diagonal">
                <Skull className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                Si mueres, la run termina, pero conservas el botín.
              </div>
              <div className="p-4 border border-purple-500/20 clip-diagonal">
                <Sparkles className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                Alta probabilidad de Fragmentos de Estrella.
              </div>
              <div className="p-4 border border-purple-500/20 clip-diagonal">
                <ArrowUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                Récord actual: Piso {profile?.highestTowerFloor || 0}
              </div>
            </div>
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
              <span className={playerHealth <= 25 ? 'text-primary animate-pulse' : ''}>{Math.max(0, playerHealth)} HP</span>
            </div>
            <div className="h-4 bg-background border border-purple-500/50 rounded-sm overflow-hidden clip-diagonal relative">
              {isDamaged && <div className="absolute inset-0 bg-primary/50 z-10" />}
              <motion.div 
                className={`h-full ${playerHealth <= 25 ? 'bg-primary' : 'bg-purple-500'} shadow-[0_0_10px_currentColor]`}
                initial={{ width: '100%' }}
                animate={{ width: `${(playerHealth / (100 + (profile?.equippedGear?.armor?.stats?.health || 0))) * 100}%` }}
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
          <h2 className="text-5xl font-display font-bold text-primary uppercase tracking-widest">Caído</h2>
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
              <span className="text-sm text-yellow-400 uppercase tracking-widest font-mono block mb-2">Botín Recuperado</span>
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
