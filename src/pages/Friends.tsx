import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Check, X, Search, MessageSquare, Gamepad2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { audio } from '@/lib/audio';
import { getFriendsList, getPendingRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, searchUserByName, Friendship } from '@/lib/friends';
import { motion } from 'framer-motion';

export const Friends: React.FC = () => {
  const { user, profile } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  useEffect(() => {
    if (!user) return;

    const unsubscribeFriends = getFriendsList(user.uid, setFriends);
    const unsubscribeRequests = getPendingRequests(user.uid, setPendingRequests);

    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
    };
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    audio.playSFX('click');
    const results = await searchUserByName(searchQuery);
    setSearchResults(results);
  };

  const handleAddFriend = async (targetUserId: string, targetName: string, targetPhoto: string) => {
    if (!user) return;
    audio.playSFX('click');
    const result = await sendFriendRequest(
      user.uid,
      profile?.specterName || profile?.displayName || 'Espectro',
      profile?.photoURL || '',
      targetUserId,
      targetName,
      targetPhoto
    );
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    if (!user) return;
    audio.playSFX('click');
    await acceptFriendRequest(
      friendshipId,
      user.uid,
      profile?.specterName || profile?.displayName || 'Espectro',
      profile?.photoURL || ''
    );
    toast.success('Solicitud aceptada');
  };

  const handleRejectRequest = async (friendshipId: string) => {
    audio.playSFX('click');
    await rejectFriendRequest(friendshipId);
    toast.info('Solicitud rechazada');
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    audio.playSFX('click');
    await removeFriend(friendshipId);
    toast.success('Amigo eliminado');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10">
      <div className="text-center space-y-4 mb-8">
        <Users className="w-16 h-16 text-accent mx-auto animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent neon-text-accent uppercase tracking-[0.2em]">
          Vínculos del Inframundo
        </h1>
        <p className="text-muted-foreground font-sans tracking-[0.2em] uppercase text-sm">
          Gestiona tus amistades y juega junto a otros espectros
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-background/50 p-1 border border-accent/20 clip-diagonal max-w-md mx-auto">
        <Button
          variant="ghost"
          className={`flex-1 clip-diagonal rounded-none px-4 font-mono tracking-widest uppercase text-xs transition-all ${activeTab === 'friends' ? 'bg-accent/20 text-accent border border-accent/50' : 'text-muted-foreground hover:text-white'}`}
          onClick={() => { audio.playSFX('click'); setActiveTab('friends'); }}
        >
          <Users className="w-4 h-4 mr-1" /> Amigos ({friends.length})
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 clip-diagonal rounded-none px-4 font-mono tracking-widest uppercase text-xs transition-all ${activeTab === 'requests' ? 'bg-accent/20 text-accent border border-accent/50' : 'text-muted-foreground hover:text-white'}`}
          onClick={() => { audio.playSFX('click'); setActiveTab('requests'); }}
        >
          <UserPlus className="w-4 h-4 mr-1" /> Solicitudes ({pendingRequests.length})
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 clip-diagonal rounded-none px-4 font-mono tracking-widest uppercase text-xs transition-all ${activeTab === 'search' ? 'bg-accent/20 text-accent border border-accent/50' : 'text-muted-foreground hover:text-white'}`}
          onClick={() => { audio.playSFX('click'); setActiveTab('search'); }}
        >
          <Search className="w-4 h-4 mr-1" /> Buscar
        </Button>
      </div>

      {/* LISTA DE AMIGOS */}
      {activeTab === 'friends' && (
        <Card className="glass-panel border-accent/30 clip-card">
          <CardHeader className="border-b border-accent/20 bg-background/40">
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase">Tu Lista de Amigos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {friends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono border border-dashed border-accent/20 clip-diagonal">
                No tienes amigos aún. ¡Busca espectros y envía solicitudes!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-4 bg-background/50 border border-accent/20 rounded-sm clip-diagonal"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-accent/50">
                        <AvatarImage src={friend.friendPhoto} />
                        <AvatarFallback className="bg-secondary text-accent text-xs">
                          {friend.friendName?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-bold text-white">{friend.friendName}</div>
                        <div className="text-[10px] text-green-400 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-400" /> Online
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-accent">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
                        <Gamepad2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-red-400" onClick={() => handleRemoveFriend(friend.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SOLICITUDES PENDIENTES */}
      {activeTab === 'requests' && (
        <Card className="glass-panel border-accent/30 clip-card">
          <CardHeader className="border-b border-accent/20 bg-background/40">
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase">Solicitudes Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono border border-dashed border-accent/20 clip-diagonal">
                No tienes solicitudes pendientes
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-background/50 border border-accent/20 rounded-sm clip-diagonal">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-accent/50">
                        <AvatarImage src={request.friendPhoto} />
                        <AvatarFallback className="bg-secondary text-accent text-xs">
                          {request.friendName?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-bold text-white">{request.friendName}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="clip-diagonal border-green-500/50 text-green-400 hover:bg-green-500/20" onClick={() => handleAcceptRequest(request.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="clip-diagonal border-red-500/50 text-red-400 hover:bg-red-500/20" onClick={() => handleRejectRequest(request.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* BÚSQUEDA DE USUARIOS */}
      {activeTab === 'search' && (
        <Card className="glass-panel border-accent/30 clip-card">
          <CardHeader className="border-b border-accent/20 bg-background/40">
            <CardTitle className="font-display text-xl text-white tracking-widest uppercase">Buscar Espectros</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre del espectro..."
                className="flex-1 bg-background border-accent/50"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} className="clip-diagonal bg-accent hover:bg-accent/80 text-black">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div key={result.uid} className="flex items-center justify-between p-4 bg-background/50 border border-accent/20 rounded-sm clip-diagonal">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-accent/50">
                        <AvatarImage src={result.photoURL} />
                        <AvatarFallback className="bg-secondary text-accent text-xs">
                          {result.displayName?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-bold text-white">{result.displayName}</div>
                    </div>
                    <Button
                      size="sm"
                      className="clip-diagonal bg-accent/20 text-accent hover:bg-accent/30 border border-accent/50"
                      onClick={() => handleAddFriend(result.uid, result.displayName, result.photoURL)}
                      disabled={result.uid === user?.uid}
                    >
                      <UserPlus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
