import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Clock,
  Crown,
  EyeOff,
  Flame,
  Moon,
  Mountain,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  Sun,
  Swords,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { audio } from '@/lib/audio';
import { generateInfiniteTrivia, GeneratedTrivia } from '@/lib/gemini';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { rollGem, Equipment, RARITY_COLORS, SetType, GearType, Element } from '@/lib/rpg';
import { getCombatContext } from '@/lib/combat';

type BossEffect = 'time_warp' | 'scramble' | 'hide_options' | 'drain' | 'short_time';

type SecretBoss =
  | 'Chronos'
  | 'Caos'
  | 'Nyx'
  | 'Erebus'
  | 'Tartarus'
  | 'Gaia'
  | 'Uranus'
  | 'Pontus'
  | 'Ourea'
  | 'Hemera'
  | 'Aether'
  | 'Eros'
  | 'Ananke'
  | 'Phanes'
  | 'Thalassa'
  | 'Moros'
  | 'Thanatos'
  | 'Hypnos'
  | 'Nemesis'
  | 'Eris';

type BossDefinition = {
  id: SecretBoss;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  cardBorder: string;
  cardGlow: string;
  buttonClass: string;
  effect: BossEffect;
  element: Element;
  rewardTitle: string;
  timeLimit: number;
};

const getBossCounterStrategy = (effect: BossEffect) => {
  switch (effect) {
    case 'time_warp':
      return 'Prioriza bonus de tiempo, espectros tempo y sets que extiendan el reloj.';
    case 'scramble':
      return 'Apuesta por dano alto y lectura rapida para castigar antes de que el texto se distorsione.';
    case 'hide_options':
      return 'Aprovecha memoria del tema y barreras, porque tendras menos opciones visibles.';
    case 'drain':
      return 'Lleva vida adicional, barreras y control del ritmo para aguantar el drenaje.';
    case 'short_time':
      return 'Las reliquias de tiempo y los presets de reaccion rapida son la mejor respuesta.';
    default:
      return 'Adapta tu build al efecto del jefe.';
  }
};

const SECRET_BOSSES: BossDefinition[] = [
  { id: 'Chronos', title: 'Chronos', description: 'El tiempo corre el doble de rapido.', icon: Clock, iconClass: 'text-yellow-400', cardBorder: 'border-yellow-500/30', cardGlow: 'from-yellow-900/10', buttonClass: 'bg-yellow-600 hover:bg-yellow-500', effect: 'time_warp', element: 'Neutral', rewardTitle: 'Asesino de Chronos', timeLimit: 10 },
  { id: 'Caos', title: 'Caos', description: 'La realidad se distorsiona y el texto se corrompe.', icon: EyeOff, iconClass: 'text-purple-400', cardBorder: 'border-purple-500/30', cardGlow: 'from-purple-900/10', buttonClass: 'bg-purple-600 hover:bg-purple-500', effect: 'scramble', element: 'Oscuridad', rewardTitle: 'Vencedor del Caos', timeLimit: 10 },
  { id: 'Nyx', title: 'Nyx', description: 'Oculta opciones en la oscuridad del vacio.', icon: Moon, iconClass: 'text-indigo-400', cardBorder: 'border-indigo-500/30', cardGlow: 'from-indigo-900/10', buttonClass: 'bg-indigo-600 hover:bg-indigo-500', effect: 'hide_options', element: 'Oscuridad', rewardTitle: 'Portador de la Noche', timeLimit: 10 },
  { id: 'Erebus', title: 'Erebus', description: 'Drena tu vida constantemente.', icon: Skull, iconClass: 'text-slate-400', cardBorder: 'border-slate-500/30', cardGlow: 'from-slate-900/10', buttonClass: 'bg-slate-600 hover:bg-slate-500', effect: 'drain', element: 'Oscuridad', rewardTitle: 'Senor de las Sombras', timeLimit: 10 },
  { id: 'Tartarus', title: 'Tartarus', description: 'Solo tienes 5 segundos para responder.', icon: ShieldAlert, iconClass: 'text-red-600', cardBorder: 'border-red-800/30', cardGlow: 'from-red-900/10', buttonClass: 'bg-red-800 hover:bg-red-700', effect: 'short_time', element: 'Fuego', rewardTitle: 'Conquistador del Abismo', timeLimit: 5 },
  { id: 'Gaia', title: 'Gaia', description: 'La tierra te presiona con ventanas de tiempo brutales.', icon: Mountain, iconClass: 'text-emerald-400', cardBorder: 'border-emerald-500/30', cardGlow: 'from-emerald-900/10', buttonClass: 'bg-emerald-600 hover:bg-emerald-500', effect: 'short_time', element: 'Neutral', rewardTitle: 'Heraldo de Gaia', timeLimit: 5 },
  { id: 'Uranus', title: 'Uranus', description: 'El firmamento colapsa sobre ti con respuestas fugaces.', icon: Wind, iconClass: 'text-cyan-400', cardBorder: 'border-cyan-500/30', cardGlow: 'from-cyan-900/10', buttonClass: 'bg-cyan-600 hover:bg-cyan-500', effect: 'short_time', element: 'Rayo', rewardTitle: 'Soberano del Firmamento', timeLimit: 5 },
  { id: 'Pontus', title: 'Pontus', description: 'El mar primigenio consume tu vida poco a poco.', icon: Waves, iconClass: 'text-blue-400', cardBorder: 'border-blue-500/30', cardGlow: 'from-blue-900/10', buttonClass: 'bg-blue-600 hover:bg-blue-500', effect: 'drain', element: 'Hielo', rewardTitle: 'Azote del Mar Primigenio', timeLimit: 10 },
  { id: 'Ourea', title: 'Ourea', description: 'Las montanas del origen deforman la realidad.', icon: Mountain, iconClass: 'text-stone-400', cardBorder: 'border-stone-500/30', cardGlow: 'from-stone-900/10', buttonClass: 'bg-stone-600 hover:bg-stone-500', effect: 'scramble', element: 'Neutral', rewardTitle: 'Dominador de las Cumbres', timeLimit: 10 },
  { id: 'Hemera', title: 'Hemera', description: 'La luz enceguece y borra opciones del combate.', icon: Sun, iconClass: 'text-amber-400', cardBorder: 'border-amber-500/30', cardGlow: 'from-amber-900/10', buttonClass: 'bg-amber-600 hover:bg-amber-500', effect: 'hide_options', element: 'Fuego', rewardTitle: 'Portador del Alba', timeLimit: 10 },
  { id: 'Aether', title: 'Aether', description: 'El eter acelera cada segundo de la batalla.', icon: Wind, iconClass: 'text-sky-300', cardBorder: 'border-sky-500/30', cardGlow: 'from-sky-900/10', buttonClass: 'bg-sky-600 hover:bg-sky-500', effect: 'time_warp', element: 'Rayo', rewardTitle: 'Dueno del Eter', timeLimit: 10 },
  { id: 'Eros', title: 'Eros', description: 'El deseo primordial rompe la forma de las palabras.', icon: Sparkles, iconClass: 'text-pink-400', cardBorder: 'border-pink-500/30', cardGlow: 'from-pink-900/10', buttonClass: 'bg-pink-600 hover:bg-pink-500', effect: 'scramble', element: 'Fuego', rewardTitle: 'Arquero del Primer Deseo', timeLimit: 10 },
  { id: 'Ananke', title: 'Ananke', description: 'El destino acelera el reloj sin misericordia.', icon: Crown, iconClass: 'text-fuchsia-400', cardBorder: 'border-fuchsia-500/30', cardGlow: 'from-fuchsia-900/10', buttonClass: 'bg-fuchsia-600 hover:bg-fuchsia-500', effect: 'time_warp', element: 'Oscuridad', rewardTitle: 'Rompedor del Destino', timeLimit: 10 },
  { id: 'Phanes', title: 'Phanes', description: 'La primera luz altera el flujo del tiempo.', icon: Zap, iconClass: 'text-yellow-300', cardBorder: 'border-yellow-300/30', cardGlow: 'from-yellow-700/10', buttonClass: 'bg-yellow-500 hover:bg-yellow-400', effect: 'time_warp', element: 'Rayo', rewardTitle: 'Primera Luz Triunfante', timeLimit: 10 },
  { id: 'Thalassa', title: 'Thalassa', description: 'La marea profunda ahoga opciones del tablero.', icon: Waves, iconClass: 'text-teal-400', cardBorder: 'border-teal-500/30', cardGlow: 'from-teal-900/10', buttonClass: 'bg-teal-600 hover:bg-teal-500', effect: 'hide_options', element: 'Hielo', rewardTitle: 'Guardian de las Profundidades', timeLimit: 10 },
  { id: 'Moros', title: 'Moros', description: 'La fatalidad elimina caminos y opciones seguras.', icon: Shield, iconClass: 'text-zinc-300', cardBorder: 'border-zinc-500/30', cardGlow: 'from-zinc-900/10', buttonClass: 'bg-zinc-600 hover:bg-zinc-500', effect: 'hide_options', element: 'Oscuridad', rewardTitle: 'Vencedor del Sino', timeLimit: 10 },
  { id: 'Thanatos', title: 'Thanatos', description: 'La muerte primordial te desgasta con cada segundo.', icon: Skull, iconClass: 'text-red-400', cardBorder: 'border-red-500/30', cardGlow: 'from-red-900/10', buttonClass: 'bg-red-600 hover:bg-red-500', effect: 'drain', element: 'Oscuridad', rewardTitle: 'Desafiante de la Muerte', timeLimit: 10 },
  { id: 'Hypnos', title: 'Hypnos', description: 'El sueno profundo reduce al minimo tu margen de respuesta.', icon: Moon, iconClass: 'text-violet-400', cardBorder: 'border-violet-500/30', cardGlow: 'from-violet-900/10', buttonClass: 'bg-violet-600 hover:bg-violet-500', effect: 'short_time', element: 'Hielo', rewardTitle: 'Quebrantador del Sueno', timeLimit: 5 },
  { id: 'Nemesis', title: 'Nemesis', description: 'La retribucion te castiga drenando tu resistencia.', icon: Swords, iconClass: 'text-orange-400', cardBorder: 'border-orange-500/30', cardGlow: 'from-orange-900/10', buttonClass: 'bg-orange-600 hover:bg-orange-500', effect: 'drain', element: 'Fuego', rewardTitle: 'Ejecutor del Equilibrio', timeLimit: 10 },
  { id: 'Eris', title: 'Eris', description: 'La discordia deforma el texto y siembra confusion.', icon: Flame, iconClass: 'text-rose-400', cardBorder: 'border-rose-500/30', cardGlow: 'from-rose-900/10', buttonClass: 'bg-rose-600 hover:bg-rose-500', effect: 'scramble', element: 'Fuego', rewardTitle: 'Senor de la Discordia', timeLimit: 10 },
];

export const SecretBosses: React.FC = () => {
  const { user, profile } = useAuth();
  const { activeSpecter, activeSetBonus, activeSetEffect, bonuses: combatBonuses } = useMemo(
    () => getCombatContext(profile),
    [profile]
  );
  const defeatedBosses = useMemo(
    () => SECRET_BOSSES.filter((boss) => profile?.titles?.includes(boss.rewardTitle)).length,
    [profile?.titles]
  );
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [selectedBoss, setSelectedBoss] = useState<SecretBoss | null>(null);
  const [questions, setQuestions] = useState<GeneratedTrivia[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [bossHealth, setBossHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [lastLoot, setLastLoot] = useState<Equipment | null>(null);
  const [bonusLoot, setBonusLoot] = useState<Equipment | null>(null);
  const [rewardGemName, setRewardGemName] = useState('');
  const [rewardObolos, setRewardObolos] = useState(0);
  const [rewardMemory, setRewardMemory] = useState(0);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [specterBarrierCharges, setSpecterBarrierCharges] = useState(0);

  const selectedBossData = useMemo(
    () => SECRET_BOSSES.find((boss) => boss.id === selectedBoss) || null,
    [selectedBoss]
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      const interval = selectedBossData?.effect === 'time_warp' ? 500 : 1000;
      timer = setInterval(() => {
        setTimeLeft((time) => time - 1);

        if (selectedBossData?.effect === 'drain') {
          setPlayerHealth((health) => {
            const nextHealth = Math.max(0, health - 5);
            if (nextHealth === 0) {
              setTimeout(() => finishGame(false), 0);
            }
            return nextHealth;
          });
        }
      }, interval);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeOut();
    }

    return () => clearInterval(timer);
  }, [timeLeft, gameState, selectedBossData]);

  const absorbIncomingHit = () => {
    if (specterBarrierCharges > 0) {
      setSpecterBarrierCharges((current) => Math.max(0, current - 1));
      toast.info(activeSpecter?.ability.name ? `La habilidad ${activeSpecter.ability.name} bloqueo el castigo.` : 'Barrera espectral activada.');
      audio.playSFX('shield');
      return true;
    }

    if (Math.random() < combatBonuses.dodgeChance) {
      toast.success(activeSpecter?.ability.name ? `${activeSpecter.ability.name}: evasion perfecta.` : 'Evasion exitosa.');
      audio.playSFX('success');
      return true;
    }

    return false;
  };

  const handleChallenge = async (bossId: SecretBoss) => {
    if (!user || !profile) return;
    if ((profile.memoryFragments || 0) < 5) {
      toast.error('Necesitas 5 Fragmentos de Memoria para invocar a este Dios Primordial.');
      return;
    }

    const bossData = SECRET_BOSSES.find((boss) => boss.id === bossId);
    if (!bossData) return;

    setIsGenerating(true);
    const generated = await generateInfiniteTrivia('Dios', 10);

    if (generated.length === 0) {
      toast.error('El Primordial se niega a responder.');
      setIsGenerating(false);
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        memoryFragments: increment(-5)
      });

      setSelectedBoss(bossId);
      setQuestions(generated);
      setCurrentQ(0);
      setBossHealth(100);
      setPlayerHealth(100 + combatBonuses.bonusHealth);
      setTimeLeft(bossData.timeLimit + combatBonuses.bonusTime);
      setLastLoot(null);
      setBonusLoot(null);
      setRewardGemName('');
      setRewardObolos(0);
      setRewardMemory(0);
      setHiddenOptions([]);
      setSpecterBarrierCharges(combatBonuses.startingShields);
      setGameState('playing');
      audio.playSFX('click');
    } catch (error) {
      toast.error('Error al consumir Fragmentos.');
    } finally {
      setIsGenerating(false);
    }
  };

  const moveToNext = (nextPlayerHealth: number, nextBossHealth: number) => {
    if (nextPlayerHealth <= 0 && nextBossHealth > 0) {
      finishGame(false);
      return;
    }

    if (nextBossHealth <= 0) {
      finishGame(true);
      return;
    }

    if (currentQ + 1 < questions.length) {
      const nextQuestion = currentQ + 1;
      setCurrentQ(nextQuestion);
      setTimeLeft((selectedBossData?.timeLimit || 10) + combatBonuses.bonusTime);

      if (selectedBossData?.effect === 'hide_options') {
        const nextTrivia = questions[nextQuestion];
        const toHide: number[] = [];

        for (let i = 0; i < nextTrivia.options.length; i++) {
          if (Math.random() > 0.6) {
            toHide.push(i);
          }
        }

        setHiddenOptions(toHide);
      } else {
        setHiddenOptions([]);
      }

      return;
    }

    finishGame(false);
  };

  const handleTimeOut = () => {
    if (absorbIncomingHit()) {
      moveToNext(playerHealth, bossHealth);
      return;
    }

    audio.playSFX('damage');
    const nextPlayerHealth = Math.max(0, playerHealth - 30);
    setPlayerHealth(nextPlayerHealth);
    toast.error('El tiempo te devora.');
    moveToNext(nextPlayerHealth, bossHealth);
  };

  const handleAnswer = (selectedIndex: number) => {
    const q = questions[currentQ];
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      audio.playSFX('success');
      const bossDamage = Math.max(10, Math.round(10 * combatBonuses.damageMultiplier));
      const nextBossHealth = Math.max(0, bossHealth - bossDamage);
      setBossHealth(nextBossHealth);
      toast.success('Impacto al Primordial.');
      moveToNext(playerHealth, nextBossHealth);
      return;
    }

    if (absorbIncomingHit()) {
      moveToNext(playerHealth, bossHealth);
      return;
    }

    audio.playSFX('damage');
    const nextPlayerHealth = Math.max(0, playerHealth - 30);
    setPlayerHealth(nextPlayerHealth);
    toast.error('El Primordial contraataca.');
    moveToNext(nextPlayerHealth, bossHealth);
  };

  const generateGodLoot = (boss: BossDefinition): Equipment => {
    const types: GearType[] = ['weapon', 'armor', 'artifact'];
    const type = types[Math.floor(Math.random() * types.length)];

    let name = '';
    if (type === 'weapon') name = `Arma de ${boss.id}`;
    if (type === 'armor') name = `Manto de ${boss.id}`;
    if (type === 'artifact') name = `Reliquia de ${boss.id}`;

    return {
      id: `god_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      type,
      rarity: 'divino',
      stats: {
        damage: type === 'weapon' ? 50 : 0,
        health: type === 'armor' ? 200 : 0,
        time: type === 'artifact' ? 10 : 0
      },
      element: boss.element,
      set: boss.id as SetType
    };
  };

  const finishGame = async (won: boolean) => {
    setGameState('result');

    if (!won || !user || !profile || !selectedBossData) {
      toast.error('Has sido aniquilado por el Primordial.');
      return;
    }

    const loot = generateGodLoot(selectedBossData);
    const extraLoot = Math.random() < combatBonuses.lootChanceBonus ? generateGodLoot(selectedBossData) : null;
    const gem = rollGem();
    const obolosReward = Math.floor(1000 * combatBonuses.obolosMultiplier);
    const memoryReward = Math.random() < combatBonuses.memoryDropBonus ? 1 : 0;

    setLastLoot(loot);
    setBonusLoot(extraLoot);
    setRewardGemName(gem.name);
    setRewardObolos(obolosReward);
    setRewardMemory(memoryReward);
    const docRef = doc(db, 'users', user.uid);

    const updates: Record<string, any> = {
      gearInventory: extraLoot ? arrayUnion(loot, extraLoot) : arrayUnion(loot),
      gems: arrayUnion(gem),
      obolos: increment(obolosReward),
      ...(memoryReward > 0 ? { memoryFragments: increment(memoryReward) } : {})
    };

    if (!profile.titles?.includes(selectedBossData.rewardTitle)) {
      updates.titles = arrayUnion(selectedBossData.rewardTitle);
    }

    await updateDoc(docRef, updates);
    toast.success(`Has derrotado a ${selectedBossData.title}. +${obolosReward} Obolos | Gema: ${gem.name}${extraLoot ? ` | Botin extra: ${extraLoot.name}` : ''}`);
  };

  const scrambleText = (text: string) => {
    if (selectedBossData?.effect !== 'scramble') return text;
    return text
      .split('')
      .map((char) => (Math.random() > 0.8 ? '?' : char))
      .join('');
  };

  if (gameState === 'lobby') {
    return (
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-red-500 neon-text-accent uppercase tracking-[0.2em]">
            Dioses Primordiales
          </h1>
          <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">20 Jefes Secretos</p>
          <p className="text-xs font-mono text-accent/70 uppercase tracking-widest">Desplazate para ver la lista completa de primordiales</p>
          <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="font-mono text-white">Fragmentos de Memoria: {profile?.memoryFragments || 0}</span>
            </div>
            <div className="px-3 py-1 border border-purple-500/40 bg-purple-500/10 text-xs font-mono uppercase tracking-widest text-purple-300">
              {SECRET_BOSSES.length} Primordiales Disponibles
            </div>
            <div className="px-3 py-1 border border-green-500/40 bg-green-500/10 text-xs font-mono uppercase tracking-widest text-green-300">
              Codex: {defeatedBosses}/{SECRET_BOSSES.length}
            </div>
          </div>
          {activeSpecter && (
            <div className="max-w-2xl mx-auto mt-6 bg-background/50 border border-cyan-500/20 p-4 clip-diagonal text-left space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">Habilidad del Espectro</p>
              <p className="font-display text-lg text-white">{activeSpecter.ability.name}</p>
              <p className="text-xs font-mono text-muted-foreground">{activeSpecter.ability.description}</p>
            </div>
          )}
          {activeSetEffect && (
            <div className="max-w-2xl mx-auto mt-4 bg-background/50 border border-yellow-500/20 p-4 clip-diagonal text-left space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-400">Bono de Set Activo</p>
              <p className="font-display text-lg text-white">{activeSetEffect.title}</p>
              <p className="text-xs font-mono text-muted-foreground">{activeSetEffect.description}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SECRET_BOSSES.map((boss) => {
            const Icon = boss.icon;
            const isDefeated = profile?.titles?.includes(boss.rewardTitle);

            return (
              <Card key={boss.id} className={`glass-panel ${boss.cardBorder} clip-card relative overflow-hidden group`}>
                <div className={`absolute inset-0 bg-gradient-to-b ${boss.cardGlow} to-transparent pointer-events-none`} />
                <CardHeader className="text-center border-b border-white/10 bg-background/40">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest border ${isDefeated ? 'border-green-500/40 bg-green-500/10 text-green-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
                      {isDefeated ? 'Derrotado' : 'No derrotado'}
                    </span>
                    <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest border border-accent/20 bg-background/50 text-accent">
                      {boss.timeLimit <= 5 ? 'Ritmo brutal' : 'Resistencia'}
                    </span>
                  </div>
                  <Icon className={`w-12 h-12 mx-auto mb-4 ${boss.iconClass}`} />
                  <CardTitle className="font-display text-2xl text-white tracking-widest uppercase">{boss.title}</CardTitle>
                  <p className="text-xs font-mono text-muted-foreground mt-2">{boss.description}</p>
                  <p className="text-[11px] font-mono text-yellow-300 mt-3">{getBossCounterStrategy(boss.effect)}</p>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Button
                    onClick={() => handleChallenge(boss.id)}
                    disabled={isGenerating || (profile?.memoryFragments || 0) < 5}
                    className={`w-full text-white font-display tracking-widest uppercase clip-diagonal ${boss.buttonClass}`}
                  >
                    {isGenerating ? 'Invocando...' : 'Invocar (5 Fragmentos)'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && selectedBossData) {
    const q = questions[currentQ];
    if (!q) return null;

    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-8 px-4 py-2 bg-background/80 border border-red-500/50 clip-diagonal">
          <span className="font-mono text-red-400">HP Primordial: {bossHealth}%</span>
          <span className={`font-mono ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            Tiempo: {timeLeft}s
          </span>
          <span className="font-mono text-green-400">Tu HP: {playerHealth}%{specterBarrierCharges > 0 ? ` | Barreras: ${specterBarrierCharges}` : ''}</span>
        </div>

        <Card className="glass-panel border-red-500/50 clip-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
          <h3 className="text-xl font-sans font-bold text-white mb-3 text-center relative z-10">
            {selectedBossData.title}
          </h3>
          <p className="text-xs uppercase tracking-widest text-center text-muted-foreground mb-8 relative z-10">
            {selectedBossData.description}
          </p>
          <h4 className="text-lg font-sans font-bold text-white mb-8 text-center relative z-10">
            {scrambleText(q.q)}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {q.options.map((opt, idx) => {
              if (hiddenOptions.includes(idx)) {
                return <div key={idx} className="h-auto py-4 opacity-0 pointer-events-none" />;
              }

              return (
                <Button
                  key={idx}
                  variant="outline"
                  className="h-auto py-4 text-lg font-sans tracking-wide border-red-500/30 hover:border-red-400 hover:bg-red-500/20 transition-all clip-diagonal"
                  onClick={() => handleAnswer(idx)}
                >
                  {scrambleText(opt)}
                </Button>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'result') {
    const won = bossHealth <= 0;

    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-8 relative z-10">
        <Skull className={`w-24 h-24 mx-auto ${won ? 'text-yellow-400' : 'text-red-500'}`} />
        <h2 className="text-4xl font-display font-bold text-white uppercase tracking-widest">
          {won ? 'Primordial Derrotado' : 'Aniquilacion'}
        </h2>

        {won && lastLoot && (
          <div className="glass-panel border-red-500/20 clip-card p-6 text-left space-y-4">
            <div className={`p-4 border clip-diagonal bg-background/50 ${RARITY_COLORS[lastLoot.rarity]}`}>
              <h3 className="font-bold text-lg mb-2">{lastLoot.name}</h3>
              <p className="text-sm font-mono opacity-80">{lastLoot.rarity} - {lastLoot.type}</p>
            </div>
            {bonusLoot && (
              <div className={`p-4 border clip-diagonal bg-background/50 ${RARITY_COLORS[bonusLoot.rarity]}`}>
                <h3 className="font-bold text-lg mb-2">{bonusLoot.name}</h3>
                <p className="text-sm font-mono opacity-80">{bonusLoot.rarity} - {bonusLoot.type}</p>
              </div>
            )}
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Obolos ganados</span>
                <span className="text-yellow-400">{rewardObolos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fragmentos ganados</span>
                <span className="text-cyan-400">{rewardMemory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gema obtenida</span>
                <span className="text-purple-300">{rewardGemName}</span>
              </div>
            </div>
            {activeSetEffect && (
              <div className="pt-2 border-t border-yellow-500/10">
                <div className="text-xs uppercase tracking-widest text-yellow-400">{activeSetBonus}</div>
                <div className="text-sm text-white">{activeSetEffect.title}</div>
              </div>
            )}
          </div>
        )}

        <Button onClick={() => setGameState('lobby')} className="w-full bg-red-600 hover:bg-red-500 text-white clip-diagonal py-6 uppercase tracking-widest">
          Volver al Santuario
        </Button>
      </div>
    );
  }

  return null;
};
