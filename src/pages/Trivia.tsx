import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { arrayUnion, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { TRIVIA_DATABASE, TriviaLevel, TriviaArena } from '@/data/trivias';
import { Shield, Zap, Skull, Flame, Trophy, Clock, Sparkles, PackageOpen, Snowflake, Moon, Circle } from 'lucide-react';
import { audio } from '@/lib/audio';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { incrementStat, updateMissionProgress, checkAndAwardBadges } from '@/lib/engine';
import { rollLoot, Equipment, RARITY_COLORS, Element, getElementMultiplier, CLASS_BONUSES, getLevelFromXP } from '@/lib/rpg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentCataclysm } from '@/lib/cataclysms';

export const Trivia: React.FC = () => {
  const { user, profile, setProfile, updateProfile } = useAuth();

  // Selection State
  const [selectedLevel, setSelectedLevel] = useState<TriviaLevel | null>(null);
  const [selectedArena, setSelectedArena] = useState<TriviaArena | null>(null);

  // Game State
  const [gameState, setGameState] = useState<'selection' | 'playing' | 'result'>('selection');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  // Fighting Mechanics
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isDamaged, setIsDamaged] = useState(false);
  const [isEnemyDamaged, setIsEnemyDamaged] = useState(false);
  const [revealedImage, setRevealedImage] = useState(false);

  // Oracle Mode & Passives
  const [isOracleMode, setIsOracleMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [oracleQuestions, setOracleQuestions] = useState<GeneratedTrivia[]>([]);
  const [garudaShieldActive, setGarudaShieldActive] = useState(false);
  const [isBossStage, setIsBossStage] = useState(false);
  const [lastLoot, setLastLoot] = useState<Equipment | null>(null);
  const [enemyElement, setEnemyElement] = useState<Element>('Neutral');
  const [classBonus, setClassBonus] = useState(CLASS_BONUSES['Ninguna']);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [primordialCurse, setPrimordialCurse] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<number[]>([0, 1, 2, 3]);
  const [isTimeStopped, setIsTimeStopped] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [highlightCorrect, setHighlightCorrect] = useState(false);

  // COMBO SYSTEM - Cadena de Victoria
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showComboPopup, setShowComboPopup] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !revealedImage && !isTimeStopped) {
      const interval = primordialCurse === 'Chronos' ? 500 : 1000;
      const timer = setTimeout(() => setTimeLeft(t => t - 1), interval);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing' && !revealedImage && !isTimeStopped) {
      handleTimeOut();
    }
  }, [timeLeft, gameState, revealedImage, primordialCurse, isTimeStopped]);

  // Caos Curse Effect
  useEffect(() => {
    if (primordialCurse === 'Caos' && gameState === 'playing' && timeLeft % 5 === 0 && timeLeft !== 0) {
      setShuffledOptions(prev => [...prev].sort(() => Math.random() - 0.5));
    }
  }, [timeLeft, primordialCurse, gameState]);

  const handleStartArena = async (arena: TriviaArena | 'oracle') => {
    if (arena !== 'oracle' && arena.questions.length === 0) {
      audio.playSFX('error');
      toast.error("ACCESO DENEGADO: Arena sellada por los dioses.");
      return;
    }
    audio.playSFX('click');

    if (arena === 'oracle') {
      setIsGenerating(true);
      setIsOracleMode(true);
      const generated = await generateInfiniteTrivia('Saint Seiya', 5, 'Difícil');
      if (generated.length > 0) {
        setOracleQuestions(generated);
      } else {
        toast.error("El Oráculo no responde. Intenta de nuevo.");
        setIsGenerating(false);
        return;
      }
      setIsGenerating(false);
      setSelectedArena({ id: 'oracle', title: 'Oráculo de Delfos', description: 'Trivias Infinitas', questions: [] as any });
    } else {
      setIsOracleMode(false);
      // Shuffle questions for the arena
      const shuffledQuestions = [...arena.questions].sort(() => 0.5 - Math.random());
      setSelectedArena({ ...arena, questions: shuffledQuestions });
    }

    setCurrentQuestion(0);
    setScore(0);
    setPlayerHealth(100);
    setEnemyHealth(100);
    setRevealedImage(false);
    setGameState('playing');
    setPrimordialCurse(null);
    setShuffledOptions([0, 1, 2, 3]);

    // COMBO SYSTEM - Reset combo al iniciar partida
    setCombo(0);
    setMaxCombo(0);
    setShowComboPopup(false);

    // Faction Passives Initialization
    const isFirstBoss = !isOracleMode && arena !== 'oracle' && arena.questions.length === 1;
    setIsBossStage(isFirstBoss);
    setLastLoot(null);

    // Randomize enemy element for the first question
    const elements: Element[] = ['Fuego', 'Hielo', 'Rayo', 'Oscuridad', 'Neutral'];
    setEnemyElement(elements[Math.floor(Math.random() * elements.length)]);

    let initialTime = isFirstBoss ? 10 : 15;

    // Cataclysm: Jueves de Viento (+5s)
    const cataclysm = getCurrentCataclysm();
    if (cataclysm?.id === 'Viento') {
      initialTime += 5;
    }

    if (profile?.equippedGear?.artifact?.stats?.time) {
      initialTime += profile.equippedGear.artifact.stats.time;
    }
    if (profile?.faction === 'Griffon') {
      initialTime += 3; // Griffon Passive: +3s
    }

    let armorHealth = 0;
    if (profile?.equippedGear?.armor?.stats?.health) {
      armorHealth = profile.equippedGear.armor.stats.health;
    }

    // Calculate class bonuses
    const specterClass = profile?.specterClass || 'Ninguna';
    const cBonus = CLASS_BONUSES[specterClass];
    setClassBonus(cBonus);

    // Pet Bonuses
    let petDamageBonus = 1.0;
    let petHealthBonus = 0;
    let petTimeBonus = 0;

    if (profile?.pet) {
      if (profile.pet.id === 'cerbero') petDamageBonus = 1.1 + (profile.pet.level * 0.01);
      if (profile.pet.id === 'fenix') petHealthBonus = 20 + (profile.pet.level * 2);
      if (profile.pet.id === 'dragon') petTimeBonus = 5 + profile.pet.level;
    }

    // New Game+ Scaling
    const ngPlusMultiplier = (profile?.ascensionLevel || 0) >= 10 ? 2 : 1;

    const finalHealth = Math.floor((100 + armorHealth + petHealthBonus) * cBonus.health);
    const finalTime = Math.floor((initialTime + petTimeBonus) * cBonus.time);

    setPlayerHealth(finalHealth);
    setTimeLeft(finalTime);

    if (ngPlusMultiplier > 1) {
      toast.error("⚠️ MODO NEW GAME+: Dificultad Extrema Detectada ⚠️", {
        style: { background: 'rgba(255, 0, 0, 0.3)', border: '1px solid red', color: '#fff' }
      });
    }

    if (profile?.faction === 'Garuda') {
      setGarudaShieldActive(true); // Garuda Passive: 1 Shield
    } else {
      setGarudaShieldActive(false);
    }
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
    const nextPlayerHealth = Math.max(0, playerHealth - 20);
    setPlayerHealth(nextPlayerHealth);
    toast.error("¡TIEMPO AGOTADO! Daño crítico recibido.");
    moveToNextQuestion(false, nextPlayerHealth);
  };

  const handleAnswer = async (selectedIndex: number) => {
    if (!selectedArena || revealedImage) return;

    const q = isOracleMode ? oracleQuestions[currentQuestion] : selectedArena.questions[currentQuestion];
    const isCorrect = selectedIndex === q.answer;
    const totalQuestions = isOracleMode ? oracleQuestions.length : selectedArena.questions.length;

    if (isCorrect) {
      audio.playSFX('success');
      setHighlightCorrect(false);

      // COMBO SYSTEM - Incrementar combo
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Combo Multiplier: x1.5 (3+), x2 (5+), x3 (10+)
      let comboMultiplier = 1.0;
      if (newCombo >= 10) comboMultiplier = 3.0;
      else if (newCombo >= 5) comboMultiplier = 2.0;
      else if (newCombo >= 3) comboMultiplier = 1.5;

      // Show combo popup
      if (newCombo >= 3) {
        setShowComboPopup(true);
        setTimeout(() => setShowComboPopup(false), 1500);
        toast.success(`🔥 ¡COMBO x${newCombo}! Multiplicador x${comboMultiplier}`, {
          style: { background: newCombo >= 10 ? 'rgba(255,0,0,0.3)' : 'rgba(255,165,0,0.2)', border: '1px solid orange', color: '#fff' }
        });
      }

      let pointsEarned = isBossStage ? 50 : 20;

      // Elemental Damage Calculation (Player attacks Enemy)
      const playerWeaponElement = profile?.equippedGear?.weapon?.element || 'Neutral';
      const multiplier = getElementMultiplier(playerWeaponElement, enemyElement);

      if (profile?.faction === 'Wyvern') {
        pointsEarned += 2; // Wyvern Passive: +10% damage/points
      }
      if (profile?.equippedGear?.weapon?.stats?.damage) {
        pointsEarned += profile.equippedGear.weapon.stats.damage;
      }

      // Pet Damage Bonus
      if (profile?.pet?.id === 'cerbero') {
        pointsEarned = Math.floor(pointsEarned * (1.1 + (profile.pet.level * 0.01)));
      }

      // Destruction Skill: Bonus points
      pointsEarned += (profile?.skills?.destruction || 0) * 5;

      // Class Bonus
      pointsEarned = Math.floor(pointsEarned * classBonus.damage);

      // COMBO MULTIPLIER aplicado
      pointsEarned = Math.floor(pointsEarned * multiplier * comboMultiplier);

      setScore(s => s + pointsEarned);
      setHiddenOptions([]); // Reset hidden options for next question

      const baseDamage = 100 / totalQuestions;
      setEnemyHealth(h => Math.max(0, h - (baseDamage * multiplier)));
      triggerDamage('enemy');
      setRevealedImage(true); // Reveal image on correct answer

      // Loot Drop Logic with Fortune skill
      const baseLootChance = isBossStage ? 1.0 : 0.25;
      const fortuneBonus = (profile?.skills?.fortune || 0) * 0.02; // 2% per level
      const totalLootChance = baseLootChance + fortuneBonus;

      if (Math.random() < totalLootChance) {
        const droppedLoot = rollLoot(isBossStage);
        if (droppedLoot && user && profile) {
          setLastLoot(droppedLoot);

          // CRITICAL FIX: Usar updateDoc para agregar al array en lugar de reemplazar
          const docRef = doc(db, 'users', user.uid);

          // Primero actualizar Firestore
          await updateDoc(docRef, {
            gearInventory: arrayUnion(droppedLoot)
          });

          // INMEDIATAMENTE después actualizar estado local
          // Usar functional update para evitar race conditions
          setProfile(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              gearInventory: [...(prev.gearInventory || []), droppedLoot]
            };
          });

          toast(`¡Botín Obtenido! ${droppedLoot.name}`, {
            icon: <PackageOpen className={`w-5 h-5 ${RARITY_COLORS[droppedLoot.rarity].split(' ')[0]}`} />,
            style: { background: 'rgba(0,0,0,0.8)', border: `1px solid currentColor`, color: '#fff' }
          });
        }
      } else {
        toast.success(isBossStage ? "¡GOLPE FINAL AL JEFE!" : "¡IMPACTO DIRECTO!");
      }

      // Memory Fragment Drop Logic (5% chance)
      if (Math.random() < 0.05 && user && profile) {
        const docRef = doc(db, 'users', user.uid);
        const currentFragments = profile.memoryFragments || 0;
        const newFragments = currentFragments + 1;

        // Primero actualizar Firestore con increment
        await updateDoc(docRef, {
          memoryFragments: increment(1)
        });

        // INMEDIATAMENTE después actualizar estado local
        setProfile(prev => {
          if (!prev) return prev;
          return { ...prev, memoryFragments: newFragments };
        });

        toast("¡Has encontrado un Fragmento de Memoria!", {
          icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
          style: { background: 'rgba(6, 182, 212, 0.1)', border: '1px solid cyan', color: '#fff' }
        });
      }

      // Wait to show image before moving on
      setTimeout(() => {
        moveToNextQuestion(true);
      }, 2500);
    } else {
      // COMBO SYSTEM - Reset combo al fallar
      if (combo >= 5) {
        toast.error(`💔 ¡Combo roto! Terminaste con x${combo} respuestas consecutivas.`, {
          style: { background: 'rgba(255,0,0,0.2)', border: '1px solid red', color: '#fff' }
        });
      }
      setCombo(0);

      if (shieldActive) {
        setShieldActive(false);
        toast.info("¡Escudo de Atenea activado! Daño bloqueado.");
        audio.playSFX('shield');
        moveToNextQuestion(true);
        return;
      }
      if (garudaShieldActive) {
        audio.playSFX('success'); // Maybe a shield sound?
        setGarudaShieldActive(false);
        setHighlightCorrect(false);
        toast("¡Escudo de Garuda activado! Daño evadido.", {
          icon: <Shield className="w-4 h-4 text-accent" />,
          style: { background: 'rgba(255, 165, 0, 0.1)', border: '1px solid orange', color: '#fff' }
        });
        moveToNextQuestion(true); // Treat as survived
      } else {
        let damage = isBossStage ? 50 : 25;
        setHighlightCorrect(false);

        // Cataclysm: Lunes de Sangre (2x Damage)
        const cataclysm = getCurrentCataclysm();
        if (cataclysm?.id === 'Sangre') {
          damage *= 2;
        }

        // Survival Skill: Evasion chance (5% per level)
        const evasionChance = (profile?.skills?.survival || 0) * 0.05;
        if (Math.random() < evasionChance) {
          toast.success("¡Evasión Exitosa! (Habilidad: Supervivencia)");
          damage = 0;
        } else {
          // Elemental Defense Calculation (Enemy attacks Player)
          const playerArmorElement = profile?.equippedGear?.armor?.element || 'Neutral';
          const defenseMultiplier = getElementMultiplier(enemyElement, playerArmorElement);
          damage = Math.floor(damage * defenseMultiplier);

          if (defenseMultiplier > 1) {
            toast.error(isBossStage ? "¡GOLPE CRÍTICO DEL JEFE! (Súper Efectivo)" : "¡EVASIÓN FALLIDA! Daño crítico recibido.");
          } else if (defenseMultiplier < 1) {
            toast.error("Daño recibido, pero tu armadura resistió parte del impacto.");
          } else {
            toast.error(isBossStage ? "¡GOLPE DEL JEFE!" : "¡EVASIÓN FALLIDA! Daño recibido.");
          }
        }

        audio.playSFX('damage');
        const nextPlayerHealth = Math.max(0, playerHealth - damage);
        setPlayerHealth(nextPlayerHealth);
        triggerDamage('player');

        moveToNextQuestion(false, nextPlayerHealth);
      }
    }
  };

  const moveToNextQuestion = (wasCorrect: boolean, nextPlayerHealth: number = playerHealth) => {
    if (!selectedArena) return;

    const totalQuestions = isOracleMode ? oracleQuestions.length : selectedArena.questions.length;

    // Check win/lose conditions
    if (!wasCorrect && nextPlayerHealth <= 0) {
      finishGame(false);
      return;
    }

    if (currentQuestion + 1 < totalQuestions) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);

      const isNextBoss = !isOracleMode && nextQ === totalQuestions - 1;
      setIsBossStage(isNextBoss);

      if (isNextBoss) {
        audio.playSFX('error');
        toast.error("¡ADVERTENCIA! JEFE FINAL ACERCÁNDOSE", {
          style: { background: 'rgba(255, 0, 0, 0.2)', border: '1px solid red', color: '#fff' }
        });

        // Primordial Curse Chance
        if (Math.random() < 0.5) {
          const curses = ['Chronos', 'Caos', 'Nyx'];
          const curse = curses[Math.floor(Math.random() * curses.length)];
          setPrimordialCurse(curse);
          toast.error(`⚠️ MALDICIÓN PRIMORDIAL: ${curse.toUpperCase()} ⚠️`, {
            description: curse === 'Chronos' ? 'El tiempo fluye al doble de velocidad.' : curse === 'Caos' ? 'Las opciones se barajan constantemente.' : 'Las opciones están ocultas por la oscuridad.',
            style: { background: 'rgba(147, 51, 234, 0.3)', border: '1px solid purple', color: '#fff' }
          });
        }
      }

      // Randomize enemy element for the next question
      const elements: Element[] = ['Fuego', 'Hielo', 'Rayo', 'Oscuridad', 'Neutral'];
      setEnemyElement(elements[Math.floor(Math.random() * elements.length)]);

      let nextTime = isNextBoss ? 10 : 15;
      if (profile?.equippedGear?.artifact?.stats?.time) {
        nextTime += profile.equippedGear.artifact.stats.time;
      }
      if (profile?.faction === 'Griffon') nextTime += 3;

      const finalNextTime = Math.floor(nextTime * classBonus.time);
      setTimeLeft(finalNextTime);
      setRevealedImage(false);
      setLastLoot(null);
    } else {
      finishGame(true);
    }
  };

  const finishGame = async (survived: boolean) => {
    setGameState('result');
    if (user && profile) {
      try {
        let earnedObolos = Math.floor(score / 2);
        let finalScore = score;

        // Cataclysm: Lunes de Sangre (2x XP/Obolos)
        const cataclysm = getCurrentCataclysm();
        if (cataclysm?.id === 'Sangre') {
          earnedObolos *= 2;
          finalScore *= 2;
        }

        // XP Logic
        const currentXP = profile.xp || 0;
        const newXP = currentXP + finalScore;
        const currentLevel = profile.level || 1;
        const newLevel = getLevelFromXP(newXP);

        let cosmosPointsGained = 0;
        if (newLevel > currentLevel) {
          cosmosPointsGained = newLevel - currentLevel;
          toast.success(`¡Nivel de Espectro Aumentado! Eres nivel ${newLevel}. +${cosmosPointsGained} Puntos de Cosmos.`);
        }

        await updateProfile({
          score: profile.score + finalScore,
          obolos: (profile.obolos || 0) + earnedObolos,
          xp: newXP,
          level: newLevel,
          cosmosPoints: (profile.cosmosPoints || 0) + cosmosPointsGained
        });

        if (!isOracleMode) {
          const scoreRef = doc(db, 'triviaScores', `${user.uid}_${selectedArena?.id}`);
          const scoreDoc = await getDoc(scoreRef);

          if (!scoreDoc.exists() || finalScore > scoreDoc.data().score) {
            await setDoc(scoreRef, {
              uid: user.uid,
              specterName: profile.specterName || profile.displayName,
              category: selectedArena?.title,
              score: finalScore,
              updatedAt: new Date()
            });
          }
        }

        // Engine updates
        await incrementStat(user.uid, 'triviasPlayed');
        if (survived) {
          await incrementStat(user.uid, 'triviasWon');
        }

        // Update mission progress and get the updated missions
        const updatedMissions = await updateMissionProgress(user.uid, profile, 'daily_trivias');

        // Update local profile state with the new mission progress
        if (updatedMissions) {
          await updateProfile({ dailyMissions: updatedMissions });
        }

        await checkAndAwardBadges(user.uid, profile);

      } catch (error) {
        console.error("Error saving score", error);
      }
    }
  };

  // Helper for element icons
  const getElementIcon = (element: Element) => {
    switch (element) {
      case 'Fuego': return <Flame className="w-4 h-4 text-red-500" />;
      case 'Hielo': return <Snowflake className="w-4 h-4 text-blue-300" />;
      case 'Rayo': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Oscuridad': return <Moon className="w-4 h-4 text-purple-600" />;
      default: return <Circle className="w-4 h-4 text-slate-400" />;
    }
  };

  // --- RENDER SELECTION ---
  const handleUseConsumable = async (type: 'time_potion' | 'clairvoyance_potion' | 'healing_potion') => {
    if (!user || !profile || gameState !== 'playing') return;

    const count = profile.consumables?.[type] || 0;
    if (count <= 0) {
      toast.error("No tienes este consumible.");
      return;
    }

    try {
      const currentConsumables = profile.consumables || { time_potion: 0, clairvoyance_potion: 0, healing_potion: 0 };
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        consumables: {
          ...currentConsumables,
          [type]: currentConsumables[type] - 1
        }
      }, { merge: true });

      audio.playSFX('success');

      if (type === 'time_potion') {
        setTimeLeft(prev => prev + 10);
        toast.success("Poción de Cronos: +10 Segundos");
      } else if (type === 'healing_potion') {
        let armorHealth = 0;
        if (profile?.equippedGear?.armor?.stats?.health) {
          armorHealth = profile.equippedGear.armor.stats.health;
        }
        const maxHealth = Math.floor((100 + armorHealth) * classBonus.health);
        setPlayerHealth(prev => Math.min(maxHealth, prev + 50));
        toast.success("Lágrima de Atenea: +50 HP");
      } else if (type === 'clairvoyance_potion') {
        const q = isOracleMode ? oracleQuestions[currentQuestion] : selectedArena!.questions[currentQuestion];
        const wrongIndices = q.options
          .map((_, idx) => idx)
          .filter(idx => idx !== q.answer);

        // Hide 2 wrong options
        const toHide = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
        setHiddenOptions(toHide);
        toast.success("Ojo de las Moiras: Opciones incorrectas eliminadas.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const usePower = () => {
    if (!profile?.activePower) return;

    audio.playSFX('power_activate');

    if (profile.activePower === 'Cronos') {
      setIsTimeStopped(true);
      toast.success("¡TIEMPO DETENIDO!");
      setTimeout(() => setIsTimeStopped(false), 10000);
    } else if (profile.activePower === 'Atenea') {
      setShieldActive(true);
      toast.success("¡ESCUDO DE ATENEA ACTIVADO!");
    } else if (profile.activePower === 'Apolo') {
      setHighlightCorrect(true);
      toast.success("¡VISIÓN DIVINA ACTIVADA!");
    }
  };

  if (gameState === 'selection') {
    return (
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
            Arena de los Dioses
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Selecciona tu nivel de poder</p>
        </div>

        {!selectedLevel ? (
          <div className="space-y-8">
            {profile?.faction && (
              <div className="bg-background/50 border border-accent/20 p-4 clip-diagonal text-left space-y-2 max-w-2xl mx-auto mb-8">
                <h4 className="font-display text-accent uppercase tracking-widest text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Pasiva de Facción Activa
                </h4>
                <p className="text-xs font-mono text-muted-foreground">
                  {profile.faction === 'Wyvern' && "Furia de Wyvern: +10% de daño (puntos) al acertar."}
                  {profile.faction === 'Griffon' && "Hilos de Griffon: +3 segundos extra para responder."}
                  {profile.faction === 'Garuda' && "Aleteo de Garuda: 1 Escudo de viento por partida (ignora el primer fallo)."}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRIVIA_DATABASE.map((level, idx) => (
                <Card key={level.id} className="glass-panel border-accent/20 hover:border-accent transition-all duration-300 cursor-pointer group clip-card" onClick={() => { audio.playSFX('click'); setSelectedLevel(level); }} onMouseEnter={() => audio.playSFX('hover')}>
                  <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono text-accent/70">NIVEL 0{idx + 1}</span>
                      <Flame className={`w-5 h-5 ${idx > 2 ? 'text-primary' : 'text-accent'} group-hover:animate-pulse`} />
                    </div>
                    <CardTitle className="font-display text-2xl text-white group-hover:text-accent transition-colors uppercase tracking-wider">{level.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{level.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}

              {/* Oracle Mode Card */}
              <Card className="glass-panel border-purple-500/30 hover:border-purple-500 transition-all duration-300 cursor-pointer group clip-card relative overflow-hidden" onClick={() => handleStartArena('oracle')} onMouseEnter={() => audio.playSFX('hover')}>
                <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-purple-400">MODO IA</span>
                    <Sparkles className="w-5 h-5 text-purple-500 group-hover:animate-pulse" />
                  </div>
                  <CardTitle className="font-display text-2xl text-white group-hover:text-purple-400 transition-colors uppercase tracking-wider">
                    {isGenerating ? 'Invocando...' : 'Oráculo de Delfos'}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Trivias infinitas generadas por IA. La dificultad se adapta a tu cosmos.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Button variant="outline" onClick={() => { audio.playSFX('click'); setSelectedLevel(null); }} className="mb-4 border-accent/50 text-accent hover:bg-accent/10 clip-diagonal" onMouseEnter={() => audio.playSFX('hover')}>
              &lt; Volver a Niveles
            </Button>
            <h2 className="text-3xl font-display text-white uppercase tracking-widest border-b border-accent/30 pb-4">
              Nivel: <span className="text-accent">{selectedLevel.name}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedLevel.arenas.map((arena, idx) => (
                <Card key={arena.id} className={`glass-panel border-accent/20 transition-all duration-300 clip-card ${arena.questions.length > 0 ? 'hover:border-primary cursor-pointer group' : 'opacity-50 cursor-not-allowed'}`} onClick={() => handleStartArena(arena)} onMouseEnter={() => audio.playSFX('hover')}>
                  <CardHeader>
                    <CardTitle className={`font-display text-lg uppercase tracking-wider ${arena.questions.length > 0 ? 'text-white group-hover:text-primary' : 'text-muted-foreground'}`}>
                      {arena.title}
                    </CardTitle>
                    <CardDescription className="text-xs">{arena.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs font-mono text-accent/50">
                      {arena.questions.length > 0 ? `[ ${arena.questions.length} PREGUNTAS ]` : '[ SELLADO ]'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER PLAYING ---
  if (gameState === 'playing' && selectedArena) {
    const q = isOracleMode ? oracleQuestions[currentQuestion] : selectedArena.questions[currentQuestion];
    const totalQuestions = isOracleMode ? oracleQuestions.length : selectedArena.questions.length;

    return (
      <div className={`max-w-4xl mx-auto mt-4 transition-all duration-100 ${isDamaged ? 'animate-shake' : ''}`}>

        {/* HUD: Health Bars & Timer */}
        <div className={`flex items-center justify-between mb-8 bg-background/80 p-4 rounded-sm border clip-diagonal relative z-20 ${isBossStage ? 'border-primary/50 shadow-[0_0_20px_rgba(255,0,0,0.2)]' : 'border-accent/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]'}`}>

          {/* Player Avatar */}
          <div className="absolute -left-6 -top-6 z-30">
            <Avatar className="w-16 h-16 border-2 border-accent clip-hex shadow-[0_0_15px_rgba(0,240,255,0.3)] bg-background">
              <AvatarImage src={profile?.photoURL || user?.photoURL || ''} className="object-cover" />
              <AvatarFallback className="bg-secondary text-accent font-display text-xl">
                {profile?.specterName?.[0] || 'E'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 space-y-2 pl-12">
            <div className="flex justify-between text-xs font-mono font-bold tracking-widest text-accent">
              <span>{profile?.specterName?.toUpperCase() || 'ESPECTRO'}</span>
              <span className="flex items-center gap-2">
                {garudaShieldActive && <Shield className="w-3 h-3 text-orange-400" title="Escudo de Garuda" />}
                <span className={playerHealth <= 25 ? 'text-primary animate-pulse' : ''}>{Math.max(0, playerHealth)}%</span>
              </span>
            </div>
            <div className="h-4 bg-background border border-accent/50 rounded-sm overflow-hidden clip-diagonal relative">
              {/* Damage flash effect */}
              {isDamaged && <div className="absolute inset-0 bg-primary/50 z-10" />}
              <motion.div
                className={`h-full ${playerHealth <= 25 ? 'bg-primary' : 'bg-accent'} shadow-[0_0_10px_currentColor]`}
                initial={{ width: '100%' }}
                animate={{ width: `${playerHealth}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="mx-8 flex flex-col items-center justify-center relative">
            {/* Hexagon timer container */}
            <div className={`absolute inset-0 border-2 clip-hex opacity-50 ${timeLeft <= 5 ? 'border-primary animate-ping' : 'border-accent'}`} />
            <div className={`text-4xl font-display font-bold w-16 h-16 flex items-center justify-center clip-hex bg-background/80 ${timeLeft <= 5 ? 'text-primary neon-text-primary' : 'text-white'}`}>
              {timeLeft}
            </div>
          </div>

          {/* COMBO DISPLAY */}
          {combo >= 3 && (
            <div className="flex flex-col items-center">
              <div className={`text-2xl font-display font-bold ${combo >= 10 ? 'text-red-500 animate-pulse' : combo >= 5 ? 'text-orange-500' : 'text-yellow-400'} neon-text-primary`}>
                🔥 x{combo}
              </div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                {combo >= 10 ? '¡LEGENDARIO!' : combo >= 5 ? '¡ÉPICO!' : '¡COMBO!'}
              </div>
            </div>
          )}

          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold tracking-widest text-primary">
              <span className="flex items-center gap-2">
                {isBossStage ? 'JEFE FINAL' : 'SISTEMA DE DEFENSA'}
                <span title={`Elemento Enemigo: ${enemyElement}`}>{getElementIcon(enemyElement)}</span>
              </span>
              <span>{Math.ceil(enemyHealth)}%</span>
            </div>
            <div className="h-4 bg-background border border-primary/50 rounded-sm overflow-hidden clip-diagonal relative">
              {/* Damage flash effect */}
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

        {/* Question Card with Background Reveal */}
        <Card className={`overflow-hidden relative min-h-[400px] flex flex-col justify-end clip-card ${isBossStage ? 'border-primary/50 shadow-[0_0_40px_rgba(255,0,0,0.2)]' : 'border-accent/50 shadow-[0_0_30px_rgba(0,240,255,0.15)]'}`}>
          {/* Scanline effect */}
          <div className="absolute inset-0 scanline opacity-20 pointer-events-none z-30" />

          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-1000"
            style={{ backgroundImage: `url(${q.bgImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'})` }}
          />
          {/* Black Overlay (hides image until revealed) */}
          <div className={`absolute inset-0 transition-colors duration-1000 z-10 ${revealedImage ? 'bg-background/40' : 'bg-background/95'}`} />

          {/* Content */}
          <div className="relative z-20 p-8 bg-gradient-to-t from-background via-background/90 to-transparent pt-32">
            <div className="text-center mb-8">
              <span className="text-xs font-mono text-accent tracking-[0.3em] uppercase mb-2 block">
                [ FASE DE COMBATE {currentQuestion + 1} / {totalQuestions} ]
              </span>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{q.q}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shuffledOptions.map((originalIdx) => {
                const opt = q.options[originalIdx];
                const isHidden = hiddenOptions.includes(originalIdx);
                if (isHidden) return null;

                return (
                  <motion.div
                    key={originalIdx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      disabled={revealedImage}
                      className={`w-full h-auto py-4 text-lg font-sans tracking-wide border-accent/30 hover:border-accent hover:bg-accent/20 transition-all clip-diagonal relative overflow-hidden group ${revealedImage && originalIdx === q.answer ? 'bg-accent/40 border-accent neon-border text-white' : 'bg-background/80 text-muted-foreground'} ${primordialCurse === 'Nyx' && !revealedImage ? 'text-transparent hover:text-white' : ''} ${highlightCorrect && originalIdx === q.answer ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : ''}`}
                      onClick={() => handleAnswer(originalIdx)}
                      onMouseEnter={() => audio.playSFX('hover')}
                    >
                      {/* Hover scan effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                      <span className="relative z-10">{opt}</span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* Primordial Power Button */}
            {profile?.activePower && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={usePower}
                  disabled={revealedImage || gameState !== 'playing'}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white clip-diagonal px-8 py-4 uppercase tracking-widest font-display flex items-center gap-2 shadow-[0_0_15px_rgba(202,138,4,0.3)]"
                >
                  <Sparkles className="w-5 h-5" /> Poder: {profile.activePower}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // --- RENDER RESULT ---
  if (gameState === 'result') {
    const isVictory = playerHealth > 0;
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-8 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-6"
        >
          {isVictory ? (
            <>
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full animate-pulse" />
                <Trophy className="w-full h-full text-accent neon-text-accent relative z-10" />
              </div>
              <h2 className="text-5xl font-display font-bold text-accent uppercase tracking-widest">¡Victoria!</h2>
              <p className="text-muted-foreground font-mono tracking-widest text-sm">SISTEMA ENEMIGO DESTRUIDO.</p>
            </>
          ) : (
            <>
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <Skull className="w-full h-full text-primary neon-text-primary relative z-10" />
              </div>
              <h2 className="text-5xl font-display font-bold text-primary uppercase tracking-widest">Derrota</h2>
              <p className="text-muted-foreground font-mono tracking-widest text-sm">TU COSMOS SE HA EXTINGUIDO.</p>
            </>
          )}

          <div className="p-6 glass-panel border-accent/30 clip-card relative overflow-hidden">
            <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
            <p className="text-sm text-accent/70 uppercase tracking-widest mb-2 font-mono">Puntuación de Combate</p>
            <p className="text-5xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">{score}</p>
          </div>

          <Button onClick={() => { audio.playSFX('click'); setGameState('selection'); }} className="w-full bg-accent/20 hover:bg-accent/40 text-accent border border-accent/50 clip-diagonal py-6 font-bold tracking-widest uppercase transition-all hover:neon-border group" onMouseEnter={() => audio.playSFX('hover')}>
            <span className="group-hover:tracking-[0.3em] transition-all duration-300">Volver a la Matriz</span>
          </Button>
        </motion.div>
      </div>
    );
  }

  return null;
};
