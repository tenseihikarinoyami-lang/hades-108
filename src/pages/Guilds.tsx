import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Shield, Swords, Trophy, Plus } from 'lucide-react';
import { audio } from '@/lib/audio';
import { doc, updateDoc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Guild {
  id: string;
  name: string;
  faction: string;
  leaderId: string;
  members: string[];
  score: number;
  nodes?: string[];
}

interface ResourceNode {
  id: string;
  name: string;
  resource: string;
  ownerGuildId: string | null;
  ownerGuildName: string | null;
  defenseScore: number;
}

export const Guilds: React.FC = () => {
  const { user, profile } = useAuth();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [newGuildName, setNewGuildName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<ResourceNode[]>([]);

  useEffect(() => {
    fetchGuilds();
    fetchNodes();
  }, [profile]);

  const fetchNodes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'guildNodes'));
      const fetchedNodes: ResourceNode[] = [];
      querySnapshot.forEach((doc) => {
        fetchedNodes.push({ id: doc.id, ...doc.data() } as ResourceNode);
      });
      
      if (fetchedNodes.length === 0) {
        // Initialize nodes if they don't exist
        const initialNodes: ResourceNode[] = [
          { id: 'node_1', name: 'Mina de Óbolos', resource: 'Obolos', ownerGuildId: null, ownerGuildName: null, defenseScore: 0 },
          { id: 'node_2', name: 'Cantera de Estrellas', resource: 'Star Fragments', ownerGuildId: null, ownerGuildName: null, defenseScore: 0 },
          { id: 'node_3', name: 'Forja de Almas', resource: 'Soul Essence', ownerGuildId: null, ownerGuildName: null, defenseScore: 0 }
        ];
        setNodes(initialNodes);
      } else {
        setNodes(fetchedNodes);
      }
    } catch (error) {
      console.error("Error fetching nodes:", error);
    }
  };

  const fetchGuilds = async () => {
    if (!profile?.faction) {
      setIsLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'guilds'), where('faction', '==', profile.faction));
      const querySnapshot = await getDocs(q);
      const fetchedGuilds: Guild[] = [];
      let foundMyGuild = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Guild;
        fetchedGuilds.push(data);
        if (profile.guildId === data.id) {
          foundMyGuild = data;
        }
      });

      setGuilds(fetchedGuilds.sort((a, b) => b.score - a.score));
      setMyGuild(foundMyGuild);
    } catch (error) {
      console.error("Error fetching guilds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGuild = async () => {
    if (!user || !profile || !profile.faction || myGuild) return;
    if (newGuildName.trim().length < 3) {
      toast.error("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    if ((profile.obolos || 0) < 5000) {
      toast.error("Necesitas 5000 Óbolos para fundar un Escuadrón.");
      return;
    }

    audio.playSFX('success');
    const newGuildId = `guild_${Date.now()}`;
    const newGuild: Guild = {
      id: newGuildId,
      name: newGuildName.trim(),
      faction: profile.faction,
      leaderId: user.uid,
      members: [user.uid],
      score: 0
    };

    try {
      await setDoc(doc(db, 'guilds', newGuildId), newGuild);
      await updateDoc(doc(db, 'users', user.uid), {
        guildId: newGuildId,
        obolos: (profile.obolos || 0) - 5000
      });
      setNewGuildName('');
      fetchGuilds();
      toast.success("¡Escuadrón fundado con éxito!");
    } catch (error) {
      toast.error("Error al crear el Escuadrón.");
    }
  };

  const handleJoinGuild = async (guildId: string) => {
    if (!user || !profile || myGuild) return;

    audio.playSFX('click');
    try {
      const guildRef = doc(db, 'guilds', guildId);
      const guildSnap = await getDoc(guildRef);
      
      if (guildSnap.exists()) {
        const guildData = guildSnap.data() as Guild;
        if (guildData.members.length >= 10) {
          toast.error("Este Escuadrón está lleno (Máx 10).");
          return;
        }

        await updateDoc(guildRef, {
          members: [...guildData.members, user.uid]
        });
        await updateDoc(doc(db, 'users', user.uid), {
          guildId: guildId
        });
        
        fetchGuilds();
        toast.success(`Te has unido a ${guildData.name}`);
      }
    } catch (error) {
      toast.error("Error al unirse.");
    }
  };

  const handleLeaveGuild = async () => {
    if (!user || !profile || !myGuild) return;

    audio.playSFX('damage');
    try {
      const guildRef = doc(db, 'guilds', myGuild.id);
      const newMembers = myGuild.members.filter(id => id !== user.uid);

      if (newMembers.length === 0) {
        // Delete guild if empty
        // await deleteDoc(guildRef); // Need deleteDoc imported
      } else {
        await updateDoc(guildRef, {
          members: newMembers,
          leaderId: myGuild.leaderId === user.uid ? newMembers[0] : myGuild.leaderId // Pass leadership if leader leaves
        });
      }

      await updateDoc(doc(db, 'users', user.uid), {
        guildId: null
      });
      
      fetchGuilds();
      toast.success("Has abandonado el Escuadrón.");
    } catch (error) {
      toast.error("Error al abandonar.");
    }
  };

  const handleConquerNode = async (nodeId: string) => {
    if (!user || !profile || !myGuild) return;
    
    audio.playSFX('success');
    try {
      const nodeRef = doc(db, 'guildNodes', nodeId);
      const nodeSnap = await getDoc(nodeRef);
      const nodeData = nodeSnap.exists() ? nodeSnap.data() as ResourceNode : null;

      if (nodeData && nodeData.ownerGuildId === myGuild.id) {
        toast.info("Tu Escuadrón ya controla este nodo.");
        return;
      }

      // Attack logic: Guild score vs Defense score
      const attackPower = myGuild.score;
      const defensePower = nodeData?.defenseScore || 0;

      if (attackPower > defensePower) {
        await setDoc(nodeRef, {
          ownerGuildId: myGuild.id,
          ownerGuildName: myGuild.name,
          defenseScore: attackPower,
          lastConquered: new Date()
        }, { merge: true });
        
        fetchNodes();
        toast.success(`¡${myGuild.name} ha conquistado ${nodeData?.name || 'el nodo'}!`);
      } else {
        toast.error("Tu Escuadrón no tiene suficiente poder para conquistar este nodo.");
      }
    } catch (error) {
      toast.error("Error en la conquista.");
    }
  };

  if (!profile?.faction) {
    return (
      <div className="max-w-4xl mx-auto text-center mt-20">
        <Shield className="w-24 h-24 text-muted-foreground mx-auto mb-8" />
        <h2 className="text-3xl font-display text-white uppercase tracking-widest">Requiere Facción</h2>
        <p className="text-muted-foreground font-mono mt-4">Debes unirte a Wyvern, Griffon o Garuda en la Guerra Santa para acceder a los Escuadrones.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative z-10">
      <div className="text-center space-y-4 mb-12">
        <Users className="w-16 h-16 text-emerald-500 mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 neon-text-accent uppercase tracking-[0.2em]">
          Escuadrones
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">Sub-facciones de {profile.faction}</p>
      </div>

      {myGuild ? (
        <Card className="glass-panel border-emerald-500/30 clip-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none" />
          <CardHeader className="border-b border-emerald-500/20 bg-background/40">
            <CardTitle className="font-display text-2xl text-white tracking-widest uppercase flex items-center justify-between">
              <span>{myGuild.name}</span>
              <span className="text-sm font-mono text-emerald-400 flex items-center gap-2"><Trophy className="w-4 h-4"/> Nivel de Escuadrón: {Math.floor(myGuild.score / 1000) + 1}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-emerald-500/20 bg-background/40 clip-diagonal text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Miembros</p>
                <p className="text-2xl font-bold text-white">{myGuild.members.length} / 10</p>
              </div>
              <div className="p-4 border border-emerald-500/20 bg-background/40 clip-diagonal text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Poder Total</p>
                <p className="text-2xl font-bold text-emerald-400">{myGuild.score}</p>
              </div>
              <div className="p-4 border border-emerald-500/20 bg-background/40 clip-diagonal text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Rango en {profile.faction}</p>
                <p className="text-2xl font-bold text-yellow-400">#{guilds.findIndex(g => g.id === myGuild.id) + 1}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleLeaveGuild} variant="destructive" className="clip-diagonal uppercase tracking-widest text-xs">
                Abandonar Escuadrón
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-panel border-accent/30 clip-card">
          <CardHeader className="border-b border-accent/20 bg-background/40">
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase">
              Fundar Escuadrón
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <input 
                type="text" 
                value={newGuildName}
                onChange={(e) => setNewGuildName(e.target.value)}
                placeholder="Nombre del Escuadrón..."
                className="flex-1 bg-background/50 border border-accent/30 p-3 text-white font-mono focus:outline-none focus:border-accent clip-diagonal"
              />
              <Button 
                onClick={handleCreateGuild}
                className="bg-emerald-600 hover:bg-emerald-500 text-white clip-diagonal uppercase tracking-widest"
              >
                <Plus className="w-4 h-4 mr-2" /> Fundar (5000 Óbolos)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-display text-white uppercase tracking-widest border-b border-accent/20 pb-2 flex items-center gap-2">
          <Map className="w-5 h-5 text-orange-500" /> Nodos de Recursos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nodes.map((node) => (
            <Card key={node.id} className="glass-panel border-orange-500/20 clip-card overflow-hidden">
              <CardHeader className="p-4 bg-orange-500/10 border-b border-orange-500/20">
                <CardTitle className="text-sm font-display text-white uppercase tracking-widest">{node.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-muted-foreground">Recurso:</span>
                  <span className="text-orange-400">{node.resource}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-muted-foreground">Dueño:</span>
                  <span className={node.ownerGuildName ? "text-white" : "text-muted-foreground italic"}>
                    {node.ownerGuildName || 'Nadie'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-muted-foreground">Defensa:</span>
                  <span className="text-red-400">{node.defenseScore}</span>
                </div>
                <Button 
                  onClick={() => handleConquerNode(node.id)}
                  className="w-full clip-diagonal text-[10px] uppercase tracking-widest bg-orange-600 hover:bg-orange-500"
                  disabled={!myGuild}
                >
                  Conquistar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-display text-white uppercase tracking-widest border-b border-accent/20 pb-2">
          Escuadrones de {profile.faction}
        </h3>
        {guilds.length === 0 ? (
          <p className="text-muted-foreground font-mono text-center py-8">No hay escuadrones en esta facción. ¡Sé el primero en fundar uno!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guilds.map((guild, index) => (
              <div key={guild.id} className="p-4 border border-accent/20 bg-background/40 clip-diagonal flex justify-between items-center">
                <div>
                  <p className="font-bold text-white text-lg flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">#{index + 1}</span> {guild.name}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">Miembros: {guild.members.length}/10 | Poder: {guild.score}</p>
                </div>
                {!myGuild && guild.members.length < 10 && (
                  <Button 
                    onClick={() => handleJoinGuild(guild.id)}
                    variant="outline"
                    className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 clip-diagonal text-xs uppercase"
                  >
                    Unirse
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
