# Análisis Completo del Proyecto HADES-108

Fecha del análisis: 2026-04-14

## 1. Qué es este proyecto

**HADES-108** es una aplicación web SPA construida con **React 19 + Vite + TypeScript + Firebase** que mezcla:

- trivia competitiva,
- progresión RPG,
- sistemas sociales,
- economía interna,
- modos PvE/PvP,
- eventos temporales,
- y una estética oscura/cyber-gótica inspirada en **Saint Seiya** y el **Inframundo de Hades**.

No es un sitio informativo ni una landing simple: es un **juego web persistente** con perfil, inventario, progreso, recursos, combate basado en preguntas, minijuegos, chat y múltiples pantallas de endgame.

El proyecto está pensado como una experiencia de juego “live-service” ligera:

- el usuario entra con Google,
- se crea o sincroniza su perfil en Firestore,
- el progreso se guarda entre sesiones,
- gran parte del contenido se apoya en preguntas locales y/o trivias generadas por Gemini,
- y varias pantallas consumen o actualizan estado compartido del jugador o del mundo.

## 2. Identidad jugable y propuesta de valor

La identidad del proyecto se apoya en 5 pilares:

### 2.1 Trivia como combate

La trivia no está presentada como formulario académico sino como **combate**:

- hay vida del jugador,
- vida del enemigo,
- temporizador,
- daño por respuesta,
- jefes,
- combos,
- elementos,
- botín,
- consumibles,
- y habilidades activas/pasivas.

### 2.2 Progresión persistente

El usuario no solo suma puntos:

- sube de nivel,
- gana XP,
- obtiene puntos de cosmos,
- desbloquea auras,
- equipa armas/armaduras/artefactos,
- consigue gemas,
- adopta mascotas,
- avanza pase de batalla,
- asciende,
- y acumula recursos.

### 2.3 Universo social

El proyecto no se limita al single-player:

- hay chat global,
- mensajería privada,
- amigos,
- facciones,
- escuadrones/guilds,
- guerra de territorios,
- guerras de facciones,
- base de facción,
- y PvP asíncrono.

### 2.4 Modo “metajuego”

Más allá de la Arena principal, existen muchas capas secundarias:

- torre infinita,
- laberinto,
- boss mundial,
- raids,
- battle royale,
- bosses secretos,
- campañas,
- saint mode,
- pesca,
- tienda,
- subasta,
- forja,
- alquimia,
- minijuegos de azar.

### 2.5 Presentación audiovisual

La aplicación cuida mucho la fantasía visual:

- tipografías teatrales,
- neón cian/rojo/morado,
- paneles glassmorphism,
- scanlines,
- bordes diagonales/hexagonales,
- sonidos UI sintetizados,
- música ambiente,
- sombras brillantes,
- estética techno-occulta.

## 3. Stack tecnológico real del proyecto

### 3.1 Frontend

- `react` 19
- `react-dom` 19
- `react-router-dom` 7
- `typescript`
- `vite`
- `tailwindcss` 4
- `@tailwindcss/vite`
- `framer-motion`
- `motion`
- `lucide-react`
- `sonner`
- `shadcn` + Radix/Base UI

### 3.2 Backend y servicios

- `firebase/app`
- `firebase/auth`
- `firebase/firestore`
- Firebase Cloud Messaging vía service worker
- Google Gemini vía `@google/genai`
- endpoint serverless en `api/status.ts` para estado del sistema

### 3.3 Observabilidad y despliegue

- `@vercel/analytics`
- `@vercel/speed-insights`
- `vite-plugin-pwa`
- `vercel.json`

### 3.4 Qué significa esto en la práctica

Arquitectónicamente, el proyecto es:

- un **frontend único grande**,
- con **persistencia directa desde cliente a Firestore**,
- con **autenticación Google**,
- con **un poco de API serverless**,
- y con varias mecánicas locales que no dependen de backend dedicado.

No hay un backend propio extenso con controladores/servicios de negocio tradicionales. La mayoría de la lógica del juego vive en el cliente.

## 4. Inventario real del código

Conteo del código revisado:

- `src/pages`: 31 archivos
- `src/components`: 8 archivos
- `src/components/ui`: 7 archivos
- `src/lib`: 20 archivos
- `src/data`: 3 archivos

Archivos raíz relevantes:

- `src/App.tsx`: router principal
- `src/main.tsx`: bootstrap React
- `src/index.css`: sistema visual global
- `api/status.ts`: endpoint de estado
- `firestore.rules`: reglas Firestore
- `vite.config.ts`: configuración Vite/PWA
- `vercel.json`: rewrites y despliegue
- `public/manifest.json`: manifiesto PWA
- `public/firebase-messaging-sw.js`: service worker de notificaciones

## 5. Arquitectura general del proyecto

### 5.1 Flujo de arranque

1. `src/main.tsx` monta `App`, `Analytics` y `SpeedInsights`.
2. `src/App.tsx` envuelve toda la app con `AuthProvider`.
3. El router monta `Layout` como contenedor de todas las rutas.
4. `AuthContext` escucha `onAuthStateChanged`.
5. Si el usuario existe, se consulta/crea `users/{uid}` en Firestore.
6. A partir de ese perfil se habilitan la navegación, tutorial, dashboard y sistemas del juego.

### 5.2 Flujo de autenticación

Autenticación real:

- Google Sign-In con `signInWithPopup`
- Firebase Auth
- creación automática de perfil si no existe
- persistencia de campos base y de progreso en Firestore

### 5.3 Flujo de persistencia

Hay dos patrones principales:

- páginas que actualizan Firestore con `updateDoc/setDoc` directamente;
- páginas que usan `updateProfile()` del `AuthContext` para sincronizar Firestore y estado local.

### 5.4 Flujo de interfaz

`Layout` resuelve:

- header fijo,
- navegación desktop,
- menú móvil,
- login/logout,
- toggle de audio,
- acceso al perfil,
- banner de cataclismo,
- footer,
- onboarding automático.

## 6. Sistema visual y de experiencia

### 6.1 Dirección de arte

La app usa una estética muy definida:

- fondo abismal `#05010a`,
- rojo neón como color primario,
- cian neón como acento,
- morado como color secundario,
- paneles translúcidos,
- bordes duros/afilados,
- títulos épicos.

### 6.2 Tipografías

Definidas en `src/index.css`:

- `Rajdhani` para texto general
- `Cinzel Decorative` para títulos y branding

### 6.3 Utilidades visuales propias

Clases visuales más características:

- `clip-diagonal`
- `clip-card`
- `clip-hex`
- `neon-text-primary`
- `neon-text-accent`
- `neon-border`
- `glass-panel`
- `hologram`
- `scanline`
- `animate-shake`

### 6.4 Efectos adicionales disponibles

El proyecto incluye efectos reutilizables aunque no todos están conectados en todas las páginas:

- flash de pantalla
- shake de pantalla
- speed lines
- aura de personaje
- contador de combo
- barra épica de progreso
- notificación RPG
- sistema de partículas por canvas
- explosiones de partículas
- partículas ambientales

Archivos involucrados:

- `src/components/ScreenEffects.tsx`
- `src/components/particles.tsx`
- `src/components/AdvancedAnimations.css`

### 6.5 Audio

`src/lib/audio.ts` implementa:

- música ambiente en loop desde Pixabay,
- mute global,
- SFX sintéticos por Web Audio API:
  - `hover`
  - `click`
  - `success`
  - `error`
  - `damage`
  - `shield`
  - `power_activate`
  - `boss_phase`

## 7. Modelo de datos principal: perfil del usuario

El núcleo del juego es `UserProfile` en `src/context/AuthContext.tsx`.

### 7.1 Identidad

- `uid`
- `email`
- `displayName`
- `photoURL`
- `role`
- `specterName`
- `faction`

### 7.2 Progreso y puntuación

- `score`
- `xp`
- `level`
- `cosmosPoints`
- `highestTowerFloor`
- `campaignProgress`
- `saintModeProgress`
- `seasonalScore`
- `seasonalRank`

### 7.3 Economía y materiales

- `obolos`
- `starFragments`
- `memoryFragments`
- `materials.stardust`
- `materials.shadowEssence`
- `materials.primordialOre`
- `materials.soulEssence`

### 7.4 Pase, ascensión y meta-progresión

- `passPoints`
- `passLevel`
- `claimedPassRewards`
- `ascensionLevel`
- `soulPoints`
- `soulTree.globalDamage`
- `soulTree.obolosMultiplier`

### 7.5 Inventario y equipamiento

- `inventory`
- `gearInventory`
- `equippedGear.weapon`
- `equippedGear.armor`
- `equippedGear.artifact`
- `gems`
- `activeFrame`
- `activeColor`
- `activeAura`

### 7.6 Clase, habilidades y poderes

- `specterClass`
- `skills.survival`
- `skills.destruction`
- `skills.fortune`
- `primordialPowers`
- `activePower`

### 7.7 Consumibles y soporte de combate

- `consumables.time_potion`
- `consumables.clairvoyance_potion`
- `consumables.healing_potion`

### 7.8 Social

- `guildId`
- `mentorId`
- `apprenticeIds`
- `referralCode`
- `referredBy`
- `referralCount`
- `titles`
- `activeTitle`
- `badges`

### 7.9 Mascota

- `pet.id`
- `pet.name`
- `pet.level`
- `pet.xp`
- `pet.type`

### 7.10 Meta de sesión y engagement

- `dailyMissions`
- `pendingDailyReward`
- `achievements`
- `prestigePoints`
- `maxCombo`
- `pagesVisited`
- `tutorialCompleted`
- `fcmToken`
- `notificationsEnabled`

### 7.11 Estadísticas internas

`stats` guarda:

- `messagesSent`
- `triviasPlayed`
- `triviasWon`
- `loginStreak`
- `lastLoginDate`

## 8. Lo que hace AuthContext

`AuthContext` no solo entrega el usuario autenticado; también hace trabajo de “motor de sesión”.

Funciones reales:

- carga o crea el perfil,
- inicializa valores faltantes cuando el esquema cambia,
- resetea misiones diarias cuando cambia el día,
- calcula racha de login,
- entrega recompensas diarias,
- garantiza inventarios/recursos/campos base,
- expone `updateProfile()` para persistir cambios.

### 8.1 Recompensas diarias implementadas

Secuencia real:

- Día 1: 100 Óbolos
- Día 2: 1 Poción de Tiempo
- Día 3: 1 Fragmento de Memoria
- Día 4: 200 Óbolos
- Día 5: 1 Fragmento Estelar
- Día 6: 300 Óbolos
- Día 7: 500 Óbolos + 2 Fragmentos Estelares

### 8.2 Misiones diarias implementadas

Se regeneran dos:

- jugar 3 trivias
- enviar 5 mensajes en Cocytos

## 9. Componentes principales

### 9.1 `Layout`

Es el esqueleto de toda la app.

Responsabilidades:

- navegación completa desktop/mobile,
- branding HADES,
- login/logout,
- control de audio,
- resumen del jugador,
- estado de carga,
- banner de cataclismo activo,
- footer con acceso a `/system`,
- montaje del tutorial `Onboarding`.

### 9.2 `DashboardHub`

Se muestra en Home cuando el usuario está autenticado.

Incluye:

- saludo personalizado,
- eventos flash activos o próximo evento,
- cataclismo activo,
- accesos rápidos,
- misiones diarias,
- actividad del jugador,
- resumen de progreso.

### 9.3 `Onboarding`

Tutorial de 8 pasos que explica:

- el mundo del Inframundo,
- Arena de Trivias,
- equipo,
- misiones,
- chat,
- logros,
- referidos,
- cierre con recompensa.

Al completarse:

- marca `tutorialCompleted`,
- suma 100 Óbolos,
- añade 1 `time_potion`.

### 9.4 `CharacterAvatar`

Representación visual del personaje tipo “paper doll”:

- muestra silueta,
- arma a la derecha,
- armadura en torso,
- artefacto a la izquierda,
- brillos por rareza,
- tooltips simples.

### 9.5 `GameHUD`

HUD reusable que modela:

- barra de vida del jugador,
- escudo Garuda,
- timer,
- vida del enemigo,
- nombre del enemigo,
- icono elemental.

Actualmente existe como componente reutilizable, pero la Arena y otros modos aún renderizan HUDs propios en vez de reutilizarlo de forma consistente.

### 9.6 Otros componentes de `src/components`

Además de los anteriores, el directorio incluye:

- `ScreenEffects.tsx`: efectos completos de pantalla, combo, auras y notificaciones RPG.
- `particles.tsx`: partículas ambientales y explosiones visuales.
- `AdvancedAnimations.css`: librería de animaciones adicionales.

### 9.7 Componentes UI base en `src/components/ui`

Primitivos presentes:

- `avatar.tsx`
- `button.tsx`
- `card.tsx`
- `input.tsx`
- `label.tsx`
- `scroll-area.tsx`
- `sonner.tsx`

Su función es servir de base común para casi todas las páginas.

## 10. Librerías de juego y sistemas globales

### 10.1 `src/lib/rpg.ts`

Es una de las piezas más importantes.

Define:

- rarezas: `bronce`, `plata`, `oro`, `espectro`, `divino`
- tipos de equipo: `weapon`, `armor`, `artifact`
- elementos: `Fuego`, `Hielo`, `Rayo`, `Oscuridad`, `Neutral`
- sets
- clases del espectro
- gemas
- fórmulas de XP/nivel
- generación procedural de loot
- generación procedural de gemas
- multiplicadores elementales
- bono de set completo
- costes de upgrade por rareza
- encantamientos base

#### 10.1.1 Clases

Clases disponibles:

- `Violencia`: potencia daño
- `Defensa`: potencia vida
- `Sabiduría`: potencia tiempo
- `Ninguna`

#### 10.1.2 Loot

`rollLoot()` genera:

- tipo de objeto,
- nombre compuesto,
- rareza,
- stats,
- elemento,
- set,
- sockets,
- lista de gemas.

#### 10.1.3 Gemas

Tipos:

- daño
- vida
- tiempo

### 10.2 `src/lib/engine.ts`

Se encarga de:

- comprobar insignias,
- evaluar logros,
- actualizar progreso de misiones,
- incrementar estadísticas básicas.

También dispara toasts y SFX.

### 10.3 `src/data/achievements.ts`

Total real:

- **105 logros**

Distribución:

- combate: 25
- social: 20
- exploración: 20
- colección: 20
- maestría: 20

Además expone:

- filtrado por categoría,
- búsqueda por id,
- cálculo de puntos de prestigio.

### 10.4 `src/data/flashEvents.ts`

Eventos flash configurados:

- Eclipse de Hades
- Marea de Almas
- Noche de los Espectros
- Furia del Tártaro
- Bendición de los Jueces
- Caos del Cosmos

Fechas configuradas en código:

- del 2026-04-13 al 2026-04-24 según evento

Cada evento define:

- nombre,
- descripción,
- icono,
- gradiente visual,
- fecha de inicio,
- fecha de fin,
- tipo de bonus,
- multiplicador.

### 10.5 `src/lib/cataclysms.ts`

Cataclismos diarios/por día de semana:

- Lunes de Sangre
- Martes de la Forja
- Miércoles de Sombras
- Jueves de Viento
- Viernes de Luz
- Fin de Semana del Vacío

Se usan en la UI y también alteran varias mecánicas:

- daño,
- tiempo,
- costes de forja,
- drops.

### 10.6 `src/lib/crafting.ts`

Recetas configuradas:

- Espada Estelar
- Armadura de Sombras
- Poción de Cronos Avanzada
- Amuleto Primordial
- Lágrima de Atenea
- Escudo del Cocytos

### 10.7 `src/lib/powerups.ts`

Power-ups definidos:

- Sabiduría de Atenea
- Escudo Divino
- Tiempo de Cronos
- Oráculo de Delfos
- Sangre de Zeus
- Furia de Ares

### 10.8 `src/lib/referrals.ts`

Implementa la “Cadena de Almas”:

- valida código,
- prohíbe usar el propio,
- da +200 Óbolos al nuevo usuario,
- da +200 Óbolos y +1 fragmento estelar al referidor,
- incrementa `referralCount`.

### 10.9 `src/lib/friends.ts`

Gestiona:

- envío de solicitud,
- aceptación,
- rechazo,
- eliminación,
- stream de amigos aceptados,
- stream de pendientes,
- búsqueda por `specterName`.

### 10.10 `src/lib/guildWars.ts`

Sistema base para:

- declarar guerra entre guilds,
- sumar score,
- listar guerras activas.

### 10.11 `src/lib/mentorship.ts`

Incluye:

- aceptar aprendiz,
- validación de mentor nivel 20+,
- recompensa por progreso del aprendiz,
- cierre de apprenticeship,
- búsqueda de mentores disponibles.

### 10.12 `src/lib/seasons.ts`

Rangos de temporada:

- Hades
- Juez
- General
- Espectro Élite
- Guerrero

Incluye:

- lectura del ranking mensual,
- actualización de score estacional,
- cálculo de rango,
- búsqueda de recompensas del rango.

### 10.13 `src/lib/emailReminders.ts`

Templates existentes:

- `welcome`
- `daily_reminder`
- `inactive_2days`
- `inactive_7days`
- `event_starting`

El envío está pensado como stub/log y no como integración productiva final.

## 11. Rutas y páginas

La app tiene 31 páginas/rutas montadas dentro de `Layout`.

| Ruta | Página | Rol funcional |
|---|---|---|
| `/` | Home | Landing pública o dashboard autenticado |
| `/profile` | Profile | Identidad, progreso, recursos y referidos |
| `/chat` | Chat | Chat global y privado |
| `/trivia` | Trivia | Arena principal del juego |
| `/leaderboard` | Leaderboard | Ranking individual y facciones |
| `/store` | Store | Cosméticos |
| `/equipment` | Equipment | Inventario y equipamiento |
| `/forge` | Forge | Mejora de rareza y sockets |
| `/tower` | Tower | Torre infinita |
| `/raids` | Raids | Raid cooperativa/faccional |
| `/pvp` | GalacticWar | PvP asíncrono |
| `/cosmos` | Cosmos | Clase, skills y auras |
| `/alchemy` | Alchemy | Creación de consumibles |
| `/labyrinth` | Labyrinth | Roguelike de 20 habitaciones |
| `/battle-royale` | BattleRoyale | Torneo de 100 jugadores simulados |
| `/secret-bosses` | SecretBosses | Bosses primordiales |
| `/battle-pass` | BattlePass | Pase de 50 niveles |
| `/ascension` | Ascension | Renacimiento y árbol de alma |
| `/guilds` | Guilds | Escuadrones y nodos |
| `/saint-mode` | SaintMode | Campaña Saint Seiya |
| `/campaign` | Campaign | Campaña mitológica/divina |
| `/territories` | Territories | Control de prisiones/territorios |
| `/world-boss` | WorldBoss | Typhón fin de semana |
| `/holy-war` | HolyWar | Guerra santa de facciones |
| `/faction-base` | FactionBase | Base compartida de facción |
| `/pets` | Pets | Mascotas/familiares |
| `/auction` | AuctionHouse | Mercado jugador a jugador |
| `/fishing` | Fishing | Minijuego de reacción |
| `/system` | SystemStatus | Estado técnico del sistema |
| `/friends` | Friends | Amigos y solicitudes |
| `/minigames` | Minigames | Dados + ruleta |

## 12. Descripción detallada de cada página

### 12.1 Home

Si el usuario no está autenticado:

- muestra hero central,
- CTA de login,
- grid de 3 tarjetas de features,
- branding del juego.

Si el usuario sí está autenticado:

- reemplaza la landing por `DashboardHub`.

### 12.2 Profile

Pantalla de identidad y centro de control personal.

Funciones:

- seleccionar nombre de espectro,
- seleccionar facción,
- editar foto/avatar,
- validar que el `specterName` no esté tomado,
- mostrar badges,
- mostrar misiones diarias,
- mostrar recursos,
- resumir inventario,
- gestionar código de referido,
- copiar código,
- aplicar código externo si aún no usó uno.

### 12.3 Chat

Dos modos:

- `global`
- `private`

Global:

- escucha `messages`,
- renderiza 100 mensajes,
- actualiza scroll,
- enviar mensaje incrementa estadística y misión diaria.

Privado:

- permite buscar usuarios por `specterName`,
- elegir interlocutor,
- escuchar `private_messages`,
- mostrar solo mensajes relacionados.

### 12.4 Trivia

Es la pantalla más importante del juego.

Capas funcionales:

- selección de dificultad,
- selección de arena,
- modo IA “Oráculo de Delfos”,
- loop de combate,
- HUD completo,
- lógica de tiempo,
- HP jugador/enemigo,
- daño elemental,
- pasivas de facción,
- bonus por mascota,
- bonus por clase,
- combo,
- jefes finales,
- maldiciones primordiales,
- botín,
- fragmentos,
- consumibles,
- poderes activos,
- guardado de score,
- XP y nivel,
- misiones,
- badges/logros.

#### 12.4.1 Mecánicas especiales de Trivia

- `Wyvern`: daño/puntos extra al acertar
- `Griffon`: más tiempo
- `Garuda`: un escudo por partida
- combo x1.5 desde 3
- combo x2.0 desde 5
- combo x3.0 desde 10
- consumibles:
  - tiempo
  - clarividencia
  - curación
- poderes activos:
  - Cronos
  - Atenea
  - Apolo
- maldiciones:
  - Chronos
  - Caos
  - Nyx

#### 12.4.2 Persistencia al terminar

Cuando termina una partida:

- suma score,
- suma Óbolos,
- suma XP,
- recalcula nivel,
- da puntos de cosmos al subir de nivel,
- guarda mejor score por arena en `triviaScores`,
- incrementa stats,
- avanza misiones,
- intenta otorgar badges/logros.

### 12.5 Leaderboard

Muestra:

- top 10 usuarios por `score`,
- guerra de facciones agregada a partir de los top 50,
- avatar,
- rol,
- facción,
- score visual.

### 12.6 Store

Tienda cosmética.

Items reales:

- 3 marcos
- 2 colores de nombre

Operaciones:

- comprar con Óbolos,
- equipar frame,
- equipar color.

### 12.7 Equipment

Funciona como:

- papelera visual del personaje,
- slots de arma/armadura/artefacto,
- listado completo de inventario,
- equipar,
- desequipar,
- vender al “mercado negro”.

También calcula:

- bonus total de stats,
- set bonus completo.

### 12.8 Forge

Tiene dos pestañas:

- ascensión de rareza,
- engarzado de gemas.

Ascensión:

- toma el coste por rareza,
- aplica descuento si el cataclismo es `Forja`,
- mejora stats,
- actualiza inventario y equipo equipado.

Sockets:

- añade gema al item,
- consume gema del inventario,
- actualiza inventario y equipo equipado.

### 12.9 Tower

Modo infinito generado por IA.

Características:

- cada piso genera 5 preguntas,
- la dificultad escala por piso,
- la vida persiste entre pisos,
- hay loot acumulado por run,
- hay fragmentos estelares por run,
- el último combate del piso actúa como jefe,
- al morir se guardan recompensas y récord de piso máximo.

### 12.10 Raids

Modo cooperativo/compartido.

Usa `game_state/current_raid` para:

- boss activo,
- HP global,
- daño por facción.

Cada intento:

- genera 3 preguntas difíciles,
- calcula daño,
- descuenta vida del jefe,
- suma contribución de facción,
- recompensa con Óbolos según daño.

### 12.11 GalacticWar

PvP asíncrono.

Flujo:

- retas a otro usuario,
- se generan preguntas,
- el challenger guarda score/tiempo,
- el rival acepta y responde,
- gana mayor score,
- desempate por tiempo,
- el ganador recibe Óbolos.

### 12.12 Cosmos

Centro de progresión del espectro.

Incluye:

- barra de nivel/XP,
- selección de clase,
- árbol de habilidades,
- compra/activación de auras.

Skills:

- supervivencia
- destrucción
- fortuna

Auras:

- sin aura
- llamas azules
- sangre carmesí
- divinidad dorada
- oscuridad del vacío

### 12.13 Alchemy

Permite fabricar tres consumibles:

- Poción de Cronos
- Ojo de las Moiras
- Lágrima de Atenea

Cada uno consume:

- Óbolos
- fragmentos estelares

### 12.14 Labyrinth

Modo roguelike de 20 habitaciones.

Características:

- run sin equipamiento explícito,
- HP temporal,
- score temporal,
- 5 preguntas por bloque,
- santuario/recompensa cada 5 habitaciones,
- bendiciones:
  - curación
  - más tiempo
  - más score

### 12.15 BattleRoyale

Modo de supervivencia simulado.

Rasgos:

- empieza con 100 jugadores,
- cada acierto elimina una fracción del lobby,
- si fallas quedas eliminado,
- el tiempo se acorta,
- victoria otorga Óbolos, loot y título.

### 12.16 SecretBosses

Cinco bosses con reglas únicas:

- Chronos: tiempo al doble de velocidad
- Caos: texto ofuscado
- Nyx: opciones ocultas
- Erebus: drenado de vida
- Tartarus: solo 5 segundos

Requisitos:

- pagar 5 fragmentos de memoria por invocación

Recompensas:

- loot divino exclusivo según boss,
- gema,
- 1000 Óbolos,
- título específico.

### 12.17 BattlePass

Sistema lineal de 50 niveles.

Recompensas:

- Óbolos
- fragmentos de estrella
- cofres divinos

Controla:

- nivel del pase
- progreso hacia siguiente nivel
- reclamaciones ya hechas

### 12.18 Ascension

Sistema de renacimiento.

Condición:

- nivel 100

Efectos:

- reinicia nivel y XP,
- suma nivel de ascensión,
- da punto de alma,
- permite mejorar:
  - daño global
  - multiplicador de Óbolos

### 12.19 Guilds

Gestión de escuadrones.

Incluye:

- crear guild por 5000 Óbolos,
- unirse,
- abandonar,
- ranking interno por facción,
- nivel de escuadrón según score,
- nodos de recursos conquistables.

Nodos iniciales:

- Mina de Óbolos
- Cantera de Estrellas
- Forja de Almas

### 12.20 SaintMode

Campaña específica de Saint Seiya.

Sagas configuradas:

- The Lost Canvas
- Saga del Santuario
- Saga de Asgard
- Saga de Poseidón
- Saga de Hades
- Soul of Gold

Cada saga tiene capítulos, dificultad y progresión persistente.

### 12.21 Campaign

Otra capa de campaña, más experimental y más “mitológica”.

Sagas reales:

- El Descenso
- El Despertar de los Titanes
- La Ira de los Dioses

Mecánicas especiales:

- saga con trivia inversa,
- saga con fases de jefe,
- recompensas por progreso,
- títulos por completar saga.

### 12.22 Territories

Sistema de control territorial por facciones.

Territorios/prisiones:

- El Tribunal
- Valle del Viento Negro
- Cueva del Cíclope
- Río de Sangre
- Tumbas Ardientes

Cada prisión tiene:

- bonus descriptivo,
- score de control por facción,
- facción dominante calculada,
- posibilidad de donar Óbolos.

### 12.23 WorldBoss

Jefe mundial compartido:

- Typhón
- 10.000.000 HP
- disponible solo fines de semana
- guarda contribuciones por usuario en `contributors`

Cada respuesta correcta:

- inflige daño según nivel,
- descuenta vida global,
- suma contribución individual.

### 12.24 HolyWar

Pantalla agregada de guerra santa entre facciones.

No es un modo jugable en sí mismo, sino un tablero que:

- consulta todos los usuarios,
- suma score por facción,
- calcula porcentaje de dominio.

### 12.25 FactionBase

Sistema compartido de fortaleza por facción.

Estado de base:

- nivel
- XP
- siguiente nivel
- bonos de daño/defensa/Óbolos
- recursos acumulados

El jugador puede donar:

- stardust
- shadowEssence
- primordialOre

### 12.26 Pets

Familiares disponibles:

- Cerbero Infernal
- Fénix de las Sombras
- Dragón del Cocytos

Cada uno cuesta 5000 Óbolos.

Una vez adoptado:

- queda como mascota activa,
- puede subir de nivel,
- muestra lore y habilidades de acompañante.

### 12.27 AuctionHouse

Mercado de objetos entre jugadores.

Permite:

- seleccionar un item del inventario,
- fijar precio,
- publicarlo en `auction_listings`,
- comprar listings ajenos,
- cancelar los propios.

### 12.28 Fishing

Minijuego de reacción con dos ríos:

- Estigia
- Lete

Flujo:

- pagas 50 Óbolos,
- esperas el pique,
- reaccionas antes de 1 segundo,
- obtienes materiales o dinero.

### 12.29 SystemStatus

Pantalla técnica simple.

Consume `/api/status` y muestra:

- estado,
- región,
- payload JSON,
- branding de infraestructura Vercel.

### 12.30 Friends

Sistema social directo.

Tabs:

- amigos,
- solicitudes,
- búsqueda.

Operaciones:

- stream de amigos,
- stream de pendientes,
- buscar usuarios,
- enviar solicitud,
- aceptar/rechazar,
- eliminar amistad.

### 12.31 Minigames

Contiene dos minijuegos:

- Dados de Hades
- Ruleta del Destino

Dados:

- apuesta configurable,
- dobles x5,
- suma >= 10 x2,
- suma < 10 pierde.

Ruleta:

- premios instantáneos,
- Óbolos,
- consumibles,
- fragmentos,
- jackpot de 1000 Óbolos + 2 fragmentos.

## 13. Sistema de trivias: contenido real

Base local real:

- **5 niveles**
- **51 arenas**
- **320 preguntas locales**
- más el modo IA infinito

### 13.1 Nivel Humano

12 arenas, 105 preguntas:

- Arena 1: Despertar Shonen — 50
- Arena 2: Iniciación Gamer — 5
- Arena 3: Mitos Clásicos — 5
- Arena 4: Cine y Animación — 5
- Arena 5: Música y Openings — 5
- Arena 6: Mascotas y Compañeros — 5
- Arena 7: Comida y Banquetes — 5
- Arena 8: Deportes y Juegos — 5
- Arena 9: Mechas y Robots — 5
- Arena 10: Isekai y Reencarnación — 5
- Arena 11: Otaku Supremo — 5
- Arena 12: Maestro de Novelas Visuales — 5

### 13.2 Caballero de Bronce

9 arenas, 50 preguntas:

- Arena 1: Torneo Galáctico — 10
- Arena 3: Armaduras y Cosmos — 5
- Arena 4: Armas y Reliquias — 5
- Arena 5: Técnicas de Combate — 5
- Arena 6: Transformaciones — 5
- Arena 7: Torneos y Exámenes — 5
- Arena 8: Maestros y Mentores — 5
- Arena 9: Rivales Legendarios — 5
- Arena 10: Objetos Mágicos — 5

### 13.3 Caballero de Plata

10 arenas, 55 preguntas:

- Arena 1: Santuario — 10
- Arena 2: Secretos de Runaterra — 5
- Arena 3: Maestros del Nen — 5
- Arena 4: Estrategia y Táctica — 5
- Arena 5: Geografía y Mundos — 5
- Arena 6: Organizaciones Secretas — 5
- Arena 7: Magia y Sistemas de Poder — 5
- Arena 8: E-Sports y Competitivo — 5
- Arena 9: Dioses y Deidades — 5
- Arena 10: Viajes en el Tiempo — 5

### 13.4 Espectro

10 arenas, 55 preguntas:

- Arena 1: Prisión del Cocytos — 10
- Arena 2: Jueces del Infierno — 5
- Arena 3: Oscuridad Profunda — 5
- Arena 4: El Lado Oscuro — 5
- Arena 5: Muertes y Sacrificios — 5
- Arena 6: Finales Trágicos — 5
- Arena 7: Monstruos y Demonios — 5
- Arena 8: Traiciones y Engaños — 5
- Arena 9: Sacrificios Heroicos — 5
- Arena 10: Villanos Incomprendidos — 5

### 13.5 Dios

10 arenas, 55 preguntas:

- Arena 1: Campos Elíseos — 10
- Arena 2: Hipermito — 5
- Arena 3: Secretos de los Dioses — 5
- Arena 4: Creadores y Estudios — 5
- Arena 5: Doblaje y Seiyuus — 5
- Arena 6: Lore Oculto de LoL — 5
- Arena 7: Mitología en Saint Seiya — 5
- Arena 8: Creadores y Estudios — 5
- Arena 9: Curiosidades de Desarrollo — 5
- Arena 10: Lore Profundo (Nivel Experto) — 5

### 13.6 Modo IA

El Oráculo usa `generateInfiniteTrivia()` con Gemini para generar preguntas JSON.

Parámetros observados:

- topic
- count
- difficulty

En `Trivia.tsx` se invoca actualmente con:

- tema Saint Seiya
- 5 preguntas
- dificultad Difícil

## 14. Base de datos y colecciones Firestore usadas por el código

Colecciones reales referenciadas:

- `users`
- `messages`
- `private_messages`
- `triviaScores`
- `friendships`
- `guilds`
- `guildNodes`
- `guildWars`
- `auction_listings`
- `pvp_challenges`
- `game_state`
- `faction_bases`
- `world_boss`
- `seasons/{seasonId}/rankings`

## 15. PWA, despliegue y sistema

### 15.1 PWA

El proyecto tiene dos fuentes de manifiesto:

- `public/manifest.json`
- manifiesto generado por `vite-plugin-pwa`

Capacidades PWA presentes:

- `registerSW`
- `manifest.webmanifest`
- `sw.js`
- iconos
- shortcuts a:
  - Trivia
  - Perfil
  - Chat

### 15.2 Service worker de notificaciones

`public/firebase-messaging-sw.js`:

- inicializa Firebase messaging,
- escucha `push`,
- muestra notificación,
- abre `/` al hacer click.

### 15.3 API

`api/status.ts` responde:

- `status`
- `region`
- `timestamp`
- `query`
- `cookies`
- `body`

### 15.4 Despliegue

`vercel.json` indica:

- framework `vite`
- rewrites para `/api/*`
- fallback SPA a `/index.html`
- `cleanUrls`

## 16. Seguridad y reglas

`firestore.rules` define:

- helpers de autenticación y admin,
- validación mínima de `users`,
- validación de `messages`,
- validación de `triviaScores`,
- permisos para `auction_listings`,
- permisos para `guilds`,
- permisos para `guildNodes`,
- permisos para `game_state`,
- permisos para `faction_bases`,
- permisos para `pvp_challenges`,
- permisos para `world_boss`,
- permisos para `private_messages`.

## 17. Estado técnico real del proyecto

Esta sección es importante porque refleja la situación del código actual, no solo la intención funcional.

### 17.1 Validación ejecutada

Resultado real:

- `npm run build`: **sí compila**
- `npm run lint` (`tsc --noEmit`): **falla**

Motivo visible del fallo:

- `src/lib/elements.ts` contiene JSX pero usa extensión `.ts` en lugar de `.tsx`

### 17.2 Observaciones técnicas detectadas en la revisión

#### 17.2.1 Módulos o rutas con alto riesgo de fallo lógico o de integración

- `src/lib/engine.ts` tiene un typo entre `unlockedAchiements` y `unlockedAchievements`; esto compromete el sistema de logros.
- `src/pages/Guilds.tsx` usa `<Map />` sin importarlo desde `lucide-react`.
- `src/lib/notifications.ts` importa `app` desde `@/lib/firebase`, pero ese archivo no exporta `app`.
- el mismo módulo de notificaciones intenta usar Firestore vía import dinámico equivocado, por lo que no está listo para funcionar tal cual.

#### 17.2.2 Desalineaciones entre reglas Firestore y el código cliente

- reglas de `guilds` usan `ownerId`, pero el código maneja `leaderId`.
- reglas de `private_messages` esperan `senderId` y `receiverId`, pero `Chat.tsx` escribe solo `uid`, `chatId`, `text`, `specterName`, `photoURL`, `createdAt`.
- `game_state`, `faction_bases` y `world_boss` están restringidos a admin en reglas, pero varias páginas intentan escribir ahí desde cliente normal:
  - `Raids`
  - `Territories`
  - `FactionBase`
  - `WorldBoss`

#### 17.2.3 Configuración y credenciales

- `firebase.ts` tiene fallbacks de configuración Firebase embebidos.
- `gemini.ts` contiene fallback de API key en código.
- `public/firebase-messaging-sw.js` también lleva configuración Firebase embebida.
- `.env.example` no refleja todas las variables Vite que el código podría usar.

#### 17.2.4 Tamaño del bundle

Build observado:

- JS principal minificado aproximado: **1.65 MB**

Vite muestra advertencia por chunk grande, lo que indica oportunidad clara de:

- code splitting,
- lazy loading por rutas,
- separación de modos pesados.

#### 17.2.5 Componentes/utilidades existentes pero no plenamente integrados

Existen piezas reutilizables que todavía no están adoptadas de forma consistente:

- `GameHUD`
- `useGameLoop`
- `ScreenEffects`
- `ParticleSystem`
- utilidades de elementos duplicadas entre archivos

## 18. Conclusión

**HADES-108** es, en su estado actual, un proyecto muy ambicioso y con bastante contenido real ya implementado. No es un prototipo vacío: tiene identidad fuerte, muchas páginas, persistencia, base de trivias local, generación de contenido con IA, economía, progresión, PvE, PvP y social.

Al mismo tiempo, también es un proyecto con rasgos de expansión rápida:

- mucha funcionalidad vive directamente en frontend,
- hay módulos muy completos conviviendo con otros todavía inmaduros,
- existen desalineaciones entre reglas, tipos y comportamiento real,
- y la experiencia total ya es grande como para necesitar una fase clara de estabilización técnica.

En resumen:

- **qué es**: un RPG web de trivias temático de Saint Seiya/Hades;
- **qué tiene**: 31 páginas, sistemas RPG/sociales, 51 arenas locales, 320 preguntas, IA, PWA, Firebase;
- **qué lo distingue**: una fantasía visual y jugable muy marcada;
- **qué le falta para estar sólido al 100%**: pulido técnico, alineación de reglas/persistencia y reducción de deuda interna.

## 19. Archivos clave revisados para este documento

### Núcleo

- `src/App.tsx`
- `src/main.tsx`
- `src/context/AuthContext.tsx`
- `src/components/Layout.tsx`
- `src/components/DashboardHub.tsx`

### Páginas

- todos los archivos de `src/pages`

### Datos y librerías

- `src/data/trivias.ts`
- `src/data/achievements.ts`
- `src/data/flashEvents.ts`
- `src/lib/*.ts`

### Infraestructura

- `api/status.ts`
- `public/manifest.json`
- `public/firebase-messaging-sw.js`
- `vite.config.ts`
- `vercel.json`
- `firestore.rules`
