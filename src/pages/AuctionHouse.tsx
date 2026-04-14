import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, increment, serverTimestamp, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Store, Tag, Coins, Clock, User, Shield, Search, Filter } from 'lucide-react';
import { audio } from '@/lib/audio';
import { Equipment, RARITY_COLORS } from '@/lib/rpg';
import { motion, AnimatePresence } from 'motion/react';

interface AuctionListing {
  id: string;
  sellerId: string;
  sellerName: string;
  item: Equipment;
  price: number;
  createdAt: any;
}

export const AuctionHouse: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [isListing, setIsListing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [price, setPrice] = useState(1000);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const q = query(collection(db, 'auction_listings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: AuctionListing[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as AuctionListing);
      });
      setListings(items);
    });
    return () => unsub();
  }, []);

  const handleList = async () => {
    if (!user || !profile || !selectedItem) return;
    if (price < 100) {
      toast.error("El precio mínimo es 100 Óbolos.");
      return;
    }

    setIsListing(true);
    audio.playSFX('click');
    try {
      // Remove from inventory
      const newInventory = profile.gearInventory?.filter(i => i.id !== selectedItem.id) || [];
      await updateProfile({ gearInventory: newInventory });

      // Add to auction
      await addDoc(collection(db, 'auction_listings'), {
        sellerId: user.uid,
        sellerName: profile.specterName || profile.displayName || 'Espectro',
        item: selectedItem,
        price: price,
        createdAt: serverTimestamp()
      });

      toast.success("Objeto listado en la subasta.");
      setSelectedItem(null);
    } catch (error) {
      toast.error("Error al listar el objeto.");
    } finally {
      setIsListing(false);
    }
  };

  const handleBuy = async (listing: AuctionListing) => {
    if (!user || !profile) return;
    if (listing.sellerId === user.uid) {
      toast.error("No puedes comprar tu propio objeto.");
      return;
    }
    if ((profile.obolos || 0) < listing.price) {
      toast.error("Óbolos insuficientes.");
      return;
    }

    audio.playSFX('success');
    try {
      // Deduct from buyer, add item
      await updateProfile({
        obolos: (profile.obolos || 0) - listing.price,
        gearInventory: [...(profile.gearInventory || []), listing.item]
      });

      // Add obolos to seller (offline update)
      const sellerRef = doc(db, 'users', listing.sellerId);
      await updateDoc(sellerRef, {
        obolos: increment(listing.price)
      });

      // Delete listing
      await deleteDoc(doc(db, 'auction_listings', listing.id));

      toast.success(`¡Has comprado ${listing.item.name}!`);
    } catch (error) {
      toast.error("Error al procesar la compra.");
    }
  };

  const handleCancel = async (listing: AuctionListing) => {
    if (!user || !profile || listing.sellerId !== user.uid) return;

    audio.playSFX('click');
    try {
      // Return to inventory
      await updateProfile({
        gearInventory: [...(profile.gearInventory || []), listing.item]
      });

      // Delete listing
      await deleteDoc(doc(db, 'auction_listings', listing.id));

      toast.success("Subasta cancelada.");
    } catch (error) {
      toast.error("Error al cancelar.");
    }
  };

  const filteredListings = listings.filter(l => {
    if (filter === 'all') return true;
    return l.item.rarity === filter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <Store className="w-16 h-16 text-yellow-500 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-white to-yellow-400 neon-text-accent uppercase tracking-[0.2em]">
          Mercado de Almas
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Subasta de Equipo Legendario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sell Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-panel border-accent/30 clip-card">
            <CardHeader className="border-b border-accent/10">
              <CardTitle className="text-sm uppercase tracking-widest text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent" /> Vender Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase">Seleccionar Objeto</label>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                  {profile?.gearInventory?.length === 0 ? (
                    <p className="text-[10px] text-center text-muted-foreground py-4">No tienes equipo para vender.</p>
                  ) : (
                    profile?.gearInventory?.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-2 border cursor-pointer transition-all text-[10px] uppercase font-mono ${selectedItem?.id === item.id ? 'border-accent bg-accent/20' : 'border-accent/10 hover:border-accent/30 bg-background/40'}`}
                      >
                        <p className={RARITY_COLORS[item.rarity].split(' ')[0]}>{item.name}</p>
                        <p className="text-muted-foreground">{item.rarity} - {item.type}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedItem && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t border-accent/10">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">Precio (Óbolos)</label>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value))}
                      className="w-full bg-background border border-accent/20 p-2 text-sm font-mono text-accent outline-none focus:border-accent"
                    />
                  </div>
                  <Button 
                    onClick={handleList}
                    disabled={isListing}
                    className="w-full bg-accent hover:bg-accent/80 text-white clip-diagonal text-xs uppercase tracking-widest"
                  >
                    Listar Objeto
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Listings Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-background/40 border border-accent/20 p-1 rounded-sm">
              <Filter className="w-4 h-4 text-muted-foreground ml-2" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-[10px] font-mono text-white outline-none p-2 uppercase"
              >
                <option value="all">Todas las Rarezas</option>
                <option value="divino">Divino</option>
                <option value="espectro">Espectro</option>
                <option value="oro">Oro</option>
                <option value="plata">Plata</option>
                <option value="bronce">Bronce</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-yellow-500 font-mono text-sm">
              <Coins className="w-4 h-4" /> {profile?.obolos || 0}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredListings.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
                  <p className="text-muted-foreground font-mono uppercase tracking-widest">No hay subastas activas</p>
                </div>
              ) : (
                filteredListings.map((listing) => (
                  <motion.div 
                    key={listing.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="glass-panel border-accent/20 hover:border-accent/50 transition-all clip-card overflow-hidden">
                      <CardContent className="p-4 flex gap-4">
                        <div className={`w-16 h-16 shrink-0 border-2 flex items-center justify-center bg-accent/5 clip-diagonal ${RARITY_COLORS[listing.item.rarity]}`}>
                          <Shield className="w-8 h-8" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-bold uppercase tracking-widest ${RARITY_COLORS[listing.item.rarity].split(' ')[0]}`}>
                              {listing.item.name}
                            </h4>
                            <div className="flex items-center gap-1 text-yellow-500 font-mono text-xs">
                              <Coins className="w-3 h-3" /> {listing.price}
                            </div>
                          </div>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase">
                            Vendedor: {listing.sellerName}
                          </p>
                          <div className="flex items-center gap-4 pt-2">
                            {listing.sellerId === user?.uid ? (
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-7 text-[10px] clip-diagonal flex-1"
                                onClick={() => handleCancel(listing)}
                              >
                                Cancelar
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                className="h-7 text-[10px] bg-yellow-600 hover:bg-yellow-500 text-white clip-diagonal flex-1"
                                onClick={() => handleBuy(listing)}
                              >
                                Comprar
                              </Button>
                            )}
                            <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                              <Clock className="w-3 h-3" /> 24h
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
