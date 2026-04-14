# ⚔️ HADES-108 — Underworld Protocol

> **Despierta tu Sapuris y conquista el Inframundo**

Un juego de trivias RPG multijugador con temática de Saint Seiya, construido con React, Firebase y Google Gemini AI.

[![Estado](https://img.shields.io/badge/estado-producci%C3%B3n-brightgreen)](https://hades-108.vercel.app)
[![Versión](https://img.shields.io/badge/versi%C3%B3n-2.0.0-blue)](https://github.com/tenseihikarinoyami-lang/hades-108)
[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb)](https://reactjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.12.0-ffca28)](https://firebase.google.com)
[![Deploy Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características Principales](#características-principales)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Páginas y Rutas](#páginas-y-rutas)
- [Sistemas de Juego](#sistemas-de-juego)
- [Instalación Local](#instalación-local)
- [Variables de Entorno](#variables-de-entorno)
- [Firebase Setup](#firebase-setup)
- [Despliegue](#despliegue)
- [Arquitectura](#arquitectura)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## Descripción

**HADES-108** es una aplicación web de juego tipo trivia RPG con temática de **Saint Seiya (Los Caballeros del Zodiaco)**. Los jugadores asumen el rol de espectros al servicio de Hades, compitiendo en arenas de trivias, explorando mazmorras, formando guilds y conquistando el Inframundo.

### Características destacadas:
- 🎮 **105+ logros** en 5 categorías (Combate, Social, Exploración, Colección, Maestría)
- ⚔️ **Sistema de combate** con combos, elementos y multiplicadores
- 🏆 **Rankings mensuales** con 5 rangos de prestigio
- 👥 **Sistema social completo**: amigos, guilds, guerras entre guilds, mentoría
- 🎰 **Minijuegos casuales**: Dados de Hades, Ruleta del Destino
- 📱 **PWA completa** con notificaciones push
- 🤖 **Trivias generadas por IA** (Google Gemini)
- 🎨 **Avatar visual estilo Diablo** con equipo equipado
- 🔄 **Eventos temporales** rotativos con bonificaciones especiales

---

## Características Principales

### 🎯 Sistema de Trivias
- **5 niveles de dificultad**: Humano → Espectro → Santo → Dios
- **50+ arenas** temáticas (Anime, Videojuegos, Mitología, Cine, Música, etc.)
- **Modo Oráculo**: Trivias infinitas generadas por Google Gemini AI
- **Sistema de combos**: x1.5 (3+), x2.0 (5+), x3.0 (10+) respuestas consecutivas
- **Mecánicas de combate**: Barra de vida del jugador y enemigo, timer, elementos
- **Loot system**: Equipo con rarezas (Bronce → Divino), sockets, sets, encantamientos

### 👤 Perfil y Progresión
- **Sistema de niveles** con XP y puntos de cosmos
- **105 logros** desbloqueables con recompensas
- **Sistema de títulos** exclusivos
- **Árbol de habilidades** Cosmos con nodos desbloqueables
- **Sistema de ascensión** con soul tree
- **Pase de batalla** con 50 niveles de recompensas

### ⚔️ Equipamiento
- **Avatar visual estilo Diablo** mostrando equipo equipado
- **Armas, Armaduras y Artefactos** con estadísticas
- **27 sets de equipo** con bonificaciones
- **Sistema de gemas**: Rubí (daño), Esmeralda (vida), Zafiro (tiempo)
- **Forja de Hefesto**: Mejora de rareza y sockets
- **Casa de subastas**: Mercado jugador a jugador

### 🌍 Mundo Social
- **Sistema de amigos**: Enviar/aceptar/rechazar solicitudes
- **Guilds/Escuadrones**: Crear y unirse a guilds
- **Guild Wars**: Guerra entre guilds de 7 días
- **Chat global Cocytos**: Chat en tiempo real
- **Sistema de mentoría**: Veteranos guían a nuevos jugadores (nivel 20+)
- **Sistema de referidos "Cadena de Almas"**: Código único, +200 Óbolos para ambos

### 🎲 Minijuegos
- **Dados de Hades**: Juego de azar con apuestas de Óbolos
- **Ruleta del Destino**: Spin diario con recompensas aleatorias
- **Sistema de pesca**: Mini-juego de reflejos para materiales

### 📅 Eventos y Temporadas
- **6 eventos temporales** rotativos con bonificaciones especiales
- **7 cataclysmos diarios** (uno por día de la semana)
- **Rankings mensuales** con reset y 5 rangos: Hades, Juez, General, Espectro Élite, Guerrero
- **Misiones diarias**: 2 misiones reseteables cada día
- **Recompensas de login**: 7 días progresivos (100-500 Óbolos + fragmentos)

### 🔔 Notificaciones
- **Push notifications** con Firebase Cloud Messaging
- **Recordatorios por email** (5 templates automáticos)
- **Analytics integrado** con tracking de 13 tipos de eventos

### 🛡️ Seguridad
- **Anti-cheat** con validación de resultados, rate limiting y detección de patrones anómalos
- **Firestore rules** para todas las colecciones
- **Cloud Functions** para validación server-side (en producción)

---

## Tecnologías

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.0.0 | Framework UI |
| React Router DOM | 7.14.0 | Enrutamiento |
| TypeScript | ~5.8.2 | Tipado estático |
| Framer Motion | 12.38.0 | Animaciones |
| Tailwind CSS | 4.1.14 | Estilos utilitarios |
| Lucide React | 0.546.0 | Iconografía |
| Sonner | 2.0.7 | Notificaciones toast |

### Backend / Servicios
| Servicio | Uso |
|----------|-----|
| Firebase Auth | Autenticación Google OAuth |
| Firebase Firestore | Base de datos en tiempo real |
| Firebase Cloud Messaging | Push notifications |
| Google Gemini AI | Generación infinita de trivias |

### Infraestructura
| Herramienta | Uso |
|-------------|-----|
| Vite 6 | Bundler y dev server |
| Vercel | Hosting y deploy automático |
| Vite PWA Plugin | Service worker y manifest |
| Vercel Analytics | Métricas de rendimiento |

---

## Estructura del Proyecto

```
hades-108/
├── public/
│   ├── manifest.json                  # Manifiesto PWA
│   └── firebase-messaging-sw.js       # Service Worker para push
├── src/
│   ├── components/
│   │   ├── CharacterAvatar.tsx        # Avatar estilo Diablo
│   │   ├── DashboardHub.tsx           # Dashboard central "Trono de Hades"
│   │   ├── GameHUD.tsx                # HUD reutilizable para trivias
│   │   ├── Layout.tsx                 # Layout con navegación y menú móvil
│   │   ├── Onboarding.tsx             # Tutorial interactivo de 8 pasos
│   │   └── ui/                        # Componentes UI (shadcn, radix)
│   ├── context/
│   │   └── AuthContext.tsx            # Auth + Perfil + Login Rewards
│   ├── data/
│   │   ├── achievements.ts            # 105+ logros en 5 categorías
│   │   ├── flashEvents.ts             # 6 eventos temporales
│   │   └── trivias.ts                 # Base de datos de trivias
│   ├── hooks/
│   │   └── useGameLoop.ts             # Hook timer/vida para trivias
│   ├── lib/
│   │   ├── analytics.ts               # Telemetría y tracking
│   │   ├── anticheat.ts               # Validación anti-trampas
│   │   ├── audio.ts                   # Sistema de audio Web Audio API
│   │   ├── cataclysms.ts              # Cataclysmos diarios (7 días)
│   │   ├── crafting.ts                # 6 recetas de crafteo
│   │   ├── elements.ts                # Sistema de elementos
│   │   ├── emailReminders.ts          # 5 templates de email
│   │   ├── engine.ts                  # Motor de logros y misiones
│   │   ├── firebase.ts                # Config Firebase
│   │   ├── friends.ts                 # Sistema de amigos
│   │   ├── gemini.ts                  # Generación de trivias con IA
│   │   ├── guildWars.ts               # Guerras entre guilds
│   │   ├── mentorship.ts              # Sistema mentor/aprendiz
│   │   ├── notifications.ts           # Push notifications FCM
│   │   ├── profile.ts                 # Helpers de perfil
│   │   ├── referrals.ts               # Sistema de referidos
│   │   ├── rpg.ts                     # Sistema RPG completo
│   │   ├── seasons.ts                 # Rankings mensuales
│   │   └── utils.ts                   # Utilidad cn()
│   ├── pages/                         # 31 páginas
│   │   ├── Alchemy.tsx                # Alquimia de pociones
│   │   ├── Ascension.tsx              # Sistema de ascensión
│   │   ├── AuctionHouse.tsx           # Casa de subastas
│   │   ├── BattlePass.tsx             # Pase de batalla
│   │   ├── BattleRoyale.tsx           # Torneo Battle Royale
│   │   ├── Campaign.tsx               # Modo campaña
│   │   ├── Chat.tsx                   # Chat global Cocytos
│   │   ├── Cosmos.tsx                 # Nodos de cosmos
│   │   ├── Equipment.tsx              # Armería/inventario
│   │   ├── FactionBase.tsx            # Base de facción
│   │   ├── Fishing.tsx                # Sistema de pesca
│   │   ├── Forge.tsx                  # Forja de Hefesto
│   │   ├── Friends.tsx                # Sistema de amigos
│   │   ├── GalacticWar.tsx            # PvP Guerra Galáctica
│   │   ├── Guilds.tsx                 # Sistema de guilds
│   │   ├── Home.tsx                   # Landing / Dashboard
│   │   ├── Labyrinth.tsx              # Laberinto del Inframundo
│   │   ├── Leaderboard.tsx            # Ranking global
│   │   ├── Minigames.tsx              # Minijuegos casuales
│   │   ├── Pets.tsx                   # Familiares/mascotas
│   │   ├── Profile.tsx                # Perfil de usuario
│   │   ├── Raids.tsx                  # Incursiones cooperativas
│   │   ├── SaintMode.tsx              # Modo Leyenda/Saint
│   │   ├── SecretBosses.tsx           # Jefes primordiales
│   │   ├── Store.tsx                  # Tienda
│   │   ├── SystemStatus.tsx           # Estado del sistema
│   │   ├── Territories.tsx            # Territorios
│   │   ├── Tower.tsx                  # Torre roguelike
│   │   ├── Trivia.tsx                 # Arena de trivias
│   │   └── WorldBoss.tsx              # Jefe mundial
│   ├── App.tsx                        # Router principal
│   ├── index.css                      # Tailwind + temas + utilidades
│   └── main.tsx                       # Entry point
├── api/
│   └── status.ts                      # API endpoint Vercel
├── firestore.rules                    # Reglas de seguridad Firestore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

---

## Páginas y Rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home / Dashboard | Landing para invitados, Dashboard para logueados |
| `/profile` | Profile | Perfil, misiones, logros, inventario, referidos |
| `/chat` | Chat | Chat global en tiempo real |
| `/trivia` | Trivia | Arena de trivias con combate RPG |
| `/leaderboard` | Leaderboard | Ranking global y de temporada |
| `/store` | Store | Tienda de cosméticos |
| `/equipment` | Equipment | Armería con avatar visual Diablo |
| `/forge` | Forge | Forja: mejora y encantamiento |
| `/tower` | Tower | Torre roguelike infinita |
| `/raids` | Raids | Incursiones cooperativas |
| `/pvp` | GalacticWar | PvP asíncrono |
| `/cosmos` | Cosmos | Árbol de habilidades |
| `/alchemy` | Alchemy | Creación de pociones |
| `/labyrinth` | Labyrinth | Laberinto de supervivencia |
| `/battle-royale` | BattleRoyale | Torneo de 100 jugadores |
| `/secret-bosses` | SecretBosses | Jefes primordiales |
| `/battle-pass` | BattlePass | Pase de batalla 50 niveles |
| `/ascension` | Ascension | Sistema de prestigio |
| `/guilds` | Guilds | Crear y gestionar guilds |
| `/saint-mode` | SaintMode | Campaña Saint Seiya |
| `/campaign` | Campaign | Descenso divino |
| `/territories` | Territories | Conquista de territorios |
| `/world-boss` | WorldBoss | Jefe mundial de fin de semana |
| `/holy-war` | HolyWar | Guerra Santa entre facciones |
| `/faction-base` | FactionBase | Base de facción |
| `/pets` | Pets | Mascotas/familiares |
| `/auction` | AuctionHouse | Mercado jugador a jugador |
| `/fishing` | Fishing | Mini-juego de pesca |
| `/system` | SystemStatus | Estado del servidor |
| `/friends` | Friends | Sistema de amigos |
| `/minigames` | Minigames | Dados y Ruleta |

---

## Sistemas de Juego

### 💎 Sistema de Rareza
**Bronce → Plata → Oro → Espectro → Divino**

Cada rareza otorga mayores estadísticas y mejor probabilidad de drop.

### 🔥 Sistema de Elementos
**Fuego > Hielo > Oscuridad > Rayo > Fuego**

Multiplicadores de daño: Ventaja x1.5, Desventaja x0.75, Neutral x1.0

### ⚡ Sistema de Combos
- **x1.5**: 3+ respuestas consecutivas correctas
- **x2.0**: 5+ respuestas consecutivas correctas
- **x3.0**: 10+ respuestas consecutivas correctas

### 🏅 5 Rangos de Temporada
| Rango | Score Mínimo | Recompensa |
|-------|-------------|------------|
| Guerrero | 1,000 | 500 Óbolos + 1 Fragmento |
| Espectro Élite | 3,000 | 1,000 Óbolos + 2 Fragmentos |
| General | 5,000 | 2,000 Óbolos + 3 Fragmentos |
| Juez | 7,500 | 3,000 Óbolos + 5 Fragmentos |
| Hades | 10,000 | 5,000 Óbolos + 10 Fragmentos + Título |

### 🎁 Recompensas de Login (7 días)
| Día | Recompensa |
|-----|------------|
| 1 | 100 Óbolos |
| 2 | Poción de Tiempo x1 |
| 3 | Fragmento de Memoria x1 |
| 4 | 200 Óbolos |
| 5 | Fragmento Estelar x1 |
| 6 | 300 Óbolos |
| 7 | **PREMIUM**: 500 Óbolos + 2 Fragmentos Estelares |

### 🎲 Minijuegos
- **Dados de Hades**: Dobles x5, Suma ≥10 x2, Suma <10 pierdes
- **Ruleta del Destino**: 8 premios desde 10 Óbolos hasta Jackpot 1000 + 2 Fragmentos

---

## Instalación Local

### Prerrequisitos
- **Node.js** 18+ y npm
- **Cuenta de Firebase** con proyecto creado
- **API Key de Google Gemini** (gratuita en Google AI Studio)

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/tenseihikarinoyami-lang/hades-108.git
cd hades-108

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env

# 4. Editar .env con tus credenciales (ver sección Variables de Entorno)

# 5. Iniciar servidor de desarrollo
npm run dev
# → http://localhost:3000

# 6. Build para producción
npm run build

# 7. Preview de producción
npm run preview
```

---

## Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBtidUxVxZeTpBJg90aWL8VEC5XQndJZCM
VITE_FIREBASE_AUTH_DOMAIN=hades-f3f3e.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hades-f3f3e
VITE_FIREBASE_STORAGE_BUCKET=hades-f3f3e.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=697437888110
VITE_FIREBASE_APP_ID=1:697437888110:web:afa06960754c4ee088d07f

# Google Gemini AI (para generación de trivias)
GEMINI_API_KEY=tu_api_key_aqui

# Firebase VAPID Key (para push notifications)
VITE_FIREBASE_VAPID_KEY=tu_vapid_key_aqui
```

---

## Firebase Setup

### 1. Crear Proyecto Firebase
1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear nuevo proyecto "hades-f3f3e"
3. Habilitar **Authentication** → Método Google
4. Habilitar **Firestore Database** → Modo producción
5. Habilitar **Cloud Messaging** → Generar par de claves VAPID

### 2. Configurar Firestore
- Crear las siguientes colecciones:
  - `users` (documentos con UID como ID)
  - `messages` (chat global)
  - `triviaScores` (puntuaciones)
  - `friendships` (sistema de amigos)
  - `guilds` (guilds/escuadrones)
  - `guildWars` (guerras entre guilds)
  - `auction_listings` (subastas)
  - `private_messages` (mensajes privados)
  - `seasons` (rankings mensuales, subcolecciones `YYYY-M/rankings`)
  - `events` (eventos temporales)
  - `game_state` (estado del juego)
  - `faction_bases` (bases de facción)
  - `pvp_challenges` (desafíos PvP)
  - `world_boss` (jefe mundial)

### 3. Deploy de Firestore Rules
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 4. Agregar Dominios Autorizados
En Firebase Console → Authentication → Settings → Authorized Domains:
- `localhost` (desarrollo)
- Tu dominio de Vercel (producción)

---

## Despliegue

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

O conecta tu repositorio de GitHub directamente en [vercel.com](https://vercel.com).

### Dominios Autorizados
No olvides agregar tu dominio de producción a Firebase Console → Authentication → Authorized Domains.

---

## Arquitectura

### Flujo de Autenticación
```
Usuario → Google Sign-In → Firebase Auth → AuthContext → Crear/Fetch Perfil → Dashboard
```

### Flujo de Trivia
```
Selección de Arena → Preguntas de BD o Gemini IA → Respuestas → Combate RPG → Score → Firestore
```

### Sistema de Eventos
```
Cataclysmos (diarios, 7 rotativos) + Flash Events (temporales, 6 configurados)
```

---

## Contribuir

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'feat: nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

---

## Licencia

Este proyecto es de uso educativo y entretenimiento. Todos los derechos reservados.

---

## Créditos

- **Desarrollador**: [@tenseihikarinoyami-lang](https://github.com/tenseihikarinoyami-lang)
- **Tema**: Saint Seiya (Los Caballeros del Zodiaco) — Masami Kurumada
- **Música**: Pixabay (licencia gratuita)
- **Iconos**: Lucide React
- **UI Components**: shadcn, Radix UI
- **Hosting**: Vercel
- **Backend**: Firebase (Google)
- **IA**: Google Gemini

---

**¡Que Hades te guíe en el Inframundo!** ⚔️🔥
