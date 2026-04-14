import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store as StoreIcon, Palette, Hexagon, Coins, Check } from 'lucide-react';
import { toast } from 'sonner';
import { audio } from '@/lib/audio';

const STORE_ITEMS = [
  { id: 'frame_fire', type: 'frame', name: 'Fuego Negro', description: 'Marco envuelto en las llamas del inframundo.', price: 50, icon: <Hexagon className="w-8 h-8 text-orange-500" /> },
  { id: 'frame_ice', type: 'frame', name: 'Hielo Cocytos', description: 'Marco congelado por los vientos del Cocytos.', price: 50, icon: <Hexagon className="w-8 h-8 text-cyan-400" /> },
  { id: 'frame_purple', type: 'frame', name: 'Rayo Púrpura', description: 'Marco electrificado con energía oscura.', price: 50, icon: <Hexagon className="w-8 h-8 text-purple-500" /> },
  { id: 'color_gold', type: 'color', name: 'Dorado Divino', description: 'Tu nombre brillará en dorado en el chat.', price: 30, icon: <Palette className="w-8 h-8 text-yellow-400" />, value: 'text-yellow-400' },
  { id: 'color_red', type: 'color', name: 'Rojo Sangre', description: 'Tu nombre se teñirá del color de la batalla.', price: 30, icon: <Palette className="w-8 h-8 text-red-500" />, value: 'text-red-500' },
];

export const Store: React.FC = () => {
  const { user, profile } = useAuth();

  const handlePurchase = async (item: any) => {
    if (!user || !profile) return;
    
    if ((profile.obolos || 0) < item.price) {
      audio.playSFX('error');
      toast.error("Óbolos insuficientes.", {
        description: "Gana más óbolos completando misiones y jugando trivias."
      });
      return;
    }

    audio.playSFX('success');
    try {
      const docRef = doc(db, 'users', user.uid);
      const newInventory = [...(profile.inventory || []), item.id];
      
      await updateDoc(docRef, {
        obolos: increment(-item.price),
        inventory: newInventory
      });
      
      toast.success(`¡Has adquirido: ${item.name}!`, {
        style: { background: 'rgba(0, 240, 255, 0.1)', border: '1px solid #00f0ff', color: '#fff' }
      });
    } catch (error) {
      console.error("Error purchasing item:", error);
    }
  };

  const handleEquip = async (item: any) => {
    if (!user || !profile) return;
    audio.playSFX('click');
    
    try {
      const docRef = doc(db, 'users', user.uid);
      if (item.type === 'frame') {
        await updateDoc(docRef, { activeFrame: item.id });
      } else if (item.type === 'color') {
        await updateDoc(docRef, { activeColor: item.value });
      }
      toast.success(`${item.name} equipado.`);
    } catch (error) {
      console.error("Error equipping item:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <StoreIcon className="w-16 h-16 text-accent mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Tienda Sapuris
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Intercambia tus Óbolos por reliquias del Inframundo</p>
        
        <div className="inline-flex items-center gap-3 bg-background/80 border border-accent/30 px-6 py-3 clip-diagonal mt-4 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
          <Coins className="w-6 h-6 text-yellow-400" />
          <span className="font-mono text-xl text-white tracking-widest">ÓBOLOS: <span className="text-yellow-400 font-bold">{profile?.obolos || 0}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STORE_ITEMS.map((item) => {
          const isOwned = profile?.inventory?.includes(item.id);
          const isEquipped = profile?.activeFrame === item.id || profile?.activeColor === item.value;

          return (
            <Card key={item.id} className="glass-panel border-accent/20 hover:border-accent transition-all duration-300 clip-card group" onMouseEnter={() => audio.playSFX('hover')}>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 p-4 bg-background/50 rounded-full w-20 h-20 flex items-center justify-center border border-accent/20 group-hover:border-accent transition-colors">
                  {item.icon}
                </div>
                <CardTitle className="font-display text-xl text-white uppercase tracking-wider">{item.name}</CardTitle>
                <CardDescription className="text-xs font-mono h-10">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 pt-4">
                {!isOwned && (
                  <div className="flex items-center gap-2 text-yellow-400 font-mono font-bold text-lg">
                    <Coins className="w-4 h-4" /> {item.price}
                  </div>
                )}
                
                {isOwned ? (
                  <Button 
                    variant={isEquipped ? "default" : "outline"}
                    className={`w-full clip-diagonal font-mono tracking-widest uppercase ${isEquipped ? 'bg-accent/20 text-accent border-accent/50 cursor-default' : 'border-accent/30 text-white hover:bg-accent/10 hover:border-accent'}`}
                    onClick={() => !isEquipped && handleEquip(item)}
                  >
                    {isEquipped ? <><Check className="w-4 h-4 mr-2" /> Equipado</> : 'Equipar'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full clip-diagonal bg-accent/20 hover:bg-accent/40 text-accent border border-accent/50 transition-all hover:neon-border font-mono tracking-widest uppercase"
                    onClick={() => handlePurchase(item)}
                  >
                    Comprar
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
