# 📖 GUÍA COMPLETA DE RECREACIÓN — HADES-108

> Documento técnico para recrear el proyecto HADES-108 desde cero.

---

## 📋 ÍNDICE

1. [Prerrequisitos](#1-prerrequisitos)
2. [Estructura Inicial del Proyecto](#2-estructura-inicial-del-proyecto)
3. [Configuración de Firebase](#3-configuración-de-firebase)
4. [Configuración de Google Gemini](#4-configuración-de-google-gemini)
5. [Setup del Proyecto Frontend](#5-setup-del-proyecto-frontend)
6. [Creación de Archivos Base](#6-creación-de-archivos-base)
7. [Sistema de Autenticación](#7-sistema-de-autenticación)
8. [Sistema de Navegación y Layout](#8-sistema-de-navegación-y-layout)
9. [Base de Datos de Trivias](#9-base-de-datos-de-trivias)
10. [Sistema RPG Completo](#10-sistema-rpg-completo)
11. [Todas las Páginas (31)](#11-todas-las-páginas-31)
12. [Sistemas Avanzados](#12-sistemas-avanzados)
13. [Componentes UI y Utilidades](#13-componentes-ui-y-utilidades)
14. [Firestore Rules](#14-firestore-rules)
15. [PWA y Service Workers](#15-pwa-y-service-workers)
16. [Despliegue](#16-despliegue)
17. [Testing y Verificación](#17-testing-y-verificación)

---

## 1. PREREQUISITOS

### Software Requerido
- **Node.js** 18.x o superior (https://nodejs.org)
- **npm** 9.x o superior (viene con Node.js)
- **Git** (https://git-scm.com)
- **Editor de código**: VS Code recomendado (https://code.visualstudio.com)
- **Cuenta de Google** (para Firebase y Gemini)

### Servicios Externos Necesarios
- **Firebase** (gratuito con límites generosos): https://firebase.google.com
- **Google AI Studio** (gratuito para Gemini): https://aistudio.google.com
- **Vercel** (gratuito para hosting): https://vercel.com

---

## 2. ESTRUCTURA INICIAL DEL PROYECTO

### Paso 1: Crear directorio y inicializar proyecto
```bash
mkdir hades-108
cd hades-108
npm init -y
```

### Paso 2: Instalar TODAS las dependencias
```bash
# Dependencias de producción
npm install react react-dom react-router-dom typescript @types/react @types/react-dom
npm install firebase @google/genai
npm install framer-motion motion
npm install lucide-react
npm install sonner
npm install tailwindcss @tailwindcss/vite autoprefixer tailwind-merge clsx class-variance-authority
npm install @radix-ui/react-scroll-area @radix-ui/react-slot @base-ui/react
npm install @fontsource-variable/geist
npm install next-themes
npm install date-fns
npm install dotenv
npm install express @types/express
npm install @vercel/analytics @vercel/speed-insights
npm install vite @vitejs/plugin-react @types/node vite-plugin-pwa

# Dependencias de desarrollo
npm install -D tsx tailwindcss-animate tw-animate-css @vercel/node
```

### Paso 3: Crear estructura de carpetas
```bash
mkdir -p src/{components/ui,context,data,hooks,lib,pages}
mkdir -p public
mkdir -p api
```

---

## 3. CONFIGURACIÓN DE FIREBASE

### Paso 1: Crear proyecto en Firebase Console
1. Ir a https://console.firebase.google.com
2. Click en **"Agregar proyecto"**
3. Nombre: `hades-f3f3e` (o tu nombre preferido)
4. Desactivar Google Analytics (opcional)
5. Click en **"Crear proyecto"**

### Paso 2: Habilitar Authentication
1. En el panel izquierdo, click en **Authentication**
2. Click en **"Comenzar"**
3. En la pestaña **"Sign-in method"**, habilitar **Google**
4. Guardar

### Paso 3: Habilitar Firestore Database
1. En el panel izquierdo, click en **Firestore Database**
2. Click en **"Crear base de datos"**
3. Seleccionar **"Comenzar en modo de producción"**
4. Seleccionar ubicación del servidor (us-central1 recomendado)
5. Click en **"Habilitar"**

### Paso 4: Obtener credenciales
1. Ir a **Configuración del proyecto** (engranaje ⚙️)
2. Bajar a **"Tus apps"**
3. Click en el ícono web `</>`
4. Registrar la app con un nombre (ej: "Hades Web")
5. Copiar el objeto `firebaseConfig`

### Paso 5: Agregar dominios autorizados
1. En Authentication → Settings → **Authorized domains**
2. Agregar:
   - `localhost` (desarrollo)
   - Tu dominio de Vercel (producción, ej: `hades-108.vercel.app`)

### Paso 6: Generar VAPID Key para Push Notifications
1. En Cloud Messaging (dentro de Configuración del proyecto)
2. En **"Configuración de aplicaciones web"**, generar par de claves
3. Copiar la **VAPID Key**

---

## 4. CONFIGURACIÓN DE GOOGLE GEMINI

### Paso 1: Crear API Key
1. Ir a https://aistudio.google.com
2. Click en **"Get API key"** o **"Create API key"**
3. Crear nueva clave
4. Copiar la API Key

### Paso 2: Configurar cuotas (opcional)
1. En Google Cloud Console, verificar que la API de Gemini esté habilitada
2. El tier gratuito permite ~15 requests/minuto

---

## 5. SETUP DEL PROYECTO FRONTEND

### Archivo: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Archivo: `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: { /* ver sección PWA */ },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [ /* ver sección PWA */ ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### Archivo: `.env`
```env
# Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Gemini
GEMINI_API_KEY=tu_gemini_key

# Push Notifications
VITE_FIREBASE_VAPID_KEY=tu_vapid_key
```

---

## 6. CREACIÓN DE ARCHIVOS BASE

### Archivo: `src/lib/firebase.ts`
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
```

### Archivo: `src/index.css`
Crear con Tailwind v4, tema oscuro, fuentes Cinzel Decorative + Rajdhani, utilidades custom (clip-diagonal, neon-text, glass-panel, etc.)

Ver archivo final en el repositorio para el CSS completo (~200 líneas).

---

## 7. SISTEMA DE AUTENTICACIÓN

### Archivo: `src/context/AuthContext.tsx`
Componente principal que maneja:
- Login/logout con Google
- Creación automática de perfil al primer login
- Inicialización de TODOS los campos del perfil
- Daily Login Rewards (7 días progresivos)
- Generación de código de referido
- Función `updateProfile` para sincronizar Firestore + estado local

**Campos del perfil:**
- uid, email, displayName, photoURL
- role (Juez/Espectro)
- specterName, faction
- score, obolos, memoryFragments, starFragments
- gearInventory, equippedGear (weapon/armor/artifact)
- stats (messagesSent, triviasPlayed, triviasWon, loginStreak, lastLoginDate)
- dailyMissions (array de 2 misiones)
- achievements (array de IDs)
- prestigePoints, maxCombo, pagesVisited
- titles, activeTitle
- badges, inventory, activeFrame, activeColor
- passPoints, passLevel, claimedPassRewards
- level, xp, cosmosPoints, specterClass, ascensionLevel
- soulPoints, soulTree, gems, skills, consumables, materials
- pet, activeAura, primordialPowers, activePower
- highestTowerFloor, guildId
- referralCode, referredBy, referralCount
- tutorialCompleted, fcmToken, notificationsEnabled
- seasonalScore, seasonalRank
- mentorId, apprenticeIds
- pendingDailyReward

---

## 8. SISTEMA DE NAVEGACIÓN Y LAYOUT

### Archivo: `src/components/Layout.tsx`
- Header con logo, navegación con dropdowns, menú móvil hamburguesa
- NavGroups: Aventura, End-Game, Social, Progreso, Equipo
- Avatar del usuario con aura visual
- Botón de mute, logout
- Footer con links
- Integración del componente Onboarding

### Archivo: `src/App.tsx`
Router con 32 rutas definidas usando React Router DOM v7.

---

## 9. BASE DE DATOS DE TRIVIAS

### Archivo: `src/data/trivias.ts`
~1500 líneas con:
- 5 niveles de dificultad (Humano a Dios)
- 50+ arenas temáticas
- Cada arena tiene: id, title, description, questions[]
- Cada pregunta tiene: q, options[4], answer, bgImage

### Archivo: `src/lib/gemini.ts`
Generación infinita de trivias con Google Gemini:
- Modelo: gemini-2.0-flash
- Prompt estructurado para generar preguntas de trivia
- Parseo de respuesta JSON

---

## 10. SISTEMA RPG COMPLETO

### Archivo: `src/lib/rpg.ts`
Debe incluir:
- **Rarezas**: bronce, plata, oro, espectro, divino (con multiplicadores de stats)
- **Tipos de equipo**: weapon, armor, artifact
- **Elementos**: Fuego, Hielo, Rayo, Oscuridad, Neutral
- **Multiplicadores elementales**: ventaja x1.5, desventaja x0.75
- **Sets de equipo**: 27 sets con bonificaciones (Wyvern, Griffon, Garuda, Hades, etc.)
- **Clases de espectro**: Violencia (+daño), Defensa (+vida), Sabiduría (+tiempo)
- **Gemas**: Rubí (daño), Esmeralda (vida), Zafiro (tiempo)
- **Encantamientos**: 5 tipos con bonificaciones especiales
- **Loot roll**: Probabilidad de drop por rareza
- **Upgrade de equipo**: Función para mejorar rareza
- **Calcular nivel desde XP**

---

## 11. TODAS LAS PÁGINAS (31)

Cada página debe crearse en `src/pages/` con:
- Componente funcional React + TypeScript
- Uso de `useAuth()` para perfil
- Cards glass-panel con estilo consistente
- Audio feedback con `audio.playSFX()`
- Toast notifications con `sonner`

### Lista completa:
1. `Home.tsx` → Landing o DashboardHub según login
2. `Profile.tsx` → Perfil, misiones, logros, inventario, referidos
3. `Chat.tsx` → Chat global + mensajes privados con onSnapshot
4. `Trivia.tsx` → Arena con combate RPG, combos, loot, fragmentos
5. `Leaderboard.tsx` → Ranking global
6. `Store.tsx` → Tienda de cosméticos
7. `Equipment.tsx` → Armería con CharacterAvatar
8. `Forge.tsx` → Forja de Hefesto
9. `Tower.tsx` → Torre roguelike
10. `Raids.tsx` → Incursiones
11. `GalacticWar.tsx` → PvP
12. `Cosmos.tsx` → Nodos de habilidades
13. `Alchemy.tsx` → Pociones
14. `Labyrinth.tsx` → Laberinto
15. `BattleRoyale.tsx` → Torneo 100 jugadores
16. `SecretBosses.tsx` → Jefes primordiales
17. `BattlePass.tsx` → Pase de batalla
18. `Ascension.tsx` → Sistema de prestigio
19. `Guilds.tsx` → Escuadrones
20. `SaintMode.tsx` → Modo Leyenda
21. `Campaign.tsx` → Campaña
22. `Territories.tsx` → Territorios
23. `WorldBoss.tsx` → Jefe mundial
24. `HolyWar.tsx` → Guerra Santa
25. `FactionBase.tsx` → Base de facción
26. `Pets.tsx` → Mascotas
27. `AuctionHouse.tsx` → Subastas
28. `Fishing.tsx` → Pesca
29. `SystemStatus.tsx` → Estado del servidor
30. `Friends.tsx` → Sistema de amigos
31. `Minigames.tsx` → Dados + Ruleta

---

## 12. SISTEMAS AVANZADOS

### Crear en `src/lib/`:

| Archivo | Líneas aprox. | Funcionalidad |
|---------|---------------|---------------|
| `engine.ts` | ~120 | Motor de logros, badges, misiones, incremento de stats |
| `referrals.ts` | ~60 | Sistema de referidos con Firestore CRUD |
| `friends.ts` | ~100 | CRUD de amigos con onSnapshot |
| `seasons.ts` | ~80 | Rankings mensuales, 5 rangos, recompensas |
| `guildWars.ts` | ~60 | Desafíos y guerras entre guilds |
| `crafting.ts` | ~80 | 6 recetas, validación de materiales |
| `mentorship.ts` | ~80 | Mentor/aprendiz, recompensas |
| `notifications.ts` | ~50 | FCM push notifications |
| `analytics.ts` | ~70 | Tracking de eventos, retención |
| `anticheat.ts` | ~120 | Validación, rate limiting, ban temporal |
| `emailReminders.ts` | ~120 | 5 templates, envío automático |
| `audio.ts` | ~150 | Web Audio API, 8 SFX, música ambiental |
| `cataclysms.ts` | ~60 | 7 cataclysmos rotativos por día |
| `elements.ts` | ~30 | Iconos y multiplicadores de elementos |
| `profile.ts` | ~25 | Helpers saveUserProfile |

### Crear en `src/data/`:

| Archivo | Líneas aprox. | Contenido |
|---------|---------------|-----------|
| `achievements.ts` | ~350 | 105 logros en 5 categorías con recompensas |
| `flashEvents.ts` | ~80 | 6 eventos temporales configurados |

### Crear en `src/components/`:

| Archivo | Líneas aprox. | Funcionalidad |
|---------|---------------|---------------|
| `CharacterAvatar.tsx` | ~180 | Avatar estilo Diablo con equipo visual |
| `DashboardHub.tsx` | ~260 | Dashboard central "Trono de Hades" |
| `GameHUD.tsx` | ~110 | HUD reutilizable para trivias |
| `Onboarding.tsx` | ~170 | Tutorial de 8 pasos |

### Crear en `src/hooks/`:

| Archivo | Líneas aprox. | Funcionalidad |
|---------|---------------|---------------|
| `useGameLoop.ts` | ~90 | Timer, vida, progreso de preguntas |

---

## 13. COMPONENTES UI Y UTILIDADES

### Instalar componentes shadcn/Radix:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
```

### Instalar Avatar de base-ui:
```bash
npm install @base-ui/react
```

### Instalar Sonner:
```bash
npm install sonner
```

### Instalar Radix ScrollArea:
```bash
npx shadcn@latest add scroll-area
```

---

## 14. FIRESTORE RULES

### Archivo: `firestore.rules`
Debe incluir reglas para TODAS las colecciones:
- `users` (lectura: auth, escritura: owner)
- `messages` (lectura: auth, escritura: auth)
- `triviaScores` (lectura: auth, escritura: auth)
- `auction_listings` (lectura/escritura: auth)
- `guilds` (lectura/escritura: auth, admin: ownerId)
- `guildNodes` (lectura/escritura: auth)
- `game_state` (lectura: público, escritura: admin)
- `faction_bases` (lectura: público, escritura: admin)
- `pvp_challenges` (lectura/escritura: auth)
- `world_boss` (lectura: público, escritura: admin)
- `private_messages` (lectura: participantes, escritura: sender)

Deploy:
```bash
firebase deploy --only firestore:rules
```

---

## 15. PWA Y SERVICE WORKERS

### Archivo: `public/manifest.json`
```json
{
  "name": "Hades-108 - Underworld Protocol",
  "short_name": "Hades-108",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#05010a",
  "theme_color": "#00f0ff",
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Archivo: `public/firebase-messaging-sw.js`
Service worker para Firebase Cloud Messaging (ver código final en repositorio).

### Iconos PWA
Crear `public/icon-192x192.png` y `public/icon-512x512.png` (192x192 y 512x512 píxeles).

---

## 16. DESPLIEGUE

### Vercel
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Producción
vercel --prod
```

### Agregar dominio a Firebase
En Firebase Console → Authentication → Settings → Authorized Domains:
- Agregar el dominio de Vercel

---

## 17. TESTING Y VERIFICACIÓN

### Checklist de verificación:
- [ ] Login con Google funciona
- [ ] Perfil se crea automáticamente al primer login
- [ ] Daily Login Rewards se aplican
- [ ] Código de referido se genera
- [ ] Tutorial se muestra solo la primera vez
- [ ] Dashboard se muestra para usuarios logueados
- [ ] Trivias se pueden jugar con combos funcionando
- [ ] Loot se guarda en Firestore y se sincroniza con perfil
- [ ] Fragmentos de memoria se guardan correctamente
- [ ] Misiones diarias se actualizan
- [ ] Logros se desbloquean automáticamente
- [ ] Sistema de amigos funciona (buscar, enviar, aceptar)
- [ ] Minijuegos funcionan (Dados, Ruleta)
- [ ] Avatar Diablo muestra equipo equipado
- [ ] Responsive funciona en móvil
- [ ] Menú hamburguesa funciona en móvil
- [ ] Chat global funciona en tiempo real
- [ ] PWA se puede instalar
- [ ] Notificaciones push se pueden activar

---

## 📝 NOTAS FINALES

- **Tiempo estimado de recreación**: 40-60 horas para un desarrollador experimentado
- **Costo de servicios**: Gratuito en tier free (Firebase, Gemini, Vercel)
- **Dificultad**: Intermedia-Avanzada
- **Stack completo**: React 19 + TypeScript + Tailwind v4 + Firebase + Gemini AI + Vercel

**¡Éxito en la recreación!** ⚔️🔥
