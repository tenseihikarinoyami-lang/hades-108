import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  AlertCircle,
  ArrowUpCircle,
  Coins,
  Copy,
  Cpu,
  Crosshair,
  Fingerprint,
  Flag,
  Gift,
  Medal,
  PackageOpen,
  Shield as ShieldIcon,
  Sparkles,
  Swords,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { audio } from '@/lib/audio';
import { processReferralCode } from '@/lib/referrals';
import { getSpecterById, getSpecterByName, getSpecterCollectionProgress, SPECTERS_BY_FACTION } from '@/data/specters';

const FACTIONS = [
  { id: 'Wyvern', name: 'Ejercito de Radamanthys (Wyvern)', color: 'text-purple-500', border: 'border-purple-500' },
  { id: 'Griffon', name: 'Ejercito de Minos (Griffon)', color: 'text-blue-500', border: 'border-blue-500' },
  { id: 'Garuda', name: 'Ejercito de Aiacos (Garuda)', color: 'text-orange-500', border: 'border-orange-500' },
] as const;

const FACTION_ORDER = ['Wyvern', 'Griffon', 'Garuda'] as const;

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
      toast.error('Error al aplicar codigo de referido');
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
        <p className="text-xs text-muted-foreground mt-2">Ya usaste un codigo de referido.</p>
      </div>
    );
  }

  return (
    <div className="bg-background/50 border border-orange-500/30 p-4 clip-diagonal space-y-3">
      <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
        <Gift className="w-4 h-4" /> Tienes un codigo de referido
      </h4>
      <div className="flex gap-2">
        <Input
          value={referralInput}
          onChange={(event) => setReferralInput(event.target.value.toUpperCase())}
          placeholder="Ingresa el codigo"
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

export const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [specterId, setSpecterId] = useState(profile?.specterId || '');
  const [specterName, setSpecterName] = useState(profile?.specterName || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [faction, setFaction] = useState(profile?.faction || '');
  const [specterSearch, setSpecterSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [takenSpecters, setTakenSpecters] = useState<string[]>([]);

  const selectedSpecter = useMemo(
    () => getSpecterById(specterId) || getSpecterByName(specterName),
    [specterId, specterName]
  );
  const collectionProgress = useMemo(() => getSpecterCollectionProgress(profile || undefined), [profile]);
  const awakeningLevel = selectedSpecter ? profile?.specterAwakenings?.[selectedSpecter.id] || 0 : 0;
  const nextAwakening = selectedSpecter?.awakenings.find((stage) => stage.level === Math.min(awakeningLevel + 1, 3));
  const awakeningCost = (awakeningLevel + 1) * 3;

  const filteredSpecters = useMemo(() => {
    const normalizedSearch = specterSearch.trim().toLowerCase();
    return FACTION_ORDER.reduce((accumulator, factionKey) => {
      accumulator[factionKey] = SPECTERS_BY_FACTION[factionKey].filter((specter) => {
        const matchesFaction = !faction || specter.faction === faction;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          specter.name.toLowerCase().includes(normalizedSearch) ||
          specter.beast.toLowerCase().includes(normalizedSearch) ||
          specter.legion.toLowerCase().includes(normalizedSearch);
        return matchesFaction && matchesSearch;
      });
      return accumulator;
    }, {} as Record<(typeof FACTION_ORDER)[number], typeof SPECTERS_BY_FACTION[(typeof FACTION_ORDER)[number]]>);
  }, [faction, specterSearch]);

  useEffect(() => {
    if (!profile) return;
    const resolved = getSpecterById(profile.specterId) || getSpecterByName(profile.specterName);
    setSpecterId(resolved?.id || profile.specterId || '');
    setSpecterName(resolved?.name || profile.specterName || '');
    setPhotoURL(profile.photoURL || resolved?.logo || '');
    setFaction(profile.faction || resolved?.faction || '');
  }, [profile]);

  useEffect(() => {
    const fetchTakenSpecters = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'users')));
        const taken: string[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          if (data.specterName && docSnapshot.id !== user?.uid) {
            taken.push(data.specterName);
          }
        });
        setTakenSpecters(taken);
      } catch (error) {
        console.error('Error fetching taken specters', error);
      }
    };

    if (user) {
      fetchTakenSpecters();
    }
  }, [user]);

  const handleSpecterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSpecter = getSpecterById(event.target.value);
    if (!nextSpecter) return;

    setSpecterId(nextSpecter.id);
    setSpecterName(nextSpecter.name);
    setPhotoURL(nextSpecter.logo);
    setFaction(nextSpecter.faction);
  };

  const handleRestoreOfficialLogo = () => {
    if (!selectedSpecter) return;
    setPhotoURL(selectedSpecter.logo);
    toast.success('Logo oficial restaurado');
  };

  const handleSave = async () => {
    if (!user || !selectedSpecter) return;
    setLoading(true);

    try {
      const querySnapshot = await getDocs(query(collection(db, 'users'), where('specterName', '==', selectedSpecter.name)));
      const isTaken = querySnapshot.docs.some((docSnapshot) => docSnapshot.id !== user.uid);

      if (isTaken) {
        toast.error(`El Sapuris de ${selectedSpecter.name} ya ha sido reclamado.`);
        setLoading(false);
        return;
      }

      await updateProfile({
        specterId: selectedSpecter.id,
        specterName: selectedSpecter.name,
        photoURL: photoURL || selectedSpecter.logo,
        faction: faction || selectedSpecter.faction,
        specterAbilityName: selectedSpecter.ability.name,
        specterAbilityDescription: selectedSpecter.ability.description,
        discoveredSpecters: Array.from(new Set([...(profile?.discoveredSpecters || []), selectedSpecter.id])),
      });

      audio.playSFX('success');
      toast.success('Identidad sincronizada con la red Cocytos');
    } catch (error) {
      audio.playSFX('error');
      toast.error('Error al actualizar la identidad');
    } finally {
      setLoading(false);
    }
  };

  const handleAwakenSpecter = async () => {
    if (!selectedSpecter || !profile) return;
    if (awakeningLevel >= 3) {
      toast.info('Ese espectro ya alcanzo su despertar maximo.');
      return;
    }
    if ((profile.cosmosPoints || 0) < awakeningCost) {
      toast.error(`Necesitas ${awakeningCost} puntos de cosmos para despertar a ${selectedSpecter.title}.`);
      return;
    }

    const nextLevel = awakeningLevel + 1;
    await updateProfile({
      cosmosPoints: (profile.cosmosPoints || 0) - awakeningCost,
      specterAwakenings: {
        ...(profile.specterAwakenings || {}),
        [selectedSpecter.id]: nextLevel,
      },
      discoveredSpecters: Array.from(new Set([...(profile.discoveredSpecters || []), selectedSpecter.id])),
    });
    audio.playSFX('success');
    toast.success(`${selectedSpecter.title} alcanzo Despertar ${nextLevel}.`);
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full neon-border" />
      </div>
    );
  }

  const isNameTaken = !!selectedSpecter && takenSpecters.includes(selectedSpecter.name);
  const logoPreview = photoURL || selectedSpecter?.logo || '';
  const currentFamilyProgress = selectedSpecter
    ? collectionProgress.familyProgress.find((family) => family.family === selectedSpecter.family)
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 relative">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Identidad Sapuris
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.3em] uppercase text-xs">
          Base de Datos del Inframundo
        </p>
      </div>

      <Card className="glass-panel border-accent/30 hologram relative overflow-hidden clip-card">
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-accent/20 opacity-50" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/20 opacity-50" />

        <CardHeader className="border-b border-accent/10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display tracking-[0.1em] text-accent flex items-center gap-2">
                <Fingerprint className="w-5 h-5" /> Credencial Holografica
              </CardTitle>
              <CardDescription className="text-xs tracking-widest uppercase mt-1">
                Nivel de acceso: {profile.role} | 108 espectros disponibles
              </CardDescription>
            </div>
            <Cpu className="w-8 h-8 text-accent/30 animate-pulse-slow" />
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full group-hover:bg-accent/40 transition-all duration-500" />
              <div className="w-32 h-32 border-2 border-accent/50 clip-hex bg-background/80 relative z-10 overflow-hidden flex items-center justify-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt={selectedSpecter?.name || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-display text-accent">{specterName?.[0] || 'E'}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 clip-diagonal tracking-widest z-20">
                ACTIVO
              </div>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <Label htmlFor="specterSearch" className="text-xs tracking-widest uppercase text-accent/70">
                    Buscar entre los 108 espectros
                  </Label>
                  <Input
                    id="specterSearch"
                    value={specterSearch}
                    onChange={(event) => setSpecterSearch(event.target.value)}
                    placeholder="Busca por nombre, bestia o legion"
                    className="bg-background/40 border-accent/30 focus:border-accent text-white font-sans tracking-wider"
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="specterId" className="text-xs tracking-widest uppercase text-accent/70">
                    Designacion del espectro
                  </Label>
                  <select
                    id="specterId"
                    value={specterId}
                    onChange={handleSpecterChange}
                    onClick={() => audio.playSFX('click')}
                    className={`flex h-10 w-full rounded-md border border-accent/30 bg-background/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent tracking-wider ${
                      isNameTaken ? 'border-primary focus:ring-primary text-primary' : ''
                    }`}
                  >
                    <option value="" disabled>
                      Selecciona tu Espectro...
                    </option>
                    {FACTION_ORDER.map((factionKey) => (
                      <optgroup key={factionKey} label={FACTIONS.find((item) => item.id === factionKey)?.name || factionKey}>
                        {filteredSpecters[factionKey].map((specter) => (
                          <option
                            key={specter.id}
                            value={specter.id}
                            disabled={takenSpecters.includes(specter.name)}
                            className="bg-background text-white"
                          >
                            {takenSpecters.includes(specter.name)
                              ? `${specter.legion} - ${specter.name} (OCUPADO)`
                              : `${specter.legion} - ${specter.name}`}
                          </option>
                        ))}
                      </optgroup>
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
                    <Flag className="w-3 h-3" /> Faccion
                  </Label>
                  <select
                    id="faction"
                    value={faction}
                    onChange={(event) => setFaction(event.target.value as (typeof FACTIONS)[number]['id'])}
                    onClick={() => audio.playSFX('click')}
                    className="flex h-10 w-full rounded-md border border-accent/30 bg-background/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent tracking-wider"
                  >
                    <option value="" disabled>
                      Selecciona tu Ejercito...
                    </option>
                    {FACTIONS.map((item) => (
                      <option key={item.id} value={item.id} className="bg-background text-white">
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="photoURL" className="text-xs tracking-widest uppercase text-accent/70">
                      Logo oficial / enlace personalizado
                    </Label>
                    {selectedSpecter && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRestoreOfficialLogo}
                        className="clip-diagonal border-accent/40 hover:bg-accent/10 text-xs"
                      >
                        Restaurar logo oficial
                      </Button>
                    )}
                  </div>
                  <Input
                    id="photoURL"
                    value={photoURL}
                    onChange={(event) => setPhotoURL(event.target.value)}
                    onClick={() => audio.playSFX('click')}
                    placeholder="data:image/svg+xml... o https://..."
                    className="bg-background/40 border-accent/30 focus:border-accent text-white font-sans tracking-wider"
                  />
                </div>
              </div>

              {selectedSpecter && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background/50 border border-accent/20 p-4 clip-diagonal space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-accent/70">Ficha del Sapuris</p>
                    <h3 className="font-display text-xl text-white tracking-wider">{selectedSpecter.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{selectedSpecter.legion}</p>
                    <p className="text-xs text-muted-foreground">{selectedSpecter.factionLabel}</p>
                    <p className="text-xs text-yellow-400 uppercase tracking-widest">{selectedSpecter.legionRank}</p>
                    <p className="text-sm text-white/90">Bestia tutelar: {selectedSpecter.beast}</p>
                  </div>

                  <div className="bg-background/50 border border-primary/30 p-4 clip-diagonal space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary/80">Habilidad especial</p>
                    <h3 className="font-display text-lg text-primary tracking-wide">{selectedSpecter.ability.name}</h3>
                    <p className="text-sm text-white/90">{selectedSpecter.ability.description}</p>
                  </div>

                  <div className="bg-background/50 border border-cyan-500/30 p-4 clip-diagonal space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">Afinidad y Familia</p>
                    <h3 className="font-display text-lg text-white tracking-wide">{selectedSpecter.affinity.name}</h3>
                    <p className="text-sm text-white/90">{selectedSpecter.affinity.description}</p>
                    <p className="text-[11px] font-mono text-cyan-300">Familia: {selectedSpecter.family}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Elementos favorecidos: {selectedSpecter.affinity.favoredElements.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {selectedSpecter && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background/50 border border-purple-500/30 p-4 clip-diagonal space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-purple-300">Despertar del Espectro</p>
                        <h3 className="font-display text-lg text-white">Nivel {awakeningLevel}/3</h3>
                      </div>
                      <div className="text-right text-[11px] font-mono text-muted-foreground">
                        Cosmos: <span className="text-purple-300">{profile.cosmosPoints || 0}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedSpecter.awakenings.map((stage) => (
                        <div
                          key={stage.level}
                          className={`p-3 border clip-diagonal ${stage.level <= awakeningLevel ? 'border-purple-400 bg-purple-500/10' : 'border-accent/20 bg-background/40'}`}
                        >
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Nivel {stage.level}</div>
                          <div className="text-sm font-display text-white mt-1">{stage.name}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/90">
                      {nextAwakening ? nextAwakening.description : 'Despertar maximo alcanzado.'}
                    </p>
                    <Button
                      type="button"
                      onClick={handleAwakenSpecter}
                      disabled={awakeningLevel >= 3 || (profile.cosmosPoints || 0) < awakeningCost}
                      className="clip-diagonal bg-purple-600 hover:bg-purple-500 text-white uppercase tracking-widest"
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-2" />
                      {awakeningLevel >= 3 ? 'Maximo Alcanzado' : `Despertar (${awakeningCost} cosmos)`}
                    </Button>
                  </div>

                  <div className="bg-background/50 border border-emerald-500/30 p-4 clip-diagonal space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">Coleccion de los 108</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border border-emerald-500/20 bg-background/40 clip-diagonal text-center">
                        <div className="text-2xl font-display text-emerald-300">{collectionProgress.discoveredCount}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Descubiertos</div>
                      </div>
                      <div className="p-3 border border-yellow-500/20 bg-background/40 clip-diagonal text-center">
                        <div className="text-2xl font-display text-yellow-300">{collectionProgress.completedFamilies.length}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Familias completas</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-white">{currentFamilyProgress?.family || selectedSpecter.family}</span>
                        <span className="text-emerald-300">
                          {currentFamilyProgress?.discovered || 0}/{currentFamilyProgress?.total || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-background border border-emerald-500/20 rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-emerald-500/70"
                          style={{ width: `${((currentFamilyProgress?.discovered || 0) / Math.max(currentFamilyProgress?.total || 1, 1)) * 100}%` }}
                        />
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        Cada familia completa otorga bonus globales de dano, botin y obolos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={loading || !selectedSpecter}
                className="clip-diagonal bg-accent hover:bg-accent/80 text-black font-bold tracking-[0.2em] uppercase px-8 w-full"
                onMouseEnter={() => audio.playSFX('hover')}
              >
                {loading
                  ? 'Sincronizando...'
                  : isNameTaken
                    ? 'Sapuris Bloqueado'
                    : !selectedSpecter
                      ? 'Selecciona un Espectro'
                      : 'Actualizar Matriz de Identidad'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                profile.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-full border border-accent/50 bg-accent/10 flex items-center justify-center relative group cursor-help"
                  >
                    <Medal className="w-6 h-6 text-accent" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-accent/50 px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {badge}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground font-mono">Aun no has obtenido insignias.</p>
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
              profile.dailyMissions.map((mission, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-white">
                    <span>{mission.title}</span>
                    <span className={mission.completed ? 'text-green-400' : 'text-accent'}>
                      {mission.completed ? 'COMPLETADA' : `${mission.progress}/${mission.target}`}
                    </span>
                  </div>
                  <div className="h-2 bg-background border border-accent/30 rounded-sm overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${mission.completed ? 'bg-green-500' : 'bg-accent/50'}`}
                      style={{ width: `${Math.min((mission.progress / mission.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground font-mono">No hay misiones activas.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="glass-panel border-accent/20 clip-card relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
          <CardHeader className="border-b border-accent/10 pb-4">
            <CardTitle className="font-display text-lg text-accent flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Recursos del Inframundo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 border border-cyan-500/30 p-4 clip-diagonal text-center space-y-2">
                <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
                <div className="text-2xl font-bold text-cyan-400 font-display">{profile.memoryFragments || 0}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Fragmentos de Memoria</div>
              </div>
              <div className="bg-background/50 border border-yellow-500/30 p-4 clip-diagonal text-center space-y-2">
                <Swords className="w-8 h-8 text-yellow-400 mx-auto" />
                <div className="text-2xl font-bold text-yellow-400 font-display">{profile.obolos || 0}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Obolos</div>
              </div>
              <div className="bg-background/50 border border-pink-500/30 p-4 clip-diagonal text-center space-y-2">
                <Target className="w-8 h-8 text-pink-400 mx-auto" />
                <div className="text-2xl font-bold text-pink-400 font-display">{profile.starFragments || 0}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Fragmentos Estelares</div>
              </div>
              <div className="bg-background/50 border border-purple-500/30 p-4 clip-diagonal text-center space-y-2">
                <Zap className="w-8 h-8 text-purple-400 mx-auto" />
                <div className="text-2xl font-bold text-purple-400 font-display">{profile.passPoints || 0}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Puntos de Pase</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-accent/20 clip-card relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
          <CardHeader className="border-b border-accent/10 pb-4">
            <CardTitle className="font-display text-lg text-accent flex items-center gap-2">
              <PackageOpen className="w-5 h-5" /> Inventario de Equipo
            </CardTitle>
            <CardDescription className="text-xs">{profile.gearInventory?.length || 0} objetos</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {profile.gearInventory && profile.gearInventory.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {profile.gearInventory.slice(0, 8).map((item, index) => {
                  const rarityColor =
                    item.rarity === 'divino'
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : item.rarity === 'espectro'
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : item.rarity === 'oro'
                          ? 'border-yellow-500/50 bg-yellow-500/10'
                          : item.rarity === 'plata'
                            ? 'border-slate-400/50 bg-slate-400/10'
                            : 'border-orange-500/50 bg-orange-500/10';
                  return (
                    <div
                      key={index}
                      className={`border ${rarityColor} p-3 clip-diagonal space-y-2 cursor-pointer hover:scale-105 transition-transform`}
                    >
                      <div className="text-center">
                        {item.type === 'weapon' && <Swords className="w-6 h-6 mx-auto text-accent" />}
                        {item.type === 'armor' && <ShieldIcon className="w-6 h-6 mx-auto text-accent" />}
                        {item.type === 'artifact' && <Sparkles className="w-6 h-6 mx-auto text-accent" />}
                      </div>
                      <div className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{item.name}</div>
                      <div className="text-[9px] text-muted-foreground">{item.rarity}</div>
                    </div>
                  );
                })}
                {profile.gearInventory.length > 8 && (
                  <div className="border border-accent/30 p-3 clip-diagonal flex items-center justify-center text-muted-foreground text-xs">
                    +{profile.gearInventory.length - 8} mas
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-mono text-center py-8">
                Inventario vacio. Derrota enemigos en la Arena.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-accent/20 clip-card relative overflow-hidden">
        <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
        <CardHeader className="border-b border-accent/10 pb-4">
          <CardTitle className="font-display text-lg text-accent flex items-center gap-2">
            <Gift className="w-5 h-5" /> Cadena de Almas (Referidos)
          </CardTitle>
          <CardDescription className="text-xs">Comparte tu codigo y gana recompensas</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="bg-background/50 border border-cyan-500/30 p-4 clip-diagonal space-y-3">
            <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4" /> Tu Codigo de Referido
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
                  toast.success('Codigo copiado');
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Comparte este codigo con tus amigos. Ambos ganan +200 Obolos.
            </p>
          </div>

          <ReferralInput />

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background/50 border border-purple-500/30 p-3 clip-diagonal text-center space-y-1">
              <Users className="w-6 h-6 text-purple-400 mx-auto" />
              <div className="text-2xl font-bold text-purple-400">{profile?.referralCount || 0}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Referidos</div>
            </div>
            <div className="bg-background/50 border border-yellow-500/30 p-3 clip-diagonal text-center space-y-1">
              <Coins className="w-6 h-6 text-yellow-400 mx-auto" />
              <div className="text-2xl font-bold text-yellow-400">{(profile?.referralCount || 0) * 200}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Obolos Ganados</div>
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
