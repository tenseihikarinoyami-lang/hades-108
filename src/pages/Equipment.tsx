import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Sword, Gem, Package, Hexagon, Coins, Sparkles, Flame, Snowflake, Zap, Moon, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { audio } from '@/lib/audio';
import { Equipment, RARITY_COLORS, calculateSetBonus, Element } from '@/lib/rpg';
import { CharacterAvatar } from '@/components/CharacterAvatar';

type EquippedGearState = {
  weapon?: Equipment | null;
  armor?: Equipment | null;
  artifact?: Equipment | null;
};

export const EquipmentPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [liveGearInventory, setLiveGearInventory] = useState<Equipment[] | null>(null);
  const [liveEquippedGear, setLiveEquippedGear] = useState<EquippedGearState | null>(null);

  useEffect(() => {
    if (!user) {
      setLiveGearInventory(null);
      setLiveEquippedGear(null);
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

  const handleEquip = async (item: Equipment) => {
    if (!user) return;
    audio.playSFX('click');

    try {
      const docRef = doc(db, 'users', user.uid);
      const newEquipped = { ...resolvedEquippedGear };
      newEquipped[item.type] = item;

      await updateDoc(docRef, { equippedGear: newEquipped });
      toast.success(`${item.name} equipado.`);
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  };

  const handleUnequip = async (type: 'weapon' | 'armor' | 'artifact') => {
    if (!user) return;
    audio.playSFX('click');

    try {
      const docRef = doc(db, 'users', user.uid);
      const newEquipped = { ...resolvedEquippedGear };
      newEquipped[type] = null;

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
    } catch (error) {
      console.error('Error selling item:', error);
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

  const renderSlot = (type: 'weapon' | 'armor' | 'artifact', item: Equipment | null | undefined, icon: React.ReactNode, label: string) => (
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

  const activeSetBonus = calculateSetBonus(resolvedEquippedGear);

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <Hexagon className="w-16 h-16 text-accent mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Armeria Sapuris
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Equipa reliquias para tu aumento de poder en la Arena</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 glass-panel border-accent/30 clip-card relative overflow-hidden">
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

            <div className="w-full bg-background/50 border border-accent/20 p-4 clip-diagonal text-center space-y-2">
              <h4 className="font-mono text-accent text-xs tracking-widest">BONIFICACIONES TOTALES</h4>
              <div className="flex justify-center gap-4 text-sm font-bold">
                <span className="text-red-400">ATK: +{resolvedEquippedGear.weapon?.stats?.damage || 0}</span>
                <span className="text-green-400">HP: +{resolvedEquippedGear.armor?.stats?.health || 0}</span>
                <span className="text-blue-400">TIME: +{resolvedEquippedGear.artifact?.stats?.time || 0}s</span>
              </div>
              {activeSetBonus && (
                <div className="mt-2 pt-2 border-t border-accent/20 text-xs text-yellow-400 font-mono animate-pulse">
                  Bono de Set Activo: {activeSetBonus}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 glass-panel border-accent/30 clip-card">
          <CardHeader className="border-b border-accent/20 bg-background/40 flex flex-row items-center justify-between">
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" /> Inventario y Mercado Negro
            </CardTitle>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-yellow-400 flex items-center gap-1"><Coins className="w-3 h-3" /> {profile?.obolos || 0}</span>
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> {profile?.starFragments || 0}</span>
              <span className="text-xs font-mono text-muted-foreground">{resolvedGearInventory.length} OBJETOS</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {resolvedGearInventory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono border border-dashed border-accent/20 clip-diagonal">
                Tu inventario esta vacio. Juega en la Arena para obtener el botin.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {resolvedGearInventory.map((item) => {
                  const isEquipped =
                    resolvedEquippedGear.weapon?.id === item.id ||
                    resolvedEquippedGear.armor?.id === item.id ||
                    resolvedEquippedGear.artifact?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 border clip-diagonal flex flex-col justify-between gap-4 transition-all ${isEquipped ? 'border-accent/50 bg-accent/10 opacity-50' : `border-accent/20 bg-background/60 hover:border-accent ${RARITY_COLORS[item.rarity].split(' ')[0]}`}`}
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
                        {item.set !== 'Ninguno' && (
                          <div className="text-[10px] text-yellow-500/80 font-mono">Set: {item.set}</div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isEquipped}
                          className="flex-1 clip-diagonal font-mono text-xs tracking-widest uppercase border-accent/30 hover:bg-accent/20 hover:text-accent"
                          onClick={() => handleEquip(item)}
                          onMouseEnter={() => audio.playSFX('hover')}
                        >
                          {isEquipped ? 'Equipado' : 'Equipar'}
                        </Button>
                        {!isEquipped && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="clip-diagonal font-mono text-xs tracking-widest uppercase border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                            onClick={() => handleSell(item)}
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
      </div>
    </div>
  );
};
