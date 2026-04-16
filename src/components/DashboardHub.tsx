// DASHBOARD/HUB CENTRAL - Trono de Hades
// Reemplaza la landing page con dashboard personalizado para usuarios logueados

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { MessageSquare, Gamepad2, ShieldAlert, Zap, Flame, Skull, Crosshair, Trophy, Users, ChevronRight, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { getActiveFlashEvents, getNextFlashEvent } from '@/data/flashEvents';
import { getCurrentWeeklyEvent, getUpcomingWeeklyEvents } from '@/data/weeklyEvents';
import { getCurrentCataclysm } from '@/lib/cataclysms';
import { resolveSpecterForProfile } from '@/data/specters';
import { calculateSetBonus, getSetBonusEffect } from '@/lib/rpg';

export const DashboardHub: React.FC = () => {
  const { user, profile } = useAuth();
  const activeSpecter = resolveSpecterForProfile(profile || undefined);
  const activeSetEffect = getSetBonusEffect(calculateSetBonus(profile?.equippedGear || {}));
  const activeEvents = getActiveFlashEvents();
  const nextEvent = getNextFlashEvent();
  const weeklyEvent = getCurrentWeeklyEvent();
  const upcomingWeeklyEvents = getUpcomingWeeklyEvents();
  const cataclysm = getCurrentCataclysm();

  const dailyMissions = profile?.dailyMissions || [];
  const completedMissions = dailyMissions.filter(m => m.completed).length;
  const totalMissions = dailyMissions.length;

  const quickActions = [
    { to: '/trivia', icon: Gamepad2, label: 'Arena', color: 'from-primary to-red-600', desc: 'Combate mental' },
    { to: '/tower', icon: ShieldAlert, label: 'Torre', color: 'from-purple-600 to-purple-800', desc: 'Roguelike infinito' },
    { to: '/chat', icon: MessageSquare, label: 'Cocytos', color: 'from-accent to-blue-600', desc: 'Chat global' },
    { to: '/campaign', icon: Skull, label: 'Campaign', color: 'from-green-600 to-emerald-800', desc: 'Saga divina' },
  ];

  const topActivities = [
    { to: '/trivia', icon: Trophy, label: 'Arena', plays: profile?.stats?.triviasPlayed || 0 },
    { to: '/chat', icon: MessageSquare, label: 'Chat', msgs: profile?.stats?.messagesSent || 0 },
    { to: '/tower', icon: ShieldAlert, label: 'Torre', floor: profile?.highestTowerFloor || 0 },
  ].sort((a, b) => {
    const valA = (a as any).plays || (a as any).msgs || (a as any).floor || 0;
    const valB = (b as any).plays || (b as any).msgs || (b as any).floor || 0;
    return valB - valA;
  }).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-10">
      {/* HEADER DEL DASHBOARD */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-8"
      >
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Trono de Hades
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.3em] uppercase text-sm">
          Bienvenido, {profile?.specterName || profile?.displayName || 'Espectro'}
        </p>
      </motion.div>

      {/* EVENTO ACTIVO / PRÓXIMO */}
      {(activeEvents.length > 0 || nextEvent || cataclysm) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <Card className={`glass-panel border-accent/20 clip-card bg-gradient-to-r ${weeklyEvent.color}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Clock className="w-5 h-5" /> Evento semanal: {weeklyEvent.name}
              </CardTitle>
              <CardDescription className="text-white/80">{weeklyEvent.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {weeklyEvent.bonuses.map((bonus) => (
                  <div key={bonus} className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-white font-mono">
                    <Zap className="w-3 h-3" /> {bonus}
                  </div>
                ))}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/70">
                Modos afectados: {weeklyEvent.affectedModes.join(' · ')}
              </div>
            </CardContent>
          </Card>

          {activeEvents.map(event => (
            <Card key={event.id} className={`glass-panel border-accent/30 clip-card bg-gradient-to-r ${event.color}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <span className="text-2xl">{event.icon}</span>
                  <span className="animate-pulse text-red-400 text-xs font-bold uppercase">● EN VIVO</span>
                  {event.name}
                </CardTitle>
                <CardDescription className="text-white/80">{event.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-white font-mono">
                  <Zap className="w-3 h-3" /> {event.bonus.description}
                </div>
              </CardContent>
            </Card>
          ))}

          {nextEvent && activeEvents.length === 0 && (
            <Card className="glass-panel border-accent/20 clip-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-accent flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Próximo Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{nextEvent.name}</div>
                    <div className="text-xs text-muted-foreground">{nextEvent.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-accent">
                      {new Date(nextEvent.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {cataclysm && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-accent/5 border border-accent/20 rounded-sm clip-diagonal">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-accent uppercase tracking-widest">
                Cataclysm Activo: {cataclysm.name}
              </span>
            </div>
          )}
        </motion.div>
      )}

      <Card className="glass-panel border-accent/20 clip-card">
        <CardHeader className="border-b border-accent/10 pb-3">
          <CardTitle className="font-display text-base text-accent flex items-center gap-2">
            <Clock className="w-4 h-4" /> Rotacion Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {upcomingWeeklyEvents.map((event) => (
            <div key={event.id} className="border border-accent/10 bg-background/40 p-3 clip-diagonal space-y-2">
              <div className="font-display text-white">{event.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-accent">{event.subtitle}</div>
              <div className="text-xs text-muted-foreground">{event.affectedModes.join(', ')}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link to={action.to}>
              <Card className="glass-panel border-accent/20 clip-card hover:border-accent transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
                <CardContent className="p-4 text-center space-y-2">
                  <div className={`w-12 h-12 mx-auto rounded-sm bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white uppercase tracking-wider">{action.label}</div>
                    <div className="text-[10px] text-muted-foreground">{action.desc}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {(activeSpecter || activeSetEffect) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSpecter && (
            <Card className="glass-panel border-cyan-500/20 clip-card">
              <CardHeader className="border-b border-cyan-500/10 pb-3">
                <CardTitle className="font-display text-base text-cyan-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Habilidad del Espectro
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <div className="font-display text-lg text-white">{activeSpecter.ability.name}</div>
                <div className="text-xs font-mono text-muted-foreground">{activeSpecter.ability.description}</div>
              </CardContent>
            </Card>
          )}

          {activeSetEffect && (
            <Card className="glass-panel border-yellow-500/20 clip-card">
              <CardHeader className="border-b border-yellow-500/10 pb-3">
                <CardTitle className="font-display text-base text-yellow-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Bono de Set Activo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <div className="font-display text-lg text-white">{activeSetEffect.title}</div>
                <div className="text-xs font-mono text-muted-foreground">{activeSetEffect.description}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MISIONES DIARIAS */}
        <Card className="glass-panel border-accent/20 clip-card md:col-span-2">
          <CardHeader className="border-b border-accent/10 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base text-accent flex items-center gap-2">
              <Crosshair className="w-4 h-4" /> Misiones Diarias
            </CardTitle>
            <span className="text-xs font-mono text-muted-foreground">{completedMissions}/{totalMissions}</span>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {dailyMissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay misiones activas. Inicia sesión mañana para recibir nuevas.
              </div>
            ) : (
              dailyMissions.map((mission, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className={mission.completed ? 'text-green-400 line-through' : 'text-white'}>
                      {mission.title}
                    </span>
                    <span className={mission.completed ? 'text-green-400' : 'text-accent'}>
                      {mission.completed ? '✓' : `${mission.progress}/${mission.target}`}
                    </span>
                  </div>
                  <div className="h-2 bg-background border border-accent/20 rounded-sm overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${mission.completed ? 'bg-green-500' : 'bg-accent/60'}`}
                      style={{ width: `${Math.min((mission.progress / mission.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* TOP ACTIVIDADES */}
        <Card className="glass-panel border-accent/20 clip-card">
          <CardHeader className="border-b border-accent/10 pb-3">
            <CardTitle className="font-display text-base text-accent flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Tu Actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {topActivities.map((activity, idx) => (
              <Link key={activity.label} to={activity.to} className="flex items-center justify-between p-2 rounded-sm hover:bg-accent/5 transition-colors group">
                <div className="flex items-center gap-2">
                  <activity.icon className="w-4 h-4 text-accent" />
                  <span className="text-xs text-white">{activity.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono text-accent">
                    {(activity as any).plays || (activity as any).msgs || (activity as any).floor || 0}
                  </span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}

            <div className="pt-3 border-t border-accent/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Nivel</span>
                <span className="text-white font-mono">{profile?.level || 1}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Óbolos</span>
                <span className="text-yellow-400 font-mono">{profile?.obolos || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fragmentos</span>
                <span className="text-cyan-400 font-mono">{profile?.memoryFragments || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Login Streak</span>
                <span className="text-green-400 font-mono">{profile?.stats?.loginStreak || 0} días</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NOTIFICACIONES / ALERTAS */}
      <Card className="glass-panel border-accent/20 clip-card">
        <CardHeader className="border-b border-accent/10 pb-3">
          <CardTitle className="font-display text-base text-accent flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Resumen de Progreso
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-sm border border-accent/10">
              <div className="text-2xl font-bold text-primary">{profile?.stats?.triviasWon || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Victorias</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-sm border border-accent/10">
              <div className="text-2xl font-bold text-accent">{profile?.achievements?.length || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Logros</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-sm border border-accent/10">
              <div className="text-2xl font-bold text-purple-400">{profile?.prestigePoints || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Prestigio</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-sm border border-accent/10">
              <div className="text-2xl font-bold text-yellow-400">{profile?.gearInventory?.length || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Equipo</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
