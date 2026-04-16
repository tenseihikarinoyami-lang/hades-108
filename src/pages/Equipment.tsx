import React, { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import {
  Circle,
  Coins,
  Flame,
  Gem,
  Hexagon,
  Moon,
  Package,
  Search,
  Shield,
  Snowflake,
  Sparkles,
  Sword,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { CharacterAvatar } from '@/components/CharacterAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { type GearPreset, useAuth } from '@/context/AuthContext';
import { audio } from '@/lib/audio';
import { db } from '@/lib/firebase';
import { calculateSetBonus, Element, Equipment, getSetBonusEffect, RARITY_COLORS, type GearType, type Rarity, type SetType } from '@/lib/rpg';

type EquippedGearState = {
  weapon?: Equipment | null;
  armor?: Equipment | null;
  artifact?: Equipment | null;
};

const ALL_TYPES = 'all';
const ALL_RARITIES = 'all';
const ALL_SETS = 'all';

const getPowerScore = (item: Equipment) =>
  (item.stats.damage || 0) * 3 + (item.stats.health || 0) + (item.stats.time || 0) * 18 + (item.sockets || 0) * 12;
const getGearBlockPower = (gear?: EquippedGearState | null) =>
  (gear?.weapon ? getPowerScore(gear.weapon) : 0) +
  (gear?.armor ? getPowerScore(gear.armor) : 0) +
  (gear?.artifact ? getPowerScore(gear.artifact) : 0);

const getSlotLabel = (type: GearType) => {
  if (type === 'weapon') return 'Arma';
  if (type === 'armor') return 'Armadura';
  return 'Artefacto';
};

export const EquipmentPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [liveGearInventory, setLiveGearInventory] = useState<Equipment[] | null>(null);
  const [liveEquippedGear, setLiveEquippedGear] = useState<EquippedGearState | null>(null);
  const [liveGearPresets, setLiveGearPresets] = useState<GearPreset[] | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<GearType | typeof ALL_TYPES>(ALL_TYPES);
  const [rarityFilter, setRarityFilter] = useState<Rarity | typeof ALL_RARITIES>(ALL_RARITIES);
  const [setFilter, setSetFilter] = useState<SetType | typeof ALL_SETS>(ALL_SETS);
  const [sortBy, setSortBy] = useState<'power' | 'rarity' | 'name'>('power');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLiveGearInventory(null);
      setLiveEquippedGear(null);
      setLiveGearPresets(null);
      return;
    }

    const docRef = doc(db, 'users', user.uid);
    return onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      setLiveGearInventory(Array.isArray(data.gearInventory) ? (data.gearInventory as Equipment[]) : []);
      setLiveEquippedGear({
        weapon: data.equippedGear?.weapon || null,
        armor: data.equippedGear?.armor || null,
        artifact: data.equippedGear?.artifact || null,
      });
      setLiveGearPresets(Array.isArray(data.gearPresets) ? (data.gearPresets as GearPreset[]) : []);
    });
  }, [user]);

  const resolvedGearInventory = useMemo(
    () => liveGearInventory ?? profile?.gearInventory ?? [],
    [liveGearInventory, profile?.gearInventory]
  );

  const resolvedEquippedGear = useMemo<EquippedGearState>(
    () => liveEquippedGear ?? profile?.equippedGear ?? { weapon: null, armor: null, artifact: null },
    [liveEquippedGear, profile?.equippedGear]
  );
  const resolvedGearPresets = useMemo(
    () => liveGearPresets ?? profile?.gearPresets ?? [],
    [liveGearPresets, profile?.gearPresets]
  );

  const activeSetBonus = calculateSetBonus(resolvedEquippedGear);
  const activeSetEffect = getSetBonusEffect(activeSetBonus);

  const filteredInventory = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const rarityWeight: Record<Rarity, number> = {
      bronce: 1,
      plata: 2,
      oro: 3,
      espectro: 4,
      divino: 5,
    };

    return resolvedGearInventory
      .filter((item) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          item.name.toLowerCase().includes(normalizedSearch) ||
          item.type.toLowerCase().includes(normalizedSearch) ||
          item.set.toLowerCase().includes(normalizedSearch) ||
          item.element.toLowerCase().includes(normalizedSearch);
        const matchesType = typeFilter === ALL_TYPES || item.type === typeFilter;
        const matchesRarity = rarityFilter === ALL_RARITIES || item.rarity === rarityFilter;
        const matchesSet = setFilter === ALL_SETS || item.set === setFilter;
        return matchesSearch && matchesType && matchesRarity && matchesSet;
      })
      .sort((left, right) => {
        if (sortBy === 'name') return left.name.localeCompare(right.name);
        if (sortBy === 'rarity') return rarityWeight[right.rarity] - rarityWeight[left.rarity] || getPowerScore(right) - getPowerScore(left);
        return getPowerScore(right) - getPowerScore(left);
      });
  }, [resolvedGearInventory, search, typeFilter, rarityFilter, setFilter, sortBy]);

  const selectedItem = useMemo(
    () => filteredInventory.find((item) => item.id === selectedItemId) || resolvedGearInventory.find((item) => item.id === selectedItemId) || null,
    [filteredInventory, resolvedGearInventory, selectedItemId]
  );

  const comparisonItem = selectedItem ? resolvedEquippedGear[selectedItem.type] || null : null;
  const comparisonDiff = selectedItem
    ? {
        damage: (selectedItem.stats.damage || 0) - (comparisonItem?.stats.damage || 0),
        health: (selectedItem.stats.health || 0) - (comparisonItem?.stats.health || 0),
        time: (selectedItem.stats.time || 0) - (comparisonItem?.stats.time || 0),
        power: getPowerScore(selectedItem) - (comparisonItem ? getPowerScore(comparisonItem) : 0),
      }
    : null;

  const handleEquip = async (item: Equipment) => {
    if (!user) return;
    audio.playSFX('click');

    try {
      const docRef = doc(db, 'users', user.uid);
      const newEquipped = { ...resolvedEquippedGear, [item.type]: item };
      await updateDoc(docRef, { equippedGear: newEquipped });
      toast.success(`${item.name} equipado.`);
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  };

  const handleUnequip = async (type: GearType) => {
    if (!user) return;
    audio.playSFX('click');

    try {
      const docRef = doc(db, 'users', user.uid);
      const newEquipped = { ...resolvedEquippedGear, [type]: null };
      await updateDoc(docRef, { equippedGear: newEquipped });
      toast('Objeto desequipado.');
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  };

  const handleSell = async (item: Equipment) => {
    if (!user) return;
    audio.playSFX('click');

    try {
      const docRef = doc(db, 'users', user.uid);
      const newInventory = resolvedGearInventory.filter((gear) => gear.id !== item.id);
      const sellValue = item.rarity === 'divino' ? 500 : item.rarity === 'espectro' ? 200 : item.rarity === 'oro' ? 100 : item.rarity === 'plata' ? 50 : 10;

      await updateDoc(docRef, {
        gearInventory: newInventory,
        obolos: (profile?.obolos || 0) + sellValue,
      });
      toast.success(`Vendido por ${sellValue} obolos.`);
      if (selectedItemId === item.id) {
        setSelectedItemId(null);
      }
    } catch (error) {
      console.error('Error selling item:', error);
    }
  };

  const handleSavePreset = async (preset: GearPreset) => {
    if (!user) return;
    audio.playSFX('click');

    try {
      const docRef = doc(db, 'users', user.uid);
      const nextPresets = resolvedGearPresets.map((entry) =>
        entry.id === preset.id
          ? {
              ...entry,
              equippedGear: resolvedEquippedGear,
              updatedAt: Date.now(),
            }
          : entry
      );

      await updateDoc(docRef, { gearPresets: nextPresets });
      toast.success(`Preset ${preset.name} guardado.`);
    } catch (error) {
      console.error('Error saving preset:', error);
    }
  };

  const handleApplyPreset = async (preset: GearPreset) => {
    if (!user) return;
    audio.playSFX('click');

    const hasGear =
      preset.equippedGear?.weapon ||
      preset.equippedGear?.armor ||
      preset.equippedGear?.artifact;

    if (!hasGear) {
      toast.error('Ese preset aun no tiene equipo guardado.');
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { equippedGear: preset.equippedGear });
      toast.success(`Preset ${preset.name} aplicado.`);
    } catch (error) {
      console.error('Error applying preset:', error);
    }
  };

  const getElementIcon = (element: Element) => {
    switch (element) {
      case 'Fuego':
        return <Flame className="w-3 h-3 text-red-500" />;
      case 'Hielo':
        return <Snowflake className="w-3 h-3 text-blue-300" />;
      case 'Rayo':
        return <Zap className="w-3 h-3 text-yellow-400" />;
      case 'Oscuridad':
        return <Moon className="w-3 h-3 text-purple-600" />;
      default:
        return <Circle className="w-3 h-3 text-slate-400" />;
    }
  };

  const renderDiff = (value: number, label: string, color: string) => {
    if (value === 0) return <span className="text-xs text-muted-foreground font-mono">{label}: =</span>;
    return (
      <span className={`text-xs font-mono ${value > 0 ? color : 'text-red-400'}`}>
        {label}: {value > 0 ? '+' : ''}{value}
      </span>
    );
  };

  const renderSlot = (type: GearType, item: Equipment | null | undefined, icon: React.ReactNode, label: string) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-mono text-accent tracking-widest uppercase">{label}</span>
      <div
        className={`w-24 h-24 clip-hex flex items-center justify-center border-2 transition-all ${item ? RARITY_COLORS[item.rarity] : 'border-accent/20 bg-background/50'} relative group cursor-pointer`}
        onClick={() => item && handleUnequip(type)}
        onMouseEnter={() => audio.playSFX('hover')}
      >
        {item ? (
          <div className="text-center p-2">
            <div className="text-[10px] font-mono leading-tight mb-1">{item.name}</div>
            {item.stats.damage && <div className="text-xs text-red-400">+{item.stats.damage} ATK</div>}
            {item.stats.health && <div className="text-xs text-green-400">+{item.stats.health} HP</div>}
            {item.stats.time && <div className="text-xs text-blue-400">+{item.stats.time}s</div>}
          </div>
        ) : (
          <div className="opacity-30">{icon}</div>
        )}

        {item && (
          <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-bold text-white">QUITAR</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <Hexagon className="w-16 h-16 text-accent mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Armeria Sapuris
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">
          Equipa reliquias, compara piezas y activa bonus de set para dominar el Inframundo
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <Card className="xl:col-span-1 glass-panel border-accent/30 clip-card relative overflow-hidden">
          <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
          <CardHeader className="text-center border-b border-accent/20 bg-background/40">
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase">Tu Espectro</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-12 flex flex-col items-center gap-8">
            <CharacterAvatar
              equippedGear={resolvedEquippedGear}
              specterName={profile?.specterName}
              photoURL={profile?.photoURL || user?.photoURL || ''}
              className="w-full"
            />

            <div className="flex justify-center gap-4 w-full">
              {renderSlot('weapon', resolvedEquippedGear.weapon, <Sword className="w-8 h-8" />, 'Arma')}
              {renderSlot('armor', resolvedEquippedGear.armor, <Shield className="w-8 h-8" />, 'Armadura')}
              {renderSlot('artifact', resolvedEquippedGear.artifact, <Gem className="w-8 h-8" />, 'Artefacto')}
            </div>

            <div className="w-full bg-background/50 border border-accent/20 p-4 clip-diagonal text-center space-y-3">
              <h4 className="font-mono text-accent text-xs tracking-widest">BONIFICACIONES TOTALES</h4>
              <div className="flex justify-center gap-4 text-sm font-bold">
                <span className="text-red-400">ATK: +{resolvedEquippedGear.weapon?.stats?.damage || 0}</span>
                <span className="text-green-400">HP: +{resolvedEquippedGear.armor?.stats?.health || 0}</span>
                <span className="text-blue-400">TIME: +{resolvedEquippedGear.artifact?.stats?.time || 0}s</span>
              </div>
              {activeSetEffect ? (
                <div className="mt-2 pt-2 border-t border-accent/20 space-y-1">
                  <div className="text-xs text-yellow-400 font-mono animate-pulse">Bono de Set Activo: {activeSetBonus}</div>
                  <div className="text-sm text-white">{activeSetEffect.title}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{activeSetEffect.description}</div>
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-accent/20 text-[11px] text-muted-foreground font-mono">
                  Equipa 3 piezas del mismo set para activar un bonus real.
                </div>
              )}
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-accent text-xs tracking-widest">PRESETS DE BUILD</h4>
                <span className="text-[10px] font-mono text-muted-foreground">Arena / Torre / Laberinto</span>
              </div>
              <div className="space-y-3">
                {resolvedGearPresets.map((preset) => {
                  const presetSetEffect = getSetBonusEffect(calculateSetBonus(preset.equippedGear || {}));
                  const presetPower = getGearBlockPower(preset.equippedGear);
                  const weaponName = preset.equippedGear?.weapon?.name || 'Sin arma';
                  const armorName = preset.equippedGear?.armor?.name || 'Sin armadura';
                  const artifactName = preset.equippedGear?.artifact?.name || 'Sin artefacto';

                  return (
                    <div key={preset.id} className="border border-accent/20 bg-background/40 clip-diagonal p-3 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-display text-white">{preset.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">{preset.description}</div>
                        </div>
                        <div className="text-right text-[10px] font-mono text-muted-foreground">
                          <div>Poder: {presetPower}</div>
                          <div>{preset.updatedAt ? new Date(preset.updatedAt).toLocaleDateString() : 'Sin guardar'}</div>
                        </div>
                      </div>
                      <div className="space-y-1 text-[11px] font-mono text-muted-foreground">
                        <div>{weaponName}</div>
                        <div>{armorName}</div>
                        <div>{artifactName}</div>
                      </div>
                      {presetSetEffect ? (
                        <div className="text-[11px] font-mono text-yellow-400">{presetSetEffect.title}</div>
                      ) : (
                        <div className="text-[11px] font-mono text-muted-foreground">Sin set completo guardado.</div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 clip-diagonal border-accent/20 hover:bg-accent/10"
                          onClick={() => handleApplyPreset(preset)}
                        >
                          Aplicar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 clip-diagonal border-primary/20 hover:bg-primary/10"
                          onClick={() => handleSavePreset(preset)}
                        >
                          Guardar actual
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 glass-panel border-accent/30 clip-card">
          <CardHeader className="border-b border-accent/20 bg-background/40 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="font-display text-xl text-white tracking-widest uppercase flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" /> Inventario y Mercado Negro
              </CardTitle>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-yellow-400 flex items-center gap-1"><Coins className="w-3 h-3" /> {profile?.obolos || 0}</span>
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> {profile?.starFragments || 0}</span>
                <span className="text-xs font-mono text-muted-foreground">{filteredInventory.length} visibles / {resolvedGearInventory.length} total</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Busca por nombre, set o elemento"
                  className="pl-9 bg-background/50 border-accent/20"
                />
              </div>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as GearType | typeof ALL_TYPES)} className="h-10 rounded-md border border-accent/20 bg-background/50 px-3 text-sm text-white">
                <option value={ALL_TYPES}>Todos los tipos</option>
                <option value="weapon">Armas</option>
                <option value="armor">Armaduras</option>
                <option value="artifact">Artefactos</option>
              </select>
              <select value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value as Rarity | typeof ALL_RARITIES)} className="h-10 rounded-md border border-accent/20 bg-background/50 px-3 text-sm text-white">
                <option value={ALL_RARITIES}>Todas las rarezas</option>
                <option value="bronce">Bronce</option>
                <option value="plata">Plata</option>
                <option value="oro">Oro</option>
                <option value="espectro">Espectro</option>
                <option value="divino">Divino</option>
              </select>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'power' | 'rarity' | 'name')} className="h-10 rounded-md border border-accent/20 bg-background/50 px-3 text-sm text-white">
                <option value="power">Orden: Poder</option>
                <option value="rarity">Orden: Rareza</option>
                <option value="name">Orden: Nombre</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <select value={setFilter} onChange={(event) => setSetFilter(event.target.value as SetType | typeof ALL_SETS)} className="h-10 rounded-md border border-accent/20 bg-background/50 px-3 text-sm text-white min-w-[180px]">
                <option value={ALL_SETS}>Todos los sets</option>
                {[...new Set(resolvedGearInventory.map((item) => item.set))].sort().map((setName) => (
                  <option key={setName} value={setName}>
                    Set: {setName}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={() => { setSearch(''); setTypeFilter(ALL_TYPES); setRarityFilter(ALL_RARITIES); setSetFilter(ALL_SETS); setSortBy('power'); }} className="clip-diagonal border-accent/20 hover:bg-accent/10">
                Limpiar filtros
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono border border-dashed border-accent/20 clip-diagonal">
                No hay objetos que coincidan con los filtros actuales.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredInventory.map((item) => {
                  const isEquipped =
                    resolvedEquippedGear.weapon?.id === item.id ||
                    resolvedEquippedGear.armor?.id === item.id ||
                    resolvedEquippedGear.artifact?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-4 border clip-diagonal flex flex-col justify-between gap-4 transition-all cursor-pointer ${
                        selectedItemId === item.id
                          ? 'border-accent bg-accent/10 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                          : isEquipped
                            ? 'border-accent/50 bg-accent/10 opacity-70'
                            : `border-accent/20 bg-background/60 hover:border-accent ${RARITY_COLORS[item.rarity].split(' ')[0]}`
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono tracking-widest uppercase opacity-70 flex items-center gap-1">
                            {getElementIcon(item.element)} {item.type}
                          </span>
                          <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">{item.rarity}</span>
                        </div>
                        <h4 className="font-bold text-sm leading-tight mb-2">{item.name}</h4>
                        <div className="space-y-1 mb-2">
                          {item.stats.damage ? <div className="text-xs text-red-400 font-mono">+{item.stats.damage} Dano</div> : null}
                          {item.stats.health ? <div className="text-xs text-green-400 font-mono">+{item.stats.health} Vida Inicial</div> : null}
                          {item.stats.time ? <div className="text-xs text-blue-400 font-mono">+{item.stats.time}s Tiempo</div> : null}
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                          <span>Set: {item.set}</span>
                          <span>Poder: {getPowerScore(item)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isEquipped}
                          className="flex-1 clip-diagonal font-mono text-xs tracking-widest uppercase border-accent/30 hover:bg-accent/20 hover:text-accent"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEquip(item);
                          }}
                          onMouseEnter={() => audio.playSFX('hover')}
                        >
                          {isEquipped ? 'Equipado' : 'Equipar'}
                        </Button>
                        {!isEquipped && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="clip-diagonal font-mono text-xs tracking-widest uppercase border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSell(item);
                            }}
                            title="Vender en el Mercado Negro"
                          >
                            <Coins className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1 glass-panel border-accent/30 clip-card">
          <CardHeader className="border-b border-accent/20 bg-background/40">
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase">Comparador</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {!selectedItem ? (
              <div className="text-center py-8 text-muted-foreground font-mono border border-dashed border-accent/20 clip-diagonal">
                Selecciona un objeto del inventario para compararlo con tu pieza equipada.
              </div>
            ) : (
              <>
                <div className={`p-4 border clip-diagonal ${RARITY_COLORS[selectedItem.rarity]}`}>
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-70 mb-2">{getSlotLabel(selectedItem.type)} candidato</div>
                  <div className="font-bold text-sm mb-2">{selectedItem.name}</div>
                  <div className="space-y-1 text-xs font-mono">
                    <div>Poder: {getPowerScore(selectedItem)}</div>
                    {selectedItem.stats.damage ? <div>ATK: +{selectedItem.stats.damage}</div> : null}
                    {selectedItem.stats.health ? <div>HP: +{selectedItem.stats.health}</div> : null}
                    {selectedItem.stats.time ? <div>TIME: +{selectedItem.stats.time}s</div> : null}
                    <div>Set: {selectedItem.set}</div>
                  </div>
                </div>

                <div className="p-4 border border-accent/20 clip-diagonal bg-background/50">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-accent/70 mb-2">Pieza equipada actual</div>
                  {comparisonItem ? (
                    <>
                      <div className="font-bold text-sm mb-2">{comparisonItem.name}</div>
                      <div className="space-y-1 text-xs font-mono text-muted-foreground">
                        <div>Poder: {getPowerScore(comparisonItem)}</div>
                        {comparisonItem.stats.damage ? <div>ATK: +{comparisonItem.stats.damage}</div> : null}
                        {comparisonItem.stats.health ? <div>HP: +{comparisonItem.stats.health}</div> : null}
                        {comparisonItem.stats.time ? <div>TIME: +{comparisonItem.stats.time}s</div> : null}
                        <div>Set: {comparisonItem.set}</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs font-mono text-muted-foreground">No tienes ninguna pieza equipada en este slot.</div>
                  )}
                </div>

                {comparisonDiff && (
                  <div className="p-4 border border-primary/20 clip-diagonal bg-primary/5 space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-primary/80">Diferencia directa</div>
                    <div className="grid grid-cols-2 gap-2">
                      {renderDiff(comparisonDiff.power, 'Poder', 'text-cyan-400')}
                      {renderDiff(comparisonDiff.damage, 'ATK', 'text-red-400')}
                      {renderDiff(comparisonDiff.health, 'HP', 'text-green-400')}
                      {renderDiff(comparisonDiff.time, 'TIME', 'text-blue-400')}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
