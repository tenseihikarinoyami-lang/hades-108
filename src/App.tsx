/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Chat } from './pages/Chat';
import { Trivia } from './pages/Trivia';
import { Leaderboard } from './pages/Leaderboard';
import { Store } from './pages/Store';
import { EquipmentPage } from './pages/Equipment';
import { Forge } from './pages/Forge';
import { Tower } from './pages/Tower';
import { Raids } from './pages/Raids';
import { GalacticWar } from './pages/GalacticWar';
import { Cosmos } from './pages/Cosmos';
import { Alchemy } from './pages/Alchemy';
import { Labyrinth } from './pages/Labyrinth';
import { BattleRoyale } from './pages/BattleRoyale';
import { SecretBosses } from './pages/SecretBosses';
import { BattlePass } from './pages/BattlePass';
import { Ascension } from './pages/Ascension';
import { Guilds } from './pages/Guilds';
import { SaintMode } from './pages/SaintMode';
import { Campaign } from './pages/Campaign';
import { Territories } from './pages/Territories';
import { WorldBoss } from './pages/WorldBoss';
import { HolyWar } from './pages/HolyWar';
import { FactionBase } from './pages/FactionBase';
import { Pets } from './pages/Pets';
import { AuctionHouse } from './pages/AuctionHouse';
import { Fishing } from './pages/Fishing';
import { SystemStatus } from './pages/SystemStatus';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <Router>
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
          </Route>
        </Routes>
        <Toaster theme="dark" />
      </Router>
    </AuthProvider>
  );
}
