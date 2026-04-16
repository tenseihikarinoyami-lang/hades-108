import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

import { Equipment, SpecterClass, Gem } from '../lib/rpg';
import { getSpecterById, getSpecterByName } from '../data/specters';

export interface GearPreset {
  id: 'arena' | 'tower' | 'labyrinth';
  name: string;
  description: string;
  equippedGear: {
    weapon?: Equipment | null;
    armor?: Equipment | null;
    artifact?: Equipment | null;
  };
  updatedAt: number | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'Juez' | 'Espectro';
  specterId?: string;
  specterName?: string;
  specterAbilityName?: string;
  specterAbilityDescription?: string;
  discoveredSpecters?: string[];
  specterAwakenings?: Record<string, number>;
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
  referralCode?: string;
  referredBy?: string | null;
  referralCount?: number;
  pendingDailyReward?: { day: number; reward: string; claimed: boolean };
  achievements?: string[];
  prestigePoints?: number;
  maxCombo?: number;
  pagesVisited?: number;
  tutorialCompleted?: boolean;
  fcmToken?: string;
  notificationsEnabled?: boolean;
  seasonalScore?: number;
  seasonalRank?: string;
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
  gearPresets?: GearPreset[];
  recentRewards?: Array<{
    id: string;
    type: 'gear' | 'gem' | 'currency' | 'memory' | 'title';
    label: string;
    value?: number;
    createdAt: number;
  }>;
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

const DEFAULT_DAILY_MISSIONS: NonNullable<UserProfile['dailyMissions']> = [
  { id: 'daily_trivias', title: 'Juega 3 Trivias', progress: 0, target: 3, completed: false },
  { id: 'daily_messages', title: 'Envia 5 mensajes en Cocytos', progress: 0, target: 5, completed: false }
];

const DEFAULT_EQUIPPED_GEAR: NonNullable<UserProfile['equippedGear']> = {
  weapon: null,
  armor: null,
  artifact: null,
};

const DEFAULT_CONSUMABLES: NonNullable<UserProfile['consumables']> = {
  time_potion: 0,
  clairvoyance_potion: 0,
  healing_potion: 0,
};

const DEFAULT_SKILLS: NonNullable<UserProfile['skills']> = {
  survival: 0,
  destruction: 0,
  fortune: 0,
};

const DEFAULT_MATERIALS: NonNullable<UserProfile['materials']> = {
  stardust: 0,
  shadowEssence: 0,
  primordialOre: 0,
  soulEssence: 0,
};

const cloneDailyMissions = () => DEFAULT_DAILY_MISSIONS.map((mission) => ({ ...mission }));
const cloneEquippedGear = () => ({ ...DEFAULT_EQUIPPED_GEAR });
const cloneConsumables = () => ({ ...DEFAULT_CONSUMABLES });
const cloneSkills = () => ({ ...DEFAULT_SKILLS });
const cloneMaterials = () => ({ ...DEFAULT_MATERIALS });
const cloneGearPresets = (): GearPreset[] => [
  {
    id: 'arena',
    name: 'Arena',
    description: 'Preset rapido para Arena y desafios cortos.',
    equippedGear: cloneEquippedGear(),
    updatedAt: null,
  },
  {
    id: 'tower',
    name: 'Torre',
    description: 'Preset orientado a runs largas y supervivencia.',
    equippedGear: cloneEquippedGear(),
    updatedAt: null,
  },
  {
    id: 'labyrinth',
    name: 'Laberinto',
    description: 'Preset para exploracion, reliquias y riesgo continuo.',
    equippedGear: cloneEquippedGear(),
    updatedAt: null,
  },
];

const createNewProfile = (firebaseUser: FirebaseUser): UserProfile => {
  const today = new Date().toISOString().split('T')[0];

  return {
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
    equippedGear: cloneEquippedGear(),
    gearPresets: cloneGearPresets(),
    discoveredSpecters: [],
    specterAwakenings: {},
    recentRewards: [],
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
    skills: cloneSkills(),
    consumables: cloneConsumables(),
    materials: cloneMaterials(),
    activeAura: 'none',
    pet: null,
    stats: {
      messagesSent: 0,
      triviasPlayed: 0,
      triviasWon: 0,
      loginStreak: 1,
      lastLoginDate: today
    },
    dailyMissions: cloneDailyMissions(),
    referralCode: firebaseUser.uid.substring(0, 8).toUpperCase(),
    referredBy: null,
    referralCount: 0
  };
};

const normalizeProfile = (data: UserProfile): { normalizedProfile: UserProfile; needsUpdate: boolean } => {
  const today = new Date().toISOString().split('T')[0];
  const defaultGearPresets = cloneGearPresets();
  const normalizedProfile: UserProfile = {
    ...data,
    badges: data.badges ? [...data.badges] : undefined,
    dailyMissions: data.dailyMissions ? data.dailyMissions.map((mission) => ({ ...mission })) : undefined,
    achievements: data.achievements ? [...data.achievements] : undefined,
    apprenticeIds: data.apprenticeIds ? [...data.apprenticeIds] : undefined,
    titles: data.titles ? [...data.titles] : undefined,
    inventory: data.inventory ? [...data.inventory] : undefined,
    gearInventory: data.gearInventory ? [...data.gearInventory] : undefined,
    equippedGear: data.equippedGear ? { ...data.equippedGear } : undefined,
    gearPresets: data.gearPresets
      ? data.gearPresets.map((preset) => ({
          ...preset,
          equippedGear: preset.equippedGear ? { ...preset.equippedGear } : cloneEquippedGear(),
        }))
      : undefined,
    discoveredSpecters: data.discoveredSpecters ? [...data.discoveredSpecters] : undefined,
    specterAwakenings: data.specterAwakenings ? { ...data.specterAwakenings } : undefined,
    recentRewards: data.recentRewards ? data.recentRewards.map((reward) => ({ ...reward })) : undefined,
    claimedPassRewards: data.claimedPassRewards ? [...data.claimedPassRewards] : undefined,
    soulTree: data.soulTree ? { ...data.soulTree } : undefined,
    materials: data.materials ? { ...data.materials } : undefined,
    pet: data.pet ? { ...data.pet } : data.pet,
    primordialPowers: data.primordialPowers ? [...data.primordialPowers] : undefined,
    saintModeProgress: data.saintModeProgress ? { ...data.saintModeProgress } : undefined,
    gems: data.gems ? [...data.gems] : undefined,
    skills: data.skills ? { ...data.skills } : undefined,
    consumables: data.consumables ? { ...data.consumables } : undefined,
    stats: data.stats ? { ...data.stats } : undefined,
  };
  let needsUpdate = false;
  const resolvedSpecter = getSpecterById(normalizedProfile.specterId) || getSpecterByName(normalizedProfile.specterName);

  if (resolvedSpecter) {
    if (normalizedProfile.specterId !== resolvedSpecter.id) {
      normalizedProfile.specterId = resolvedSpecter.id;
      needsUpdate = true;
    }
    const shouldReplacePhoto =
      !normalizedProfile.photoURL ||
      normalizedProfile.photoURL.includes('unsplash.com') ||
      normalizedProfile.photoURL.includes('dicebear.com');
    if (shouldReplacePhoto && normalizedProfile.photoURL !== resolvedSpecter.logo) {
      normalizedProfile.photoURL = resolvedSpecter.logo;
      needsUpdate = true;
    }
    if (!normalizedProfile.faction) {
      normalizedProfile.faction = resolvedSpecter.faction;
      needsUpdate = true;
    }
    if (normalizedProfile.specterAbilityName !== resolvedSpecter.ability.name) {
      normalizedProfile.specterAbilityName = resolvedSpecter.ability.name;
      needsUpdate = true;
    }
    if (normalizedProfile.specterAbilityDescription !== resolvedSpecter.ability.description) {
      normalizedProfile.specterAbilityDescription = resolvedSpecter.ability.description;
      needsUpdate = true;
    }
    const currentDiscoveries = new Set(normalizedProfile.discoveredSpecters || []);
    if (!currentDiscoveries.has(resolvedSpecter.id)) {
      currentDiscoveries.add(resolvedSpecter.id);
      normalizedProfile.discoveredSpecters = Array.from(currentDiscoveries);
      needsUpdate = true;
    }
    if (!normalizedProfile.specterAwakenings) {
      normalizedProfile.specterAwakenings = {};
      needsUpdate = true;
    }
    if (normalizedProfile.specterAwakenings[resolvedSpecter.id] === undefined) {
      normalizedProfile.specterAwakenings[resolvedSpecter.id] = 0;
      needsUpdate = true;
    }
  }

  if (!normalizedProfile.stats) {
    normalizedProfile.stats = {
      messagesSent: 0,
      triviasPlayed: 0,
      triviasWon: 0,
      loginStreak: 1,
      lastLoginDate: today
    };
    needsUpdate = true;
  } else if (normalizedProfile.stats.lastLoginDate !== today) {
    const lastLogin = new Date(normalizedProfile.stats.lastLoginDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    normalizedProfile.stats.loginStreak = diffDays === 1 ? normalizedProfile.stats.loginStreak + 1 : 1;
    normalizedProfile.stats.lastLoginDate = today;
    normalizedProfile.dailyMissions = cloneDailyMissions();

    const streak = normalizedProfile.stats.loginStreak || 1;
    const dailyRewards = [
      { day: 1, reward: { obolos: 100 }, label: '100 Obolos' },
      { day: 2, reward: { consumables: { time_potion: 1 } }, label: 'Pocion de Tiempo' },
      { day: 3, reward: { memoryFragments: 1 }, label: 'Fragmento de Memoria' },
      { day: 4, reward: { obolos: 200 }, label: '200 Obolos' },
      { day: 5, reward: { starFragments: 1 }, label: 'Fragmento Estelar' },
      { day: 6, reward: { obolos: 300 }, label: '300 Obolos' },
      { day: 7, reward: { obolos: 500, starFragments: 2 }, label: 'Premio Premium: 500 Obolos + 2 Fragmentos' },
    ];

    const rewardIndex = Math.min(streak - 1, 6);
    const reward = dailyRewards[rewardIndex];

    if (reward) {
      if (reward.reward.obolos) {
        normalizedProfile.obolos = (normalizedProfile.obolos || 0) + reward.reward.obolos;
      }
      if (reward.reward.memoryFragments) {
        normalizedProfile.memoryFragments = (normalizedProfile.memoryFragments || 0) + reward.reward.memoryFragments;
      }
      if (reward.reward.starFragments) {
        normalizedProfile.starFragments = (normalizedProfile.starFragments || 0) + reward.reward.starFragments;
      }
      if (reward.reward.consumables) {
        const currentConsumables = normalizedProfile.consumables || cloneConsumables();
        normalizedProfile.consumables = {
          ...currentConsumables,
          time_potion: (currentConsumables.time_potion || 0) + (reward.reward.consumables.time_potion || 0),
          clairvoyance_potion: currentConsumables.clairvoyance_potion || 0,
          healing_potion: currentConsumables.healing_potion || 0
        };
      }
      normalizedProfile.pendingDailyReward = {
        day: streak,
        reward: reward.label,
        claimed: false
      };
    }

    needsUpdate = true;
  }

  if (normalizedProfile.obolos === undefined) {
    normalizedProfile.obolos = 0;
    needsUpdate = true;
  }
  if (!normalizedProfile.inventory) {
    normalizedProfile.inventory = [];
    normalizedProfile.activeFrame = 'default';
    normalizedProfile.activeColor = 'text-white';
    needsUpdate = true;
  }
  if (!normalizedProfile.gearInventory) {
    normalizedProfile.gearInventory = [];
    needsUpdate = true;
  }
  if (!normalizedProfile.discoveredSpecters) {
    normalizedProfile.discoveredSpecters = normalizedProfile.specterId ? [normalizedProfile.specterId] : [];
    needsUpdate = true;
  }
  if (!normalizedProfile.specterAwakenings) {
    normalizedProfile.specterAwakenings = {};
    needsUpdate = true;
  }
  if (!normalizedProfile.equippedGear) {
    normalizedProfile.equippedGear = cloneEquippedGear();
    needsUpdate = true;
  }
  if (!normalizedProfile.gearPresets || normalizedProfile.gearPresets.length === 0) {
    normalizedProfile.gearPresets = defaultGearPresets;
    needsUpdate = true;
  } else {
    const presetMap = new Map(normalizedProfile.gearPresets.map((preset) => [preset.id, preset]));
    const mergedPresets = defaultGearPresets.map((preset) => {
      const existing = presetMap.get(preset.id);
      if (!existing) {
        needsUpdate = true;
        return preset;
      }

      return {
        ...preset,
        ...existing,
        equippedGear: existing.equippedGear ? { ...cloneEquippedGear(), ...existing.equippedGear } : cloneEquippedGear(),
      };
    });

    if (
      mergedPresets.length !== normalizedProfile.gearPresets.length ||
      mergedPresets.some((preset, index) => normalizedProfile.gearPresets?.[index]?.id !== preset.id)
    ) {
      needsUpdate = true;
    }

    normalizedProfile.gearPresets = mergedPresets;
  }
  if (normalizedProfile.starFragments === undefined) {
    normalizedProfile.starFragments = 0;
    needsUpdate = true;
  }
  if (normalizedProfile.memoryFragments === undefined) {
    normalizedProfile.memoryFragments = 0;
    needsUpdate = true;
  }
  if (normalizedProfile.passPoints === undefined) {
    normalizedProfile.passPoints = 0;
    normalizedProfile.passLevel = 1;
    normalizedProfile.claimedPassRewards = [];
    needsUpdate = true;
  }
  if (normalizedProfile.ascensionLevel === undefined) {
    normalizedProfile.ascensionLevel = 0;
    normalizedProfile.soulPoints = 0;
    normalizedProfile.soulTree = { globalDamage: 0, obolosMultiplier: 0 };
    normalizedProfile.gems = [];
    needsUpdate = true;
  }
  if (normalizedProfile.highestTowerFloor === undefined) {
    normalizedProfile.highestTowerFloor = 0;
    needsUpdate = true;
  }
  if (normalizedProfile.xp === undefined) {
    normalizedProfile.xp = 0;
    normalizedProfile.level = 1;
    normalizedProfile.cosmosPoints = 0;
    normalizedProfile.specterClass = 'Ninguna';
    normalizedProfile.skills = cloneSkills();
    normalizedProfile.consumables = cloneConsumables();
    normalizedProfile.materials = cloneMaterials();
    normalizedProfile.activeAura = 'none';
    normalizedProfile.primordialPowers = [];
    normalizedProfile.activePower = '';
    normalizedProfile.pet = null;
    needsUpdate = true;
  }
  if (!normalizedProfile.recentRewards) {
    normalizedProfile.recentRewards = [];
    needsUpdate = true;
  }

  return { normalizedProfile, needsUpdate };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const docRef = doc(db, 'users', firebaseUser.uid);

      unsubscribeProfile = onSnapshot(
        docRef,
        async (docSnap) => {
          try {
            if (!docSnap.exists()) {
              const newProfile = createNewProfile(firebaseUser);
              await setDoc(docRef, newProfile);
              setProfile(newProfile);
              return;
            }

            const data = docSnap.data() as UserProfile;
            const { normalizedProfile, needsUpdate } = normalizeProfile(data);

            if (needsUpdate) {
              await setDoc(docRef, normalizedProfile, { merge: true });
            }

            setProfile(normalizedProfile);
          } catch (error) {
            console.error('Error syncing user profile:', error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error listening user profile:', error);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      unsubscribeAuth();
    };
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, data, { merge: true });
    setProfile((currentProfile) => {
      if (!currentProfile) return currentProfile;
      return { ...currentProfile, ...data };
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
