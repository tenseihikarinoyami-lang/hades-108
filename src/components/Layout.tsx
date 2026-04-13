import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { loginWithGoogle, logout } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, MessageSquare, Gamepad2, Home, Trophy, Flame, Volume2, VolumeX, Store as StoreIcon, Shield, Swords, Hammer, Castle, Skull, Star, FlaskConical, Map, EyeOff, Crown, ArrowUpCircle, Users, BookOpen, ChevronDown, Zap, Dog, Anchor, Activity } from 'lucide-react';
import { audio } from '@/lib/audio';
import { getCurrentCataclysm } from '@/lib/cataclysms';

export const Layout: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMuted, setIsMuted] = useState(audio.isMuted);

  useEffect(() => {
    // Play ambient music on interaction if not muted
    const handleInteraction = () => {
      audio.toggleAmbient(true);
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  const handleLogin = async () => {
    audio.playSFX('click');
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Login failed", error);
      alert(error.message || "Error al iniciar sesión");
    }
  };

  const handleLogout = async () => {
    audio.playSFX('click');
    await logout();
    navigate('/');
  };

  const toggleAudio = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
    if (!muted) audio.playSFX('click');
  };

  const cataclysm = getCurrentCataclysm();

  const AURAS: Record<string, string> = {
    'blue_flame': 'shadow-[0_0_15px_rgba(96,165,250,0.8)] border-blue-400',
    'crimson_blood': 'shadow-[0_0_15px_rgba(239,68,68,0.8)] border-red-500',
    'golden_divine': 'shadow-[0_0_20px_rgba(250,204,21,0.8)] border-yellow-400',
    'void_darkness': 'shadow-[0_0_25px_rgba(147,51,234,0.8)] border-purple-600',
  };

  const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="relative group/nav">
      <button className="flex items-center gap-1 transition-all hover:text-accent hover:neon-text-accent uppercase tracking-widest text-muted-foreground text-[10px] font-bold">
        {title} <ChevronDown className="w-3 h-3" />
      </button>
      <div className="absolute top-full left-0 mt-2 w-48 bg-background/95 border border-accent/20 glass-panel opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 z-50 p-2 space-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {children}
      </div>
    </div>
  );

  const NavLink = ({ to, icon: Icon, label, color = "hover:text-accent" }: { to: string, icon: any, label: string, color?: string }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest text-muted-foreground transition-all ${color} hover:bg-accent/5`}
      onClick={() => audio.playSFX('click')}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-accent/20 glass-panel">
        <div className="container flex h-20 items-center justify-between px-4 relative">
          {/* Top glowing line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-sm bg-background flex items-center justify-center border border-accent neon-border transform rotate-45 group-hover:rotate-90 transition-all duration-500">
              <span className="font-display font-bold text-accent text-xl transform -rotate-45 group-hover:-rotate-90 transition-all duration-500">H</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl tracking-[0.2em] text-white neon-text-accent hidden sm:inline-block">
                HADES
              </span>
              <span className="text-[0.65rem] tracking-[0.3em] text-accent/80 uppercase hidden sm:inline-block">
                Underworld Protocol
              </span>
            </div>
          </Link>

          {loading ? (
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin neon-border" />
          ) : user ? (
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Cataclysm Display */}
              {cataclysm && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-accent/5 border border-accent/20 clip-diagonal animate-pulse">
                  <Zap className="w-3 h-3 text-accent" />
                  <span className="text-[9px] font-mono text-accent uppercase tracking-tighter">
                    {cataclysm.name}
                  </span>
                </div>
              )}

              <nav className="flex items-center gap-6 text-sm font-medium">
                <Link to="/" className="transition-all hover:text-accent hover:neon-text-accent flex items-center gap-2 uppercase tracking-widest text-muted-foreground text-[10px] font-bold">
                  <Home className="w-4 h-4" /> <span className="hidden xl:inline">Inicio</span>
                </Link>

                <NavGroup title="Aventura">
                  <NavLink to="/trivia" icon={Gamepad2} label="Arena" />
                  <NavLink to="/tower" icon={Castle} label="Torre" color="hover:text-purple-400" />
                  <NavLink to="/campaign" icon={Map} label="Descenso" color="hover:text-purple-500" />
                  <NavLink to="/fishing" icon={Anchor} label="Pesca" color="hover:text-blue-400" />
                  <NavLink to="/saint-mode" icon={BookOpen} label="Leyenda" color="hover:text-yellow-500" />
                </NavGroup>

                <NavGroup title="End-Game">
                  <NavLink to="/labyrinth" icon={Skull} label="Laberinto" color="hover:text-red-500" />
                  <NavLink to="/battle-royale" icon={Trophy} label="Torneo" color="hover:text-yellow-400" />
                  <NavLink to="/secret-bosses" icon={EyeOff} label="Primordiales" color="hover:text-purple-500" />
                  <NavLink to="/world-boss" icon={Skull} label="Jefe Mundo" color="hover:text-red-600" />
                  <NavLink to="/raids" icon={Swords} label="Incursión" color="hover:text-red-500" />
                  <NavLink to="/auction" icon={StoreIcon} label="Subasta" color="hover:text-yellow-500" />
                </NavGroup>

                <NavGroup title="Social">
                  <NavLink to="/chat" icon={MessageSquare} label="Cocytos" />
                  <NavLink to="/faction-base" icon={Castle} label="Base" color="hover:text-accent" />
                  <NavLink to="/guilds" icon={Users} label="Escuadrones" color="hover:text-emerald-500" />
                  <NavLink to="/territories" icon={Map} label="Territorios" color="hover:text-orange-500" />
                  <NavLink to="/holy-war" icon={Swords} label="Guerra" />
                </NavGroup>

                <NavGroup title="Progreso">
                  <NavLink to="/cosmos" icon={Star} label="Cosmos" color="hover:text-pink-400" />
                  <NavLink to="/pets" icon={Dog} label="Familiares" color="hover:text-orange-400" />
                  <NavLink to="/alchemy" icon={FlaskConical} label="Alquimia" color="hover:text-green-400" />
                  <NavLink to="/battle-pass" icon={Crown} label="Pase" color="hover:text-cyan-400" />
                  <NavLink to="/ascension" icon={ArrowUpCircle} label="Ascensión" color="hover:text-blue-400" />
                  <NavLink to="/leaderboard" icon={Trophy} label="Ranking" />
                </NavGroup>

                <NavGroup title="Equipo">
                  <NavLink to="/equipment" icon={Shield} label="Armería" />
                  <NavLink to="/forge" icon={Hammer} label="Forja" color="hover:text-orange-500" />
                  <NavLink to="/store" icon={StoreIcon} label="Tienda" />
                </NavGroup>
              </nav>
              
              <div className="flex items-center gap-4 border-l border-accent/30 pl-6">
                <Button variant="ghost" size="icon" onClick={toggleAudio} className="text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-sm" onMouseEnter={() => audio.playSFX('hover')}>
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity group" onMouseEnter={() => audio.playSFX('hover')} onClick={() => audio.playSFX('click')}>
                  <div className="relative">
                    <div className={`absolute inset-0 bg-accent/20 blur-md rounded-full group-hover:bg-accent/40 transition-all ${profile?.activeAura && profile.activeAura !== 'none' ? 'animate-pulse' : ''}`} />
                    <Avatar className={`h-10 w-10 border-2 rounded-sm clip-diagonal relative z-10 ${profile?.activeAura && profile.activeAura !== 'none' ? AURAS[profile.activeAura] : 'border-accent/50'}`}>
                      <AvatarImage src={profile?.photoURL || user.photoURL || ''} alt={profile?.specterName || 'User'} />
                      <AvatarFallback className="bg-secondary text-accent font-display">
                        {profile?.specterName?.[0] || user.displayName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-bold tracking-wider text-white">{profile?.specterName || profile?.displayName}</span>
                    <span className="text-xs text-primary font-bold tracking-widest uppercase flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {profile?.role}
                    </span>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleLogin} className="clip-diagonal bg-primary hover:bg-primary/80 text-white font-bold tracking-[0.2em] uppercase px-8 border border-primary/50 neon-border">
              Despertar
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 relative z-10">
        <Outlet />
      </main>

      <footer className="border-t border-accent/20 glass-panel py-6 relative z-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase text-center md:text-left">
              &copy; {new Date().getFullYear()} Protocolo Inframundo. Sistema Activo.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/system" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-blue-400 transition-all flex items-center gap-1">
              <Activity className="w-3 h-3" /> Estado
            </Link>
            <a href="#" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-accent hover:neon-text-accent transition-all">Telegram</a>
            <a href="#" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-accent hover:neon-text-accent transition-all">WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
