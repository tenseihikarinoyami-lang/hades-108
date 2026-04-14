import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { loginWithGoogle } from '@/lib/firebase';
import { MessageSquare, Gamepad2, ShieldAlert, Zap, Flame, Skull } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardHub } from '@/components/DashboardHub';

export const Home: React.FC = () => {
  const { user } = useAuth();

  // Si el usuario está logueado, mostrar Dashboard
  if (user) {
    return <DashboardHub />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-16 relative">

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, type: "spring" }}
        className="text-center max-w-4xl space-y-8 relative z-10"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -z-10 animate-pulse-slow" />

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-bold tracking-widest uppercase mb-4"
        >
          <Flame className="w-4 h-4" /> Protocolo de Despertar Iniciado
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-display font-black tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-white via-accent to-primary drop-shadow-[0_0_30px_rgba(255,0,60,0.5)]">
          EL HADES
        </h1>
        <p className="text-xl md:text-3xl font-sans font-medium text-muted-foreground tracking-[0.3em] uppercase neon-text-accent">
          Despierta tu Sapuris
        </p>

        <div className="pt-12">
          {!user ? (
            <Button
              size="lg"
              onClick={async () => {
                try {
                  await loginWithGoogle();
                } catch (error: any) {
                  alert(error.message || "Error al iniciar sesión");
                }
              }}
              className="clip-diagonal bg-primary hover:bg-primary/80 text-white font-sans font-bold tracking-[0.3em] text-xl px-12 py-8 border-2 border-accent/50 neon-border hover:scale-105 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Skull className="w-6 h-6 mr-3 group-hover:animate-bounce" /> Jurar Lealtad
            </Button>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/chat">
                <Button className="clip-diagonal bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-black font-bold tracking-[0.2em] uppercase px-8 py-6 neon-border transition-all hover:scale-105">
                  <MessageSquare className="w-5 h-5 mr-2" /> Cocytos Chat
                </Button>
              </Link>
              <Link to="/trivia">
                <Button className="clip-diagonal bg-primary hover:bg-primary/80 text-white font-bold tracking-[0.2em] uppercase px-8 py-6 border-2 border-primary/50 neon-border transition-all hover:scale-105">
                  <Zap className="w-5 h-5 mr-2" /> Arena de Dioses
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-8 relative z-10"
      >
        <Card className="glass-panel clip-card border-t-4 border-t-primary hover:border-t-accent transition-all duration-500 hover:-translate-y-2 group">
          <CardHeader>
            <ShieldAlert className="w-12 h-12 text-primary mb-4 group-hover:text-accent transition-colors" />
            <CardTitle className="font-display tracking-[0.1em] text-xl text-white">Los 108 Espectros</CardTitle>
            <CardDescription className="text-accent font-bold tracking-widest uppercase text-xs">Sistema de Rangos</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Personaliza tu perfil, elige tu estrella maligna y conviértete en uno de los 108 espectros o asciende a Juez del Inframundo mediante méritos en combate.
          </CardContent>
        </Card>

        <Card className="glass-panel clip-card border-t-4 border-t-secondary hover:border-t-accent transition-all duration-500 hover:-translate-y-2 group">
          <CardHeader>
            <MessageSquare className="w-12 h-12 text-secondary mb-4 group-hover:text-accent transition-colors" />
            <CardTitle className="font-display tracking-[0.1em] text-xl text-white">Red Cocytos</CardTitle>
            <CardDescription className="text-accent font-bold tracking-widest uppercase text-xs">Comunicación Táctica</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Comunícate con otros espectros en tiempo real. Enlaces directos a nuestros escuadrones en Telegram y WhatsApp.
          </CardContent>
        </Card>

        <Card className="glass-panel clip-card border-t-4 border-t-accent hover:border-t-primary transition-all duration-500 hover:-translate-y-2 group">
          <CardHeader>
            <Gamepad2 className="w-12 h-12 text-accent mb-4 group-hover:text-primary transition-colors" />
            <CardTitle className="font-display tracking-[0.1em] text-xl text-white">Arena de Trivias</CardTitle>
            <CardDescription className="text-primary font-bold tracking-widest uppercase text-xs">Combate Mental</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Desafíos de Anime, Manga y Videojuegos desde 1990. Incluye simuladores de conocimiento exclusivos de League of Legends.
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
};
