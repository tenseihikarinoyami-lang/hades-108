import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Radio, Terminal, Lock, Globe, Search, User } from 'lucide-react';
import { format } from 'date-fns';
import { audio } from '@/lib/audio';
import { incrementStat, updateMissionProgress, checkAndAwardBadges } from '@/lib/engine';
import { UserProfile } from '@/context/AuthContext';

interface Message {
  id: string;
  text: string;
  uid: string;
  specterName: string;
  photoURL: string;
  createdAt: any;
}

export const Chat: React.FC = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'private'>('global');
  const [privateChatUser, setPrivateChatUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const q = query(
        collection(db, 'users'),
        where('specterName', '>=', searchQuery),
        where('specterName', '<=', searchQuery + '\uf8ff'),
        limit(5)
      );
      const snap = await getDocs(q);
      const results: UserProfile[] = [];
      snap.forEach(doc => {
        if (doc.id !== user?.uid) {
          results.push(doc.data() as UserProfile);
        }
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  useEffect(() => {
    // Global messages listener
    if (activeTab === 'global') {
      const q = query(
        collection(db, 'messages'),
        orderBy('createdAt', 'asc'),
        limit(100)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs);
        // Scroll to bottom
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      }, (error) => {
        console.error("Error fetching messages:", error);
      });

      return () => unsubscribe();
    }

    // Private messages listener
    if (activeTab === 'private' && user && privateChatUser) {
      const chatId = [user.uid, privateChatUser.uid].sort().join('_');
      const q = query(
        collection(db, 'private_messages'),
        where('chatId', '==', chatId),
        limit(100)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: Message[] = snapshot.docs
          .map((messageDoc) => {
            const data = messageDoc.data();
            return {
              id: messageDoc.id,
              text: data.text,
              uid: data.uid,
              specterName: data.specterName || 'Espectro',
              photoURL: data.photoURL || '',
              createdAt: data.createdAt
            } as Message;
          })
          .sort((a, b) => {
            const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return timeA - timeB;
          });
        setMessages(msgs);
        // Scroll to bottom
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      }, (error) => {
        console.error("Error fetching private messages:", error);
      });

      return () => unsubscribe();
    }
  }, [activeTab, privateChatUser, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !profile) return;

    audio.playSFX('click');
    const msgText = newMessage;
    setNewMessage('');

    try {
      if (activeTab === 'global') {
        await addDoc(collection(db, 'messages'), {
          text: msgText,
          uid: user.uid,
          specterName: profile.specterName || profile.displayName || 'Espectro Desconocido',
          photoURL: profile.photoURL || user.photoURL || '',
          createdAt: serverTimestamp()
        });
      } else if (activeTab === 'private' && privateChatUser) {
        const chatId = [user.uid, privateChatUser.uid].sort().join('_');
        await addDoc(collection(db, 'private_messages'), {
          chatId,
          text: msgText,
          uid: user.uid,
          senderId: user.uid,
          receiverId: privateChatUser.uid,
          specterName: profile.specterName || profile.displayName || 'Espectro Desconocido',
          photoURL: profile.photoURL || user.photoURL || '',
          createdAt: serverTimestamp()
        });
      }

      // Update stats and missions
      await incrementStat(user.uid, 'messagesSent');
      await updateMissionProgress(user.uid, profile, 'daily_messages');
      await checkAndAwardBadges(user.uid, profile);

    } catch (error) {
      audio.playSFX('error');
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-10rem)] flex flex-col relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Radio className="w-8 h-8 text-accent animate-pulse" />
          <div>
            <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-white tracking-[0.2em] uppercase">
              Red Cocytos
            </h1>
            <p className="text-xs text-accent/70 font-mono tracking-widest uppercase">Frecuencia Encriptada del Inframundo</p>
          </div>
        </div>

        <div className="flex gap-2 bg-background/50 p-1 border border-accent/20 clip-diagonal">
          <Button
            variant="ghost"
            className={`clip-diagonal rounded-none px-6 font-mono tracking-widest uppercase text-xs transition-all ${activeTab === 'global' ? 'bg-accent/20 text-accent border border-accent/50' : 'text-muted-foreground hover:text-white'}`}
            onClick={() => { audio.playSFX('click'); setActiveTab('global'); }}
            onMouseEnter={() => audio.playSFX('hover')}
          >
            <Globe className="w-4 h-4 mr-2" /> Global
          </Button>
          <Button
            variant="ghost"
            className={`clip-diagonal rounded-none px-6 font-mono tracking-widest uppercase text-xs transition-all ${activeTab === 'private' ? 'bg-primary/20 text-primary border border-primary/50' : 'text-muted-foreground hover:text-white'}`}
            onClick={() => { audio.playSFX('click'); setActiveTab('private'); }}
            onMouseEnter={() => audio.playSFX('hover')}
          >
            <Lock className="w-4 h-4 mr-2" /> Privado
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col glass-panel border-accent/30 overflow-hidden relative clip-card">
        {/* Scanline effect overlay */}
        <div className="absolute inset-0 scanline opacity-30 pointer-events-none z-20" />

        <CardHeader className="border-b border-accent/20 bg-background/40 py-3 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-accent">
              <Terminal className="w-4 h-4" />
              <span>ESTADO: {activeTab === 'global' ? 'CONECTADO A RED PÚBLICA' : (privateChatUser ? `CONECTADO CON ${privateChatUser.specterName?.toUpperCase()}` : 'ENCRIPTANDO CANAL...')}</span>
            </div>
            <div className="text-xs font-mono text-primary animate-pulse">
              {activeTab === 'global' ? 'RECIBIENDO TRANSMISIÓN...' : (privateChatUser ? 'CANAL SEGURO ESTABLECIDO' : 'ESPERANDO CONEXIÓN SEGURA')}
            </div>
          </div>
        </CardHeader>

        {activeTab === 'global' || (activeTab === 'private' && privateChatUser) ? (
          <>
            <ScrollArea className="flex-1 p-6 z-10" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((msg) => {
                  const isMe = msg.uid === user?.uid;
                  return (
                    <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-12 h-12 border-2 border-accent/50 clip-hex bg-background/80 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                        <AvatarImage src={msg.photoURL} className="object-cover" />
                        <AvatarFallback className="bg-secondary text-accent font-display text-xl">
                          {msg.specterName?.[0] || 'E'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-mono text-accent/80 tracking-wider">
                            {isMe ? 'TÚ' : msg.specterName.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            [SYS.TIME: {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'HH:mm:ss') : '00:00:00'}]
                          </span>
                        </div>
                        <div className={`p-4 font-sans text-sm tracking-wide relative group ${isMe
                            ? 'bg-primary/20 text-white border-r-2 border-primary clip-diagonal'
                            : 'bg-secondary/40 text-white border-l-2 border-accent clip-diagonal'
                          }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-accent/20 bg-background/60 z-30">
              <form onSubmit={handleSend} className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-accent font-mono text-sm">{'>'}</div>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ingresa comando de transmisión..."
                    className="bg-background/40 border-accent/30 focus:border-accent text-white font-mono pl-8 clip-diagonal"
                    disabled={!user}
                  />
                </div>
                <Button type="submit" disabled={!user || !newMessage.trim()} className="clip-diagonal bg-accent/20 hover:bg-accent/40 text-accent border border-accent/50 transition-all hover:neon-border px-8" onMouseEnter={() => audio.playSFX('hover')}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col p-6 z-10 space-y-6">
            <div className="text-center space-y-2 mb-6">
              <Lock className="w-12 h-12 text-primary/50 mx-auto mb-2" />
              <h3 className="text-xl font-display text-white tracking-widest uppercase">Transmisión Privada</h3>
              <p className="text-sm text-muted-foreground font-mono">Busca a un Espectro para establecer un canal seguro.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto w-full">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre del Espectro..."
                className="bg-background/40 border-accent/30 focus:border-accent text-white font-mono clip-diagonal"
              />
              <Button type="submit" className="clip-diagonal bg-accent/20 hover:bg-accent/40 text-accent border border-accent/50" onMouseEnter={() => audio.playSFX('hover')}>
                <Search className="w-4 h-4" />
              </Button>
            </form>

            <div className="max-w-md mx-auto w-full space-y-2">
              {searchResults.map((result) => (
                <div
                  key={result.uid}
                  className="flex items-center gap-4 p-3 bg-background/40 border border-accent/20 hover:border-accent/50 clip-diagonal cursor-pointer transition-all group"
                  onClick={() => { audio.playSFX('click'); setPrivateChatUser(result); }}
                  onMouseEnter={() => audio.playSFX('hover')}
                >
                  <Avatar className="w-10 h-10 border border-accent/50 clip-hex">
                    <AvatarImage src={result.photoURL} />
                    <AvatarFallback className="bg-secondary text-accent font-display">{result.specterName?.[0] || 'E'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-bold text-white group-hover:text-accent transition-colors">{result.specterName}</h4>
                    <p className="text-xs text-muted-foreground font-mono">{result.role}</p>
                  </div>
                  <User className="w-4 h-4 text-accent opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
