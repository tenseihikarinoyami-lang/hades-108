import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { Equipment, SpecterClass, Gem } from '../lib/rpg';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'Juez' | 'Espectro';
  specterName?: string;
  score: number;
  createdAt: number;
  faction?: 'Wyvern' | 'Griffon' | 'Garuda' | '';
  badges?: string[];
  dailyMissions?: { id: string; progress: number; target: number; completed: boolean; title: string }[];
  obolos?: number;
  stats?: {
    messagesSent: number;
    triviasPlayed: number;
    triviasWon: number;
    loginStreak: number;
    lastLoginDate: string;
  };
  // SISTEMA DE REFERIDOS
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  pendingDailyReward?: { day: number; reward: string; claimed: boolean };
  // SISTEMA DE LOGROS
  achievements?: string[];
  prestigePoints?: number;
  maxCombo?: number;
  pagesVisited?: number;
  tutorialCompleted?: boolean;
  fcmToken?: string;
  notificationsEnabled?: boolean;
  // SEASONAL RANKINGS
  seasonalScore?: number;
  seasonalRank?: string;
  // MENTOR SYSTEM
  mentorId?: string;
  apprenticeIds?: string[];
  titles?: string[];
  activeTitle?: string;
  inventory?: string[];
  gearInventory?: Equipment[];
  equippedGear?: {
    weapon?: Equipment | null;
    armor?: Equipment | null;
    artifact?: Equipment | null;
  };
  activeFrame?: string;
  activeColor?: string;
  starFragments?: number;
  memoryFragments?: number;
  highestTowerFloor?: number;
  xp?: number;
  level?: number;
  cosmosPoints?: number;
  passPoints?: number;
  passLevel?: number;
  claimedPassRewards?: number[];
  specterClass?: SpecterClass;
  ascensionLevel?: number;
  soulPoints?: number;
  soulTree?: {
    globalDamage: number;
    obolosMultiplier: number;
  };
  guildId?: string;
  materials?: {
    stardust: number;
    shadowEssence: number;
    primordialOre: number;
    soulEssence?: number;
  };
  activeAura?: string;
  pet?: {
    id: string;
    name: string;
    level: number;
    xp: number;
    type: string;
  } | null;
  primordialPowers?: string[];
  activePower?: string;
  campaignProgress?: number;
  saintModeProgress?: {
    saga: string;
    chapter: number;
  };
  gems?: Gem[];
  skills?: {
    survival: number;
    destruction: number;
    fortune: number;
  };
  consumables?: {
    time_potion: number;
    clairvoyance_potion: number;
    healing_potion: number;
  };
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  setProfile: () => { },
  updateProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create profile
        const docRef = doc(db, 'users', firebaseUser.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;

            // Check login streak and daily missions reset
            const today = new Date().toISOString().split('T')[0];
            let updatedData = { ...data };
            let needsUpdate = false;

            if (!data.stats) {
              updatedData.stats = { messagesSent: 0, triviasPlayed: 0, triviasWon: 0, loginStreak: 1, lastLoginDate: today };
              needsUpdate = true;
            } else if (data.stats.lastLoginDate !== today) {
              const lastLogin = new Date(data.stats.lastLoginDate);
              const currentDate = new Date(today);
              const diffTime = Math.abs(currentDate.getTime() - lastLogin.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays === 1) {
                updatedData.stats.loginStreak += 1;
              } else {
                updatedData.stats.loginStreak = 1;
              }
              updatedData.stats.lastLoginDate = today;

              // Reset daily missions
              updatedData.dailyMissions = [
                { id: 'daily_trivias', title: 'Juega 3 Trivias', progress: 0, target: 3, completed: false },
                { id: 'daily_messages', title: 'Envía 5 mensajes en Cocytos', progress: 0, target: 5, completed: false }
              ];

              // DAILY LOGIN REWARDS - Recompensas por día consecutivo
              const streak = updatedData.stats.loginStreak || 1;
              const dailyRewards = [
                { day: 1, reward: { obolos: 100 }, label: '100 Óbolos' },
                { day: 2, reward: { consumables: { time_potion: 1 } }, label: 'Poción de Tiempo' },
                { day: 3, reward: { memoryFragments: 1 }, label: 'Fragmento de Memoria' },
                { day: 4, reward: { obolos: 200 }, label: '200 Óbolos' },
                { day: 5, reward: { starFragments: 1 }, label: 'Fragmento Estelar' },
                { day: 6, reward: { obolos: 300 }, label: '300 Óbolos' },
                { day: 7, reward: { obolos: 500, starFragments: 2 }, label: '¡PREMIO PREMIUM! 500 Óbolos + 2 Fragmentos' },
              ];

              const rewardIndex = Math.min(streak - 1, 6);
              const reward = dailyRewards[rewardIndex];

              if (reward) {
                if (reward.reward.obolos) {
                  updatedData.obolos = (updatedData.obolos || 0) + reward.reward.obolos;
                }
                if (reward.reward.memoryFragments) {
                  updatedData.memoryFragments = (updatedData.memoryFragments || 0) + reward.reward.memoryFragments;
                }
                if (reward.reward.starFragments) {
                  updatedData.starFragments = (updatedData.starFragments || 0) + reward.reward.starFragments;
                }
                if (reward.reward.consumables) {
                  const currentConsumables = updatedData.consumables || { time_potion: 0, clairvoyance_potion: 0, healing_potion: 0 };
                  updatedData.consumables = {
                    ...currentConsumables,
                    time_potion: (currentConsumables.time_potion || 0) + (reward.reward.consumables.time_potion || 0),
                    clairvoyance_potion: currentConsumables.clairvoyance_potion || 0,
                    healing_potion: currentConsumables.healing_potion || 0
                  };
                }
                updatedData.pendingDailyReward = {
                  day: streak,
                  reward: reward.label,
                  claimed: false
                };
              }

              needsUpdate = true;
            }

            if (!data.obolos) {
              updatedData.obolos = 0;
              needsUpdate = true;
            }
            if (!data.inventory) {
              updatedData.inventory = [];
              updatedData.activeFrame = 'default';
              updatedData.activeColor = 'text-white';
              needsUpdate = true;
            }
            if (!data.gearInventory) {
              updatedData.gearInventory = [];
              updatedData.equippedGear = { weapon: null, armor: null, artifact: null };
              needsUpdate = true;
            }

            if (!data.starFragments) {
              updatedData.starFragments = 0;
              needsUpdate = true;
            }
            if (!data.memoryFragments) {
              updatedData.memoryFragments = 0;
              needsUpdate = true;
            }
            if (data.passPoints === undefined) {
              updatedData.passPoints = 0;
              updatedData.passLevel = 1;
              updatedData.claimedPassRewards = [];
              needsUpdate = true;
            }
            if (data.ascensionLevel === undefined) {
              updatedData.ascensionLevel = 0;
              updatedData.soulPoints = 0;
              updatedData.soulTree = { globalDamage: 0, obolosMultiplier: 0 };
              updatedData.gems = [];
              needsUpdate = true;
            }
            if (!data.highestTowerFloor) {
              updatedData.highestTowerFloor = 0;
              needsUpdate = true;
            }
            if (data.xp === undefined) {
              updatedData.xp = 0;
              updatedData.level = 1;
              updatedData.cosmosPoints = 0;
              updatedData.specterClass = 'Ninguna';
              updatedData.skills = { survival: 0, destruction: 0, fortune: 0 };
              updatedData.consumables = { time_potion: 0, clairvoyance_potion: 0, healing_potion: 0 };
              updatedData.materials = { stardust: 0, shadowEssence: 0, primordialOre: 0, soulEssence: 0 };
              updatedData.activeAura = 'none';
              updatedData.primordialPowers = [];
              updatedData.activePower = '';
              updatedData.pet = null;
              needsUpdate = true;
            }

            if (needsUpdate) {
              await setDoc(docRef, updatedData, { merge: true });
            }

            setProfile(updatedData);
          } else {
            // Create new profile
            const today = new Date().toISOString().split('T')[0];
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Alma Perdida',
              photoURL: firebaseUser.photoURL || '',
              role: 'Espectro',
              score: 0,
              createdAt: Date.now(),
              obolos: 0,
              badges: [],
              titles: ['Alma Perdida'],
              activeTitle: 'Alma Perdida',
              inventory: [],
              gearInventory: [],
              equippedGear: { weapon: null, armor: null, artifact: null },
              activeFrame: 'default',
              activeColor: 'text-white',
              starFragments: 0,
              memoryFragments: 0,
              highestTowerFloor: 0,
              xp: 0,
              level: 1,
              cosmosPoints: 0,
              passPoints: 0,
              passLevel: 1,
              claimedPassRewards: [],
              specterClass: 'Ninguna',
              ascensionLevel: 0,
              soulPoints: 0,
              soulTree: { globalDamage: 0, obolosMultiplier: 0 },
              gems: [],
              skills: { survival: 0, destruction: 0, fortune: 0 },
              consumables: { time_potion: 0, clairvoyance_potion: 0, healing_potion: 0 },
              materials: { stardust: 0, shadowEssence: 0, primordialOre: 0 },
              activeAura: 'none',
              pet: null,
              stats: {
                messagesSent: 0,
                triviasPlayed: 0,
                triviasWon: 0,
                loginStreak: 1,
                lastLoginDate: today
              },
              dailyMissions: [
                { id: 'daily_trivias', title: 'Juega 3 Trivias', progress: 0, target: 3, completed: false },
                { id: 'daily_messages', title: 'Envía 5 mensajes en Cocytos', progress: 0, target: 5, completed: false }
              ],
              // SISTEMA DE REFERIDOS - Generar código único
              referralCode: firebaseUser.uid.substring(0, 8).toUpperCase(),
              referredBy: null,
              referralCount: 0
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // If it fails (e.g. due to rules or offline), we still set user but profile might be null
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const docRef = doc(db, 'users', user.uid);
    const updatedProfile = { ...profile, ...data };
    await setDoc(docRef, updatedProfile, { merge: true });
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
