import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Shield, Target, Zap, Fingerprint, Cpu, AlertCircle, Medal, Crosshair, Flag, PackageOpen, Sparkles, Swords, Shield as ShieldIcon, Scroll, Users, Copy, Gift, Coins } from 'lucide-react';
import { audio } from '@/lib/audio';
import { processReferralCode } from '@/lib/referrals';
import { useState } from 'react';

const FACTIONS = [
  { id: 'Wyvern', name: 'Ejército de Radamanthys (Wyvern)', color: 'text-purple-500', border: 'border-purple-500' },
  { id: 'Griffon', name: 'Ejército de Minos (Griffon)', color: 'text-blue-500', border: 'border-blue-500' },
  { id: 'Garuda', name: 'Ejército de Aiacos (Garuda)', color: 'text-orange-500', border: 'border-orange-500' }
];

const ReferralInput: React.FC = () => {
  const { user, profile } = useAuth();
  const [referralInput, setReferralInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApplyReferral = async () => {
    if (!user || profile?.referredBy) return;
    setProcessing(true);
    try {
      const result = await processReferralCode(user.uid, referralInput);
      if (result.success) {
        toast.success(result.message);
        setReferralInput('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error al aplicar código de referido');
    } finally {
      setProcessing(false);
    }
  };

  if (profile?.referredBy) {
    return (
      <div className="bg-background/50 border border-green-500/30 p-4 clip-diagonal">
        <h4 className="text-sm font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
          <Gift className="w-4 h-4" /> Referido Aplicado
        </h4>
        <p className="text-xs text-muted-foreground mt-2">
          Ya usaste un código de referido al registrarte. ¡Gracias!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background/50 border border-orange-500/30 p-4 clip-diagonal space-y-3">
      <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
        <Gift className="w-4 h-4" /> ¿Tienes un código de referido?
      </h4>
      <div className="flex gap-2">
        <Input
          value={referralInput}
          onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
          placeholder="Ingresa el código"
          maxLength={8}
          className="flex-1 bg-background border-accent/50 font-mono tracking-widest text-center uppercase"
        />
        <Button
          variant="outline"
          onClick={handleApplyReferral}
          disabled={processing || referralInput.length < 4}
          className="clip-diagonal border-orange-500/50 hover:bg-orange-500/20"
        >
          {processing ? '...' : 'Aplicar'}
        </Button>
      </div>
    </div>
  );
};

const SPECTER_LOGOS: Record<string, string> = {
  "Radamanthys de Wyvern": "https://images.unsplash.com/photo-1577493341514-229ea9d560f9?w=800&q=80", // Dragon scales
  "Minos de Grifo": "https://images.unsplash.com/photo-1580238053495-b9720401fd45?w=800&q=80", // Eagle/Griffin
  "Aiacos de Garuda": "https://images.unsplash.com/photo-1550847024-d2b38021481b?w=800&q=80", // Fiery bird/Feathers
  "Myu de Papillon": "https://images.unsplash.com/photo-1534269222346-5a896154c41d?w=800&q=80", // Dark butterfly
  "Niobe de Deep": "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800&q=80", // Deep dark water
  "Raimi de Worm": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=800&q=80", // Roots/Underground
  "Zelos de Frog": "https://images.unsplash.com/photo-1550257540-366367332213?w=800&q=80", // Poison frog
  "Giganto de Cyclops": "https://images.unsplash.com/photo-1542202672-0050810793e8?w=800&q=80", // Giant eye
  "Caronte de Aqueronte": "https://images.unsplash.com/photo-1505672678657-cc7037095e60?w=800&q=80", // Dark river/Boat
  "Lune de Balrog": "https://images.unsplash.com/photo-1504131598085-4cca8500b677?w=800&q=80", // Fire/Whip
  "Pharaoh de Esfinge": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?w=800&q=80", // Egypt/Sphinx
  "Rock de Golem": "https://images.unsplash.com/photo-1516804559388-72411e133866?w=800&q=80", // Dark rocks
  "Iwan de Troll": "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80", // Dark monster
  "Stand de Deadly Beetle": "https://images.unsplash.com/photo-1550625625-6126b701211e?w=800&q=80", // Beetle
  "Phlegyas de Lycaon": "https://images.unsplash.com/photo-1590420485404-f86d22b8abf8?w=800&q=80", // Wolf
  "Gordon de Minotauro": "https://images.unsplash.com/photo-1535336302484-902120023e10?w=800&q=80", // Horns/Bull
  "Queen de Alraune": "https://images.unsplash.com/photo-1508502887640-c30081d31060?w=800&q=80", // Dark flower
  "Sylphid de Basilisco": "https://images.unsplash.com/photo-1518534244342-99221191062b?w=800&q=80", // Snake/Scales
  "Valentine de Arpía": "https://images.unsplash.com/photo-1516233758813-a38d024919c5?w=800&q=80", // Dark feathers
  "Cagaho de Bennu": "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80", // Black fire
  "Violate de Behemoth": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80", // Shadow beast
  "Cheshire de Cait Sith": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80", // Dark cat
  "Tokusa de Hanuman": "https://images.unsplash.com/photo-1540324155974-7523202daa3f?w=800&q=80", // Monkey
  "Kubo de Dullahan": "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800&q=80", // Dark knight
  "Wimber de Murciélago": "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&q=80", // Bat
  "Edge de Elfo": "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80", // Dark elf/Shadow
  "Byaku de Nigromante": "https://images.unsplash.com/photo-1501432377862-3d0432b87a14?w=800&q=80", // Skull
  "Fiódor de Mandrágora": "https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=800&q=80", // Roots
  "Edward de Sílfide": "https://images.unsplash.com/photo-1464666495445-5a33228a808e?w=800&q=80", // Wind/Storm
  "Iván de Troll": "https://images.unsplash.com/photo-1509266272358-7701da638078?w=800&q=80" // Monster
};

const SPECTERS = Object.keys(SPECTER_LOGOS).sort();

// Genera un logo vanguardista basado en el nombre del espectro
const generateSpecterLogo = (name: string) => {
  if (!name) return '';
  // Si tenemos una imagen temática específica para el espectro, la usamos
  if (SPECTER_LOGOS[name]) {
    return SPECTER_LOGOS[name];
  }
  // Fallback a DiceBear si es un nombre personalizado
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(name)}&backgroundColor=05010a&shape1Color=ff003c,4a00e0&shape2Color=00f0ff,ff003c&shape3Color=4a00e0,00f0ff`;
};

export const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [specterName, setSpecterName] = useState(profile?.specterName || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [faction, setFaction] = useState(profile?.faction || '');
  const [loading, setLoading] = useState(false);
  const [takenSpecters, setTakenSpecters] = useState<string[]>([]);

  // Fetch already taken specters to warn the user
  useEffect(() => {
    const fetchTakenSpecters = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const taken: string[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.specterName && doc.id !== user?.uid) {
            taken.push(data.specterName);
          }
        });
        setTakenSpecters(taken);
      } catch (error) {
        console.error("Error fetching taken specters", error);
      }
    };
    if (user) fetchTakenSpecters();
  }, [user]);

  // Auto-update logo when specter name changes
  const handleSpecterNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newName = e.target.value;
    setSpecterName(newName);

    // Force update the photoURL immediately
    if (newName && newName !== "") {
      const newLogo = generateSpecterLogo(newName);
      setPhotoURL(newLogo);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Verify uniqueness
      if (specterName) {
        const q = query(collection(db, 'users'), where('specterName', '==', specterName));
        const querySnapshot = await getDocs(q);
        const isTaken = querySnapshot.docs.some(doc => doc.id !== user.uid);

        if (isTaken) {
          toast.error(`El Sapuris de ${specterName} ya ha sido reclamado por otro guerrero.`);
          setLoading(false);
          return;
        }
      }

      // 2. Save profile
      await updateProfile({ specterName, photoURL, faction });
      audio.playSFX('success');
      toast.success("Identidad sincronizada con la red Cocytos");
    } catch (error) {
      audio.playSFX('error');
      toast.error("Error al actualizar la identidad");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full neon-border"></div></div>;

  const isNameTaken = takenSpecters.includes(specterName);

  return (
    <div className="max-w-3xl mx-auto space-y-8 relative">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Identidad Sapuris
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.3em] uppercase text-xs">Base de Datos del Inframundo</p>
      </div>

      <Card className="glass-panel border-accent/30 hologram relative overflow-hidden clip-card">
        {/* Decorative tech lines */}
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-accent/20 opacity-50" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/20 opacity-50" />

        <CardHeader className="border-b border-accent/10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display tracking-[0.1em] text-accent flex items-center gap-2">
                <Fingerprint className="w-5 h-5" /> Credencial Holográfica
              </CardTitle>
              <CardDescription className="text-xs tracking-widest uppercase mt-1">Nivel de Acceso: {profile.role}</CardDescription>
            </div>
            <Cpu className="w-8 h-8 text-accent/30 animate-pulse-slow" />
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full group-hover:bg-accent/40 transition-all duration-500" />
              <div className="w-32 h-32 border-2 border-accent/50 clip-hex bg-background/80 relative z-10 overflow-hidden flex items-center justify-center">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback a un diseño generado si la imagen de Unsplash falla por bloqueos de red
                      e.currentTarget.src = `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(specterName)}&backgroundColor=05010a&shape1Color=ff003c,4a00e0&shape2Color=00f0ff,ff003c`;
                    }}
                  />
                ) : (
                  <span className="text-4xl font-display text-accent">
                    {specterName?.[0] || 'E'}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 clip-diagonal tracking-widest z-20">
                ACTIVO
              </div>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <Label htmlFor="specterName" className="text-xs tracking-widest uppercase text-accent/70">Designación (Nombre)</Label>
                  <select
                    id="specterName"
                    value={specterName}
                    onChange={handleSpecterNameChange}
                    onClick={() => audio.playSFX('click')}
                    className={`flex h-10 w-full rounded-md border border-accent/30 bg-background/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent tracking-wider ${isNameTaken ? 'border-primary focus:ring-primary text-primary' : ''}`}
                  >
                    <option value="" disabled>Selecciona tu Espectro...</option>
                    {SPECTERS.map(s => (
                      <option key={s} value={s} disabled={takenSpecters.includes(s)} className="bg-background text-white">
                        {takenSpecters.includes(s) ? `${s} (OCUPADO)` : s}
                      </option>
                    ))}
                  </select>
                  {isNameTaken && (
                    <p className="text-[10px] text-primary flex items-center gap-1 absolute -bottom-5 left-0">
                      <AlertCircle className="w-3 h-3" /> Sapuris ya reclamado
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faction" className="text-xs tracking-widest uppercase text-accent/70 flex items-center gap-1">
                    <Flag className="w-3 h-3" /> Facción (Ejército)
                  </Label>
                  <select
                    id="faction"
                    value={faction}
                    onChange={(e) => setFaction(e.target.value as any)}
                    onClick={() => audio.playSFX('click')}
                    className="flex h-10 w-full rounded-md border border-accent/30 bg-background/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent tracking-wider"
                  >
                    <option value="" disabled>Selecciona tu Ejército...</option>
                    {FACTIONS.map(f => (
                      <option key={f.id} value={f.id} className="bg-background text-white">
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="photoURL" className="text-xs tracking-widest uppercase text-accent/70">Enlace de Imagen (Holograma)</Label>
                  <Input
                    id="photoURL"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    onClick={() => audio.playSFX('click')}
                    placeholder="https://ejemplo.com/mi-logo.png"
                    className="bg-background/40 border-accent/30 focus:border-accent text-white font-sans tracking-wider"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-accent/10">
                <div className="space-y-1">
                  <Label className="text-[10px] tracking-widest uppercase text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Rango Militar
                  </Label>
                  <div className="font-display text-lg text-white tracking-wider">
                    {profile.role}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] tracking-widest uppercase text-muted-foreground flex items-center gap-1">
                    <Target className="w-3 h-3" /> Puntuación de Combate
                  </Label>
                  <div className="font-mono text-xl text-primary neon-text-primary">
                    {profile.score} <span className="text-xs text-muted-foreground">PTS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => { audio.playSFX('click'); handleSave(); }}
            disabled={loading || isNameTaken || !specterName}
            onMouseEnter={() => audio.playSFX('hover')}
            className={`w-full clip-diagonal font-bold tracking-[0.2em] uppercase py-6 transition-all ${isNameTaken || !specterName ? 'bg-primary/20 text-primary border-primary/50 cursor-not-allowed' : 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/50 hover:neon-border'}`}
          >
            <Zap className="w-4 h-4 mr-2" />
            {loading ? 'Sincronizando...' : isNameTaken ? 'Sapuris Bloqueado' : !specterName ? 'Selecciona un Espectro' : 'Actualizar Matriz de Identidad'}
          </Button>
        </CardContent>
      </Card>

      {/* Badges and Missions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel border-accent/20 clip-card relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
          <CardHeader className="border-b border-accent/10 pb-4">
            <CardTitle className="font-display text-lg text-accent flex items-center gap-2">
              <Medal className="w-5 h-5" /> Insignias Sapuris
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              {profile.badges && profile.badges.length > 0 ? (
                profile.badges.map((badge, idx) => (
                  <div key={idx} className="w-12 h-12 rounded-full border border-accent/50 bg-accent/10 flex items-center justify-center relative group cursor-help">
                    <Medal className="w-6 h-6 text-accent" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-accent/50 px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {badge}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground font-mono">Aún no has obtenido insignias. Demuestra tu valor en la Arena.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-accent/20 clip-card relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
          <CardHeader className="border-b border-accent/10 pb-4">
            <CardTitle className="font-display text-lg text-accent flex items-center gap-2">
              <Crosshair className="w-5 h-5" /> Misiones Diarias
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {profile.dailyMissions && profile.dailyMissions.length > 0 ? (
              profile.dailyMissions.map((mission, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-white">
                    <span>{mission.title}</span>
                    <span className={mission.completed ? 'text-green-400' : 'text-accent'}>
                      {mission.completed ? '✓ COMPLETADA' : `${mission.progress}/${mission.target}`}
                    </span>
                  </div>
                  <div className="h-2 bg-background border border-accent/30 rounded-sm overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${mission.completed ? 'bg-green-500' : 'bg-accent/50'
                        }`}
                      style={{ width: `${Math.min((mission.progress / mission.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground font-mono">No hay misiones activas. Inicia sesión para recibir nuevas misiones diarias.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Inventario de Equipo y Recursos */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
    {/* Fragmentos de Memoria y Recursos */}
    <Card className="glass-panel border-accent/20 clip-card relative overflow-hidden">
      <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
      <CardHeader className="border-b border-accent/10 pb-4">
        <CardTitle className="font-display text-lg text-accent flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> Recursos del Inframundo
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Memory Fragments */}
          <div className="bg-background/50 border border-cyan-500/30 p-4 clip-diagonal text-center space-y-2">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
            <div className="text-2xl font-bold text-cyan-400 font-display">
              {profile.memoryFragments || 0}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Fragmentos de Memoria
            </div>
          </div>

          {/* Obolos */}
          <div className="bg-background/50 border border-yellow-500/30 p-4 clip-diagonal text-center space-y-2">
            <Swords className="w-8 h-8 text-yellow-400 mx-auto" />
            <div className="text-2xl font-bold text-yellow-400 font-display">
              {profile.obolos || 0}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Óbolos
            </div>
          </div>

          {/* Star Fragments */}
          <div className="bg-background/50 border border-pink-500/30 p-4 clip-diagonal text-center space-y-2">
            <Target className="w-8 h-8 text-pink-400 mx-auto" />
            <div className="text-2xl font-bold text-pink-400 font-display">
              {profile.starFragments || 0}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Fragmentos Estelares
            </div>
          </div>

          {/* Battle Pass Points */}
          <div className="bg-background/50 border border-purple-500/30 p-4 clip-diagonal text-center space-y-2">
            <Zap className="w-8 h-8 text-purple-400 mx-auto" />
            <div className="text-2xl font-bold text-purple-400 font-display">
              {profile.passPoints || 0}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Puntos de Pase
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Inventario de Equipo */}
    <Card className="glass-panel border-accent/20 clip-card relative overflow-hidden">
      <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
      <CardHeader className="border-b border-accent/10 pb-4">
        <CardTitle className="font-display text-lg text-accent flex items-center gap-2">
          <PackageOpen className="w-5 h-5" /> Inventario de Equipo
        </CardTitle>
        <CardDescription className="text-xs">
          {profile.gearInventory?.length || 0} objetos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {profile.gearInventory && profile.gearInventory.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {profile.gearInventory.slice(0, 8).map((item, idx) => {
              const rarityColor = item.rarity === 'Legendario' ? 'border-yellow-500/50 bg-yellow-500/10' :
                item.rarity === 'Épico' ? 'border-purple-500/50 bg-purple-500/10' :
                  item.rarity === 'Raro' ? 'border-blue-500/50 bg-blue-500/10' :
                    'border-gray-500/50 bg-gray-500/10';

              return (
                <div key={idx} className={`border ${rarityColor} p-3 clip-diagonal space-y-2 cursor-pointer hover:scale-105 transition-transform`}>
                  <div className="text-center">
                    {item.type === 'weapon' && <Swords className="w-6 h-6 mx-auto text-accent" />}
                    {item.type === 'armor' && <ShieldIcon className="w-6 h-6 mx-auto text-accent" />}
                    {item.type === 'artifact' && <Sparkles className="w-6 h-6 mx-auto text-accent" />}
                  </div>
                  <div className="text-[10px] font-bold text-white uppercase tracking-wider truncate">
                    {item.name}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {item.rarity}
                  </div>
                </div>
              );
            })}
            {profile.gearInventory.length > 8 && (
              <div className="border border-accent/30 p-3 clip-diagonal flex items-center justify-center text-muted-foreground text-xs">
                +{profile.gearInventory.length - 8} más
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-mono text-center py-8">
            Inventario vacío. Derrota enemigos en la Arena para obtener equipo.
          </p>
        )}
      </CardContent>
    </Card>

    {/* SISTEMA DE REFERIDOS - Cadena de Almas */}
    <Card className="glass-panel border-accent/20 clip-card relative overflow-hidden">
      <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
      <CardHeader className="border-b border-accent/10 pb-4">
        <CardTitle className="font-display text-lg text-accent flex items-center gap-2">
          <Gift className="w-5 h-5" /> Cadena de Almas (Referidos)
        </CardTitle>
        <CardDescription className="text-xs">
          Comparte tu código y gana recompensas
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Tu Código de Referido */}
        <div className="bg-background/50 border border-cyan-500/30 p-4 clip-diagonal space-y-3">
          <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4" /> Tu Código de Referido
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-background border border-accent/50 rounded p-3 font-mono text-2xl text-center tracking-[0.3em] text-accent">
              {profile?.referralCode || '--------'}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="clip-diagonal border-accent/50 hover:bg-accent/20"
              onClick={() => {
                navigator.clipboard.writeText(profile?.referralCode || '');
                toast.success('¡Código copiado!');
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Comparte este código con tus amigos. Cuando se registren, ambos ganan +200 Óbolos y tú recibes +1 Fragmento Estelar.
          </p>
        </div>

        {/* Ingresar Código de Referido */}
        <ReferralInput />

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background/50 border border-purple-500/30 p-3 clip-diagonal text-center space-y-1">
            <Users className="w-6 h-6 text-purple-400 mx-auto" />
            <div className="text-2xl font-bold text-purple-400">{profile?.referralCount || 0}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Referidos</div>
          </div>
          <div className="bg-background/50 border border-yellow-500/30 p-3 clip-diagonal text-center space-y-1">
            <Coins className="w-6 h-6 text-yellow-400 mx-auto" />
            <div className="text-2xl font-bold text-yellow-400">{(profile?.referralCount || 0) * 200}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Óbolos Ganados</div>
          </div>
          <div className="bg-background/50 border border-pink-500/30 p-3 clip-diagonal text-center space-y-1">
            <Sparkles className="w-6 h-6 text-pink-400 mx-auto" />
            <div className="text-2xl font-bold text-pink-400">{profile?.referralCount || 0}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Fragmentos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
  );
};
