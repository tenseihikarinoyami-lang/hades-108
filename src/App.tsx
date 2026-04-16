/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));
const Chat = lazy(() => import('./pages/Chat').then((module) => ({ default: module.Chat })));
const Trivia = lazy(() => import('./pages/Trivia').then((module) => ({ default: module.Trivia })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then((module) => ({ default: module.Leaderboard })));
const Store = lazy(() => import('./pages/Store').then((module) => ({ default: module.Store })));
const EquipmentPage = lazy(() => import('./pages/Equipment').then((module) => ({ default: module.EquipmentPage })));
const Forge = lazy(() => import('./pages/Forge').then((module) => ({ default: module.Forge })));
const Tower = lazy(() => import('./pages/Tower').then((module) => ({ default: module.Tower })));
const Raids = lazy(() => import('./pages/Raids').then((module) => ({ default: module.Raids })));
const GalacticWar = lazy(() => import('./pages/GalacticWar').then((module) => ({ default: module.GalacticWar })));
const Cosmos = lazy(() => import('./pages/Cosmos').then((module) => ({ default: module.Cosmos })));
const Alchemy = lazy(() => import('./pages/Alchemy').then((module) => ({ default: module.Alchemy })));
const Labyrinth = lazy(() => import('./pages/Labyrinth').then((module) => ({ default: module.Labyrinth })));
const BattleRoyale = lazy(() => import('./pages/BattleRoyale').then((module) => ({ default: module.BattleRoyale })));
const SecretBosses = lazy(() => import('./pages/SecretBosses').then((module) => ({ default: module.SecretBosses })));
const BattlePass = lazy(() => import('./pages/BattlePass').then((module) => ({ default: module.BattlePass })));
const Ascension = lazy(() => import('./pages/Ascension').then((module) => ({ default: module.Ascension })));
const Guilds = lazy(() => import('./pages/Guilds').then((module) => ({ default: module.Guilds })));
const SaintMode = lazy(() => import('./pages/SaintMode').then((module) => ({ default: module.SaintMode })));
const Campaign = lazy(() => import('./pages/Campaign').then((module) => ({ default: module.Campaign })));
const Territories = lazy(() => import('./pages/Territories').then((module) => ({ default: module.Territories })));
const WorldBoss = lazy(() => import('./pages/WorldBoss').then((module) => ({ default: module.WorldBoss })));
const HolyWar = lazy(() => import('./pages/HolyWar').then((module) => ({ default: module.HolyWar })));
const FactionBase = lazy(() => import('./pages/FactionBase').then((module) => ({ default: module.FactionBase })));
const Pets = lazy(() => import('./pages/Pets').then((module) => ({ default: module.Pets })));
const AuctionHouse = lazy(() => import('./pages/AuctionHouse').then((module) => ({ default: module.AuctionHouse })));
const Fishing = lazy(() => import('./pages/Fishing').then((module) => ({ default: module.Fishing })));
const SystemStatus = lazy(() => import('./pages/SystemStatus').then((module) => ({ default: module.SystemStatus })));
const Friends = lazy(() => import('./pages/Friends').then((module) => ({ default: module.Friends })));
const Minigames = lazy(() => import('./pages/Minigames').then((module) => ({ default: module.Minigames })));

const RouteLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="profile" element={<Profile />} />
              <Route path="chat" element={<Chat />} />
              <Route path="trivia" element={<Trivia />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="store" element={<Store />} />
              <Route path="equipment" element={<EquipmentPage />} />
              <Route path="forge" element={<Forge />} />
              <Route path="tower" element={<Tower />} />
              <Route path="raids" element={<Raids />} />
              <Route path="pvp" element={<GalacticWar />} />
              <Route path="cosmos" element={<Cosmos />} />
              <Route path="alchemy" element={<Alchemy />} />
              <Route path="labyrinth" element={<Labyrinth />} />
              <Route path="battle-royale" element={<BattleRoyale />} />
              <Route path="secret-bosses" element={<SecretBosses />} />
              <Route path="battle-pass" element={<BattlePass />} />
              <Route path="ascension" element={<Ascension />} />
              <Route path="guilds" element={<Guilds />} />
              <Route path="saint-mode" element={<SaintMode />} />
              <Route path="campaign" element={<Campaign />} />
              <Route path="territories" element={<Territories />} />
              <Route path="world-boss" element={<WorldBoss />} />
              <Route path="holy-war" element={<HolyWar />} />
              <Route path="faction-base" element={<FactionBase />} />
              <Route path="pets" element={<Pets />} />
              <Route path="auction" element={<AuctionHouse />} />
              <Route path="fishing" element={<Fishing />} />
              <Route path="system" element={<SystemStatus />} />
              <Route path="friends" element={<Friends />} />
              <Route path="minigames" element={<Minigames />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster theme="dark" />
      </Router>
    </AuthProvider>
  );
}
