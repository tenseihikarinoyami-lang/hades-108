import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Flame, Coins, Sparkles, ArrowRight, Hammer, Gem as GemIcon } from 'lucide-react';
import { toast } from 'sonner';
import { audio } from '@/lib/audio';
import { Equipment, Gem, RARITY_COLORS, UPGRADE_COSTS, upgradeEquipment } from '@/lib/rpg';
import { getCurrentCataclysm } from '@/lib/cataclysms';

export const Forge: React.FC = () => {
  const { user, profile } = useAuth();
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upgrade' | 'socket'>('upgrade');
  const [itemSearch, setItemSearch] = useState('');
  const [gemSearch, setGemSearch] = useState('');

  const filteredItems = (profile?.gearInventory || []).filter((item) => {
    const normalized = itemSearch.trim().toLowerCase();
    if (!normalized) return true;
    return (
      item.name.toLowerCase().includes(normalized) ||
      item.type.toLowerCase().includes(normalized) ||
      item.rarity.toLowerCase().includes(normalized) ||
      item.set.toLowerCase().includes(normalized)
    );
  });

  const filteredGems = (profile?.gems || []).filter((gem) => {
    const normalized = gemSearch.trim().toLowerCase();
    if (!normalized) return true;
    return gem.name.toLowerCase().includes(normalized) || gem.type.toLowerCase().includes(normalized);
  });

  const handleUpgrade = async () => {
    if (!user || !profile || !selectedItem) return;
    
    let cost = { ...UPGRADE_COSTS[selectedItem.rarity] };
    
    // Cataclysm: Martes de la Forja (-50% cost)
    const cataclysm = getCurrentCataclysm();
    if (cataclysm?.id === 'Forja') {
      cost.obolos = Math.floor(cost.obolos * 0.5);
      cost.starFragments = Math.floor(cost.starFragments * 0.5);
    }

    if (!cost.next) {
      toast.error("Este objeto ya ha alcanzado su máximo poder divino.");
      return;
    }

    if ((profile.obolos || 0) < cost.obolos || (profile.starFragments || 0) < cost.starFragments) {
      toast.error("No tienes suficientes materiales para la forja.");
      audio.playSFX('error');
      return;
    }

    setIsUpgrading(true);
    audio.playSFX('success'); // Maybe a forge sound later

    try {
      const upgradedItem = upgradeEquipment(selectedItem);
      const newInventory = profile.gearInventory?.map(item => item.id === selectedItem.id ? upgradedItem : item) || [];
      
      // Also update equipped gear if it was equipped
      const newEquipped = { ...profile.equippedGear };
      if (newEquipped.weapon?.id === selectedItem.id) newEquipped.weapon = upgradedItem;
      if (newEquipped.armor?.id === selectedItem.id) newEquipped.armor = upgradedItem;
      if (newEquipped.artifact?.id === selectedItem.id) newEquipped.artifact = upgradedItem;

      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        gearInventory: newInventory,
        equippedGear: newEquipped,
        obolos: (profile.obolos || 0) - cost.obolos,
        starFragments: (profile.starFragments || 0) - cost.starFragments
      });

      setSelectedItem(upgradedItem);
      toast.success(`¡Forja exitosa! ${upgradedItem.name} ha ascendido a ${upgradedItem.rarity}.`);
    } catch (error) {
      console.error("Error upgrading item:", error);
      toast.error("La forja ha fallado.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleSocket = async () => {
    if (!user || !profile || !selectedItem || !selectedGem) return;

    if (!selectedItem.sockets || (selectedItem.gems?.length || 0) >= selectedItem.sockets) {
      toast.error("Este objeto no tiene huecos disponibles.");
      return;
    }

    setIsUpgrading(true);
    audio.playSFX('success');

    try {
      const newGems = [...(selectedItem.gems || []), selectedGem];
      const socketedItem = { ...selectedItem, gems: newGems };

      const newInventory = profile.gearInventory?.map(item => item.id === selectedItem.id ? socketedItem : item) || [];
      const newGemInventory = profile.gems?.filter(g => g.id !== selectedGem.id) || [];

      const newEquipped = { ...profile.equippedGear };
      if (newEquipped.weapon?.id === selectedItem.id) newEquipped.weapon = socketedItem;
      if (newEquipped.armor?.id === selectedItem.id) newEquipped.armor = socketedItem;
      if (newEquipped.artifact?.id === selectedItem.id) newEquipped.artifact = socketedItem;

      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        gearInventory: newInventory,
        equippedGear: newEquipped,
        gems: newGemInventory
      });

      setSelectedItem(socketedItem);
      setSelectedGem(null);
      toast.success(`¡Gema engarzada con éxito!`);
    } catch (error) {
      toast.error("Error al engarzar la gema.");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <Flame className="w-16 h-16 text-orange-500 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 neon-text-accent uppercase tracking-[0.2em]">
          La Forja de Hefesto
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Ascensión de Reliquias</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <Button 
          variant={activeTab === 'upgrade' ? 'default' : 'outline'}
          onClick={() => setActiveTab('upgrade')}
          className={`clip-diagonal ${activeTab === 'upgrade' ? 'bg-orange-600 hover:bg-orange-500' : 'border-orange-500/50 text-orange-500'}`}
        >
          <Hammer className="w-4 h-4 mr-2" /> Ascensión
        </Button>
        <Button 
          variant={activeTab === 'socket' ? 'default' : 'outline'}
          onClick={() => setActiveTab('socket')}
          className={`clip-diagonal ${activeTab === 'socket' ? 'bg-purple-600 hover:bg-purple-500' : 'border-purple-500/50 text-purple-500'}`}
        >
          <GemIcon className="w-4 h-4 mr-2" /> Engarzado
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Station */}
        <Card className={`glass-panel clip-card relative overflow-hidden ${activeTab === 'upgrade' ? 'border-orange-500/30' : 'border-purple-500/30'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b pointer-events-none ${activeTab === 'upgrade' ? 'from-orange-900/20' : 'from-purple-900/20'}`} />
          <CardHeader className={`text-center border-b bg-background/40 ${activeTab === 'upgrade' ? 'border-orange-500/20' : 'border-purple-500/20'}`}>
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase flex items-center justify-center gap-2">
              {activeTab === 'upgrade' ? <><Hammer className="w-5 h-5 text-orange-400" /> El Yunque</> : <><GemIcon className="w-5 h-5 text-purple-400" /> El Engarzador</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-12 flex flex-col items-center gap-8 min-h-[400px]">
            {!selectedItem ? (
              <div className={`flex-1 flex items-center justify-center text-muted-foreground font-mono text-center border border-dashed w-full clip-diagonal p-8 ${activeTab === 'upgrade' ? 'border-orange-500/20' : 'border-purple-500/20'}`}>
                Selecciona un objeto de tu inventario.
              </div>
            ) : activeTab === 'upgrade' ? (
              <div className="w-full space-y-8">
                <div className="flex justify-center items-center gap-8">
                  {/* Current Item */}
                  <div className={`p-4 border-2 clip-diagonal text-center w-40 ${RARITY_COLORS[selectedItem.rarity]}`}>
                    <div className="text-xs font-mono mb-2 uppercase opacity-70">{selectedItem.rarity}</div>
                    <div className="font-bold text-sm mb-2">{selectedItem.name}</div>
                    <div className="space-y-1 text-xs font-mono">
                      {selectedItem.stats.damage && <div>ATK: +{selectedItem.stats.damage}</div>}
                      {selectedItem.stats.health && <div>HP: +{selectedItem.stats.health}</div>}
                      {selectedItem.stats.time && <div>TIME: +{selectedItem.stats.time}s</div>}
                    </div>
                  </div>

                  <ArrowRight className="w-8 h-8 text-orange-500 animate-pulse" />

                  {/* Next Item Preview */}
                  {UPGRADE_COSTS[selectedItem.rarity].next ? (
                    <div className={`p-4 border-2 clip-diagonal text-center w-40 ${RARITY_COLORS[UPGRADE_COSTS[selectedItem.rarity].next!]}`}>
                      <div className="text-xs font-mono mb-2 uppercase opacity-70">{UPGRADE_COSTS[selectedItem.rarity].next}</div>
                      <div className="font-bold text-sm mb-2">???</div>
                      <div className="text-xs font-mono opacity-70">Atributos Mejorados</div>
                    </div>
                  ) : (
                    <div className="p-4 border-2 clip-diagonal text-center w-40 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                      <div className="font-bold text-sm">PODER MÁXIMO</div>
                    </div>
                  )}
                </div>

                {/* Cost & Action */}
                {UPGRADE_COSTS[selectedItem.rarity].next && (() => {
                  const cataclysm = getCurrentCataclysm();
                  const isForgeDay = cataclysm?.id === 'Forja';
                  const baseCost = UPGRADE_COSTS[selectedItem.rarity];
                  const finalObolos = isForgeDay ? Math.floor(baseCost.obolos * 0.5) : baseCost.obolos;
                  const finalStarFragments = isForgeDay ? Math.floor(baseCost.starFragments * 0.5) : baseCost.starFragments;

                  return (
                    <div className="bg-background/50 border border-orange-500/20 p-6 clip-diagonal text-center space-y-4">
                      <h4 className="font-mono text-orange-400 text-xs tracking-widest uppercase">
                        Costo de Ascensión {isForgeDay && <span className="text-green-400 ml-2 animate-pulse">(-50% CATACLISMO)</span>}
                      </h4>
                      <div className="flex justify-center gap-8">
                        <div className="flex flex-col items-center gap-1">
                          <Coins className="w-6 h-6 text-yellow-400" />
                          <span className={`font-mono ${profile?.obolos && profile.obolos >= finalObolos ? 'text-white' : 'text-red-500'}`}>
                            {profile?.obolos || 0} / {finalObolos}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Sparkles className="w-6 h-6 text-cyan-400" />
                          <span className={`font-mono ${profile?.starFragments && profile.starFragments >= finalStarFragments ? 'text-white' : 'text-red-500'}`}>
                            {profile?.starFragments || 0} / {finalStarFragments}
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-orange-600 hover:bg-orange-500 text-white font-display tracking-widest uppercase clip-diagonal"
                        onClick={handleUpgrade}
                        disabled={isUpgrading || (profile?.obolos || 0) < finalObolos || (profile?.starFragments || 0) < finalStarFragments}
                      >
                        {isUpgrading ? 'Forjando...' : 'Forjar Reliquia'}
                      </Button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="w-full space-y-8">
                <div className="flex justify-center items-center gap-8">
                  {/* Current Item */}
                  <div className={`p-4 border-2 clip-diagonal text-center w-48 ${RARITY_COLORS[selectedItem.rarity]}`}>
                    <div className="text-xs font-mono mb-2 uppercase opacity-70">{selectedItem.rarity}</div>
                    <div className="font-bold text-sm mb-2">{selectedItem.name}</div>
                    <div className="space-y-1 text-xs font-mono mb-4">
                      {selectedItem.stats.damage && <div>ATK: +{selectedItem.stats.damage}</div>}
                      {selectedItem.stats.health && <div>HP: +{selectedItem.stats.health}</div>}
                      {selectedItem.stats.time && <div>TIME: +{selectedItem.stats.time}s</div>}
                    </div>
                    
                    {/* Sockets */}
                    <div className="border-t border-current/20 pt-2">
                      <div className="text-[10px] uppercase tracking-widest mb-2">Huecos ({selectedItem.gems?.length || 0}/{selectedItem.sockets || 0})</div>
                      <div className="flex justify-center gap-2">
                        {Array.from({ length: selectedItem.sockets || 0 }).map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full border border-current/50 flex items-center justify-center bg-background/50">
                            {selectedItem.gems && selectedItem.gems[i] ? (
                              <div className={`w-4 h-4 rounded-full ${selectedItem.gems[i].type === 'damage' ? 'bg-red-500' : selectedItem.gems[i].type === 'health' ? 'bg-green-500' : 'bg-blue-500'} shadow-[0_0_5px_currentColor]`} />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-current/20" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-8 h-8 text-purple-500 animate-pulse" />

                  {/* Selected Gem */}
                  {selectedGem ? (
                    <div className={`p-4 border-2 clip-diagonal text-center w-40 border-purple-500/50`}>
                      <div className="text-xs font-mono mb-2 uppercase opacity-70">Gema</div>
                      <div className={`font-bold text-sm mb-2 ${selectedGem.color}`}>{selectedGem.name}</div>
                      <div className="text-xs font-mono opacity-70">+{selectedGem.value} {selectedGem.type === 'damage' ? 'ATK' : selectedGem.type === 'health' ? 'HP' : 'TIME'}</div>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed clip-diagonal text-center w-40 border-purple-500/30 text-muted-foreground">
                      <div className="font-bold text-sm">Selecciona Gema</div>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-display tracking-widest uppercase clip-diagonal"
                  onClick={handleSocket}
                  disabled={isUpgrading || !selectedGem || !selectedItem.sockets || (selectedItem.gems?.length || 0) >= selectedItem.sockets}
                >
                  {isUpgrading ? 'Engarzando...' : 'Engarzar Gema'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Selection */}
        <Card className="glass-panel border-accent/30 clip-card">
          <CardHeader className="border-b border-accent/20 bg-background/40 flex flex-row items-center justify-between">
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase">
              {activeTab === 'upgrade' ? 'Inventario' : 'Gemas'}
            </CardTitle>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-yellow-400 flex items-center gap-1"><Coins className="w-3 h-3"/> {profile?.obolos || 0}</span>
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1"><Sparkles className="w-3 h-3"/> {profile?.starFragments || 0}</span>
            </div>
          </CardHeader>
          <CardContent className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
            {activeTab === 'upgrade' ? (
              (!profile?.gearInventory || profile.gearInventory.length === 0) ? (
                <div className="text-center py-12 text-muted-foreground font-mono">
                  No tienes objetos para forjar.
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    value={itemSearch}
                    onChange={(event) => setItemSearch(event.target.value)}
                    placeholder="Buscar objeto por nombre, tipo, rareza o set"
                    className="bg-background/40 border-accent/30"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 border clip-diagonal cursor-pointer transition-all ${selectedItem?.id === item.id ? 'border-orange-500 bg-orange-500/10' : `border-accent/20 bg-background/60 hover:border-accent ${RARITY_COLORS[item.rarity].split(' ')[0]}`}`}
                      onClick={() => {
                        setSelectedItem(item);
                        audio.playSFX('hover');
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">{item.type}</span>
                        <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">{item.rarity}</span>
                      </div>
                      <h4 className="font-bold text-sm leading-tight mb-2">{item.name}</h4>
                      <div className="space-y-1">
                        {item.stats.damage && <div className="text-xs text-red-400 font-mono">+{item.stats.damage} Daño</div>}
                        {item.stats.health && <div className="text-xs text-green-400 font-mono">+{item.stats.health} Vida</div>}
                        {item.stats.time && <div className="text-xs text-blue-400 font-mono">+{item.stats.time}s Tiempo</div>}
                      </div>
                      {item.sockets && item.sockets > 0 && (
                        <div className="mt-2 text-[10px] font-mono text-purple-400">
                          Huecos: {item.gems?.length || 0}/{item.sockets}
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                </div>
              )
            ) : (
              (!profile?.gems || profile.gems.length === 0) ? (
                <div className="text-center py-12 text-muted-foreground font-mono">
                  No tienes gemas en tu inventario.
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    value={gemSearch}
                    onChange={(event) => setGemSearch(event.target.value)}
                    placeholder="Buscar gema por nombre o tipo"
                    className="bg-background/40 border-accent/30"
                  />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredGems.map((gem) => (
                    <div 
                      key={gem.id} 
                      className={`p-4 border clip-diagonal cursor-pointer transition-all ${selectedGem?.id === gem.id ? 'border-purple-500 bg-purple-500/10' : 'border-purple-500/30 bg-background/60 hover:border-purple-500'}`}
                      onClick={() => {
                        setSelectedGem(gem);
                        audio.playSFX('hover');
                      }}
                    >
                      <h4 className={`font-bold text-sm leading-tight mb-2 ${gem.color}`}>{gem.name}</h4>
                      <div className="text-xs font-mono text-muted-foreground">
                        +{gem.value} {gem.type === 'damage' ? 'Daño' : gem.type === 'health' ? 'Vida' : 'Tiempo'}
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
