import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { X, ChevronRight, Zap, Shield, Trophy, MessageSquare, Gamepad2, Coins, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: '¡Bienvenido al Inframundo!',
    description: 'Eres un nuevo espectro al servicio de Hades. Tu misión es conquistar gloria a través de combates, exploración y alianzas.',
    icon: <Zap className="w-16 h-16 text-accent" />,
    tip: 'Completa este tutorial para recibir tu primera recompensa.'
  },
  {
    title: 'Arena de Trivias',
    description: 'Combate mental contra enemigos y jefes. Responde correctamente para infligir daño. ¡Los combos multiplican tus puntos!',
    icon: <Gamepad2 className="w-16 h-16 text-primary" />,
    tip: 'Responde rápido y sin fallar para mantener tu combo y ganar más puntos.'
  },
  {
    title: 'Equipo y Armería',
    description: 'Obtén armas, armaduras y artefactos como botín. Equípalos para mejorar tus estadísticas. ¡Los items raros dan más poder!',
    icon: <Shield className="w-16 h-16 text-blue-400" />,
    tip: 'Visita la Armería para ver tu avatar con el equipo equipado estilo Diablo.'
  },
  {
    title: 'Misiones Diarias',
    description: 'Completa 3 trivias y envía 5 mensajes cada día para ganar recompensas bonus. ¡No dejes que se reseteen!',
    icon: <Trophy className="w-16 h-16 text-yellow-400" />,
    tip: 'Inicia sesión consecutivamente para ganar recompensas cada vez mejores (hasta x7).'
  },
  {
    title: 'Chat Cocytos',
    description: 'Comunícate con otros espectros. Haz amigos, forma guilds y coordina estrategias de combate.',
    icon: <MessageSquare className="w-16 h-16 text-green-400" />,
    tip: 'Los mensajes cuentan para misiones diarias y logros sociales.'
  },
  {
    title: 'Logros y Recompensas',
    description: '100+ logros te esperan en 5 categorías: Combate, Social, Exploración, Colección y Maestría. ¡Cada uno da puntos de prestigio!',
    icon: <Sparkles className="w-16 h-16 text-purple-400" />,
    tip: 'Los puntos de prestigio desbloquean títulos exclusivos y decoraciones.'
  },
  {
    title: 'Sistema de Referidos',
    description: 'Comparte tu código único con amigos. Cuando se registren, AMBOS ganan +200 Óbolos y tú recibes +1 Fragmento Estelar.',
    icon: <Coins className="w-16 h-16 text-orange-400" />,
    tip: 'Encuentra tu código en tu Perfil → Cadena de Almas.'
  },
  {
    title: '¡Estás Listo!',
    description: 'El Inframundo te espera, espectro. Conquista la Torre, domina el Laberinto y asciende a la gloria eterna.',
    icon: <Zap className="w-16 h-16 text-accent animate-pulse" />,
    tip: 'Recompensa de tutorial: +100 Óbolos y tu primera Poción de Tiempo.'
  }
];

export const Onboarding: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { user, profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Si ya completó el tutorial, no mostrar
    if (profile?.tutorialCompleted) {
      setIsVisible(false);
      onComplete?.();
    }
  }, [profile]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (user && profile) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          tutorialCompleted: true,
          obolos: (profile.obolos || 0) + 100,
          consumables: {
            ...(profile.consumables || { time_potion: 0, clairvoyance_potion: 0, healing_potion: 0 }),
            time_potion: (profile.consumables?.time_potion || 0) + 1
          }
        });
        await updateProfile({
          tutorialCompleted: true,
          obolos: (profile.obolos || 0) + 100
        });
        toast.success('¡Tutorial Completado! +100 Óbolos y +1 Poción de Tiempo');
      } catch (error) {
        console.error('Error completing tutorial:', error);
      }
    }
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { tutorialCompleted: true });
      await updateProfile({ tutorialCompleted: true });
    }
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-lg"
      >
        {/* Progress Bar */}
        <div className="mb-4 bg-background/50 border border-accent/30 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <Card className="glass-panel border-accent/30 clip-card relative overflow-hidden">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {step.icon}
            </div>
            <CardTitle className="font-display text-2xl text-accent tracking-widest uppercase">
              {step.title}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-sm text-foreground leading-relaxed text-center">
              {step.description}
            </p>

            {step.tip && (
              <div className="bg-accent/10 border border-accent/30 p-3 rounded-sm clip-diagonal">
                <p className="text-xs text-accent font-mono">
                  💡 <span className="font-bold">TIP:</span> {step.tip}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {currentStep < TUTORIAL_STEPS.length - 1 && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1 clip-diagonal border-accent/30 text-muted-foreground hover:text-white"
                >
                  Saltar
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 clip-diagonal bg-accent hover:bg-accent/80 text-black font-bold tracking-widest uppercase"
              >
                {currentStep < TUTORIAL_STEPS.length - 1 ? (
                  <>
                    Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    ¡Comenzar! <Zap className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
