# 🚀 PLAN DE MEJORAS FUTURAS - HADES-108

## ✅ FEATURES IMPLEMENTADAS EN ESTA SESIÓN

### 1. **Combo/Streak System** ✅
- **Descripción:** Multiplicador de puntos por respuestas consecutivas correctas
- **Multiplicadores:** x1.5 (3+), x2.0 (5+), x3.0 (10+)
- **Visualización:** HUD con fuego y texto dinámico
- **Impacto:** Alto | **Esfuerzo:** Bajo

### 2. **Avatar Visual tipo Diablo** ✅  
- **Descripción:** Personaje visible en la Armería con equipo equipado
- **Features:**
  - Silueta SVG del personaje
  - Iconos de equipo con colores por rareza
  - Efectos de brillo según rareza (Común → Mítico)
  - Tooltips al hover
- **Impacto:** Alto | **Esfuerzo:** Medio

### 3. **Sincronización de Estado Corregida** ✅
- Inventario y Fragmentos de Memoria ahora se guardan correctamente
- Profile.tsx muestra datos dinámicos reales

---

## 📋 FEATURES PRIORIZADAS PARA IMPLEMENTAR

### PRIORIDAD 1 - CRÍTICO (Esta Semana)

#### 1.1 Daily Login Rewards (7 días)
- **Descripción:** Calendario de recompensas por login consecutivo
- **Recompensas:**
  - Día 1: 100 Óbolos
  - Día 2: Poción de Tiempo
  - Día 3: Fragmento de Memoria
  - Día 4: 200 Óbolos
  - Día 5: Gema Aleatoria
  - Día 6: Cofre de Equipo
  - Día 7: Recompensa Premium (500 Óbolos + Item Épico)
- **Impacto:** Alto | **Esfuerzo:** Bajo
- **Archivos:** `src/context/AuthContext.tsx`, `src/pages/Home.tsx`

#### 1.2 Sistema de Referidos
- **Descripción:** Código único por jugador, recompensas para ambos
- **Features:**
  - Código de referido único (primeros 8 chars del UID)
  - Panel de seguimiento
  - Recompensas: 200 Óbolos + Título exclusivo
- **Impacto:** Alto | **Esfuerzo:** Bajo
- **Archivos:** `src/context/AuthContext.tsx`, `src/pages/Profile.tsx`

#### 1.3 Sistema de Logros Expandido
- **Descripción:** 100+ logros categorizados
- **Categorías:**
  - Combate (trivias ganadas, combos, etc.)
  - Social (mensajes, amigos, guilds)
  - Exploración (páginas visitadas, modos de juego)
  - Colección (equipe obtenido, fragmentos)
  - Maestría (niveles, prestigio)
- **Impacto:** Alto | **Esfuerzo:** Medio
- **Archivos:** `src/lib/engine.ts`, `src/pages/Profile.tsx`

#### 1.4 Eventos Temporales / Flash Events
- **Descripción:** Eventos de 24-48h con recompensas especiales
- **Ejemplos:**
  - "Eclipse de Hades": Doble XP en trivias
  - "Marea de Almas": Mejores drops en pesca
  - "Noche de los Espectros": Recompensas triples en Battle Royale
- **Implementación:** Colección Firestore `events` con fecha de inicio/fin
- **Impacto:** Alto | **Esfuerzo:** Medio
- **Archivos:** `src/lib/cataclysms.ts`, `src/pages/Home.tsx`

---

### PRIORIDAD 2 - ALTO (Próximas 2 Semanas)

#### 2.1 Tutorial Guiado (Onboarding)
- **Descripción:** Tutorial paso-a-paso para nuevos jugadores
- **Features:**
  - Tour interactivo por la app
  - Explicación de mecánicas básicas
  - Primera trivia guiada
  - Sistema de "primera vez" por página
- **Impacto:** Alto | **Esfuerzo:** Medio
- **Archivos:** `src/components/Onboarding.tsx`, `src/context/AuthContext.tsx`

#### 2.2 Dashboard/Hub Central
- **Descripción:** Reemplazar landing page con dashboard personalizado
- **Features:**
  - Misiones diarias pendientes
  - Evento activo
  - Notificaciones recientes
  - Resumen de progreso
  - Acceso rápido a 3 actividades más jugadas
  - Estado del World Boss
  - Ranking de guild
- **Impacto:** Alto | **Esfuerzo:** Medio
- **Archivos:** `src/pages/Home.tsx`

#### 2.3 Sistema de Amigos
- **Descripción:** Enviar/recibir solicitudes de amistad
- **Features:**
  - Lista de amigos con estado (online/offline/en partida)
  - Ver perfil de amigos
  - Bonus: +10% XP al jugar juntos
  - "Invitar a trivia" directo
- **Impacto:** Alto | **Esfuerzo:** Medio
- **Archivos:** Nueva colección `friendships`, `src/pages/Friends.tsx`

#### 2.4 Notificaciones Push
- **Descripción:** Firebase Cloud Messaging
- **Triggers:**
  - Misiones diarias sin completar (recordatorio)
  - Eventos temporales que inician
  - Alguien te reta en PvP
  - Guild conquista un nodo
  - World Boss activo
- **Impacto:** Alto | **Esfuerzo:** Medio
- **Archivos:** `firebase-messaging.ts`, service worker

#### 2.5 PWA Completa
- **Descripción:** Progressive Web App
- **Features:**
  - Service worker configurado
  - manifest.json
  - Offline caching
  - Install prompt
- **Impacto:** Alto | **Esfuerzo:** Bajo
- **Archivos:** `vite.config.ts`, `public/manifest.json`

---

### PRIORIDAD 3 - MEDIO (Próximo Mes)

#### 3.1 Seasonal Rankings
- **Descripción:** Clasificaciones por temporada (mensual)
- **Features:**
  - Reset mensual
  - Recompensas exclusivas para top players
  - Títulos de temporada
  - Marcos de perfil
- **Impacto:** Alto | **Esfuerzo:** Medio

#### 3.2 Guild Wars
- **Descripción:** Guerra entre guilds
- **Features:**
  - Desafío entre 2 guilds
  - Puntaje total del guild determina ganador
  - Control temporal de recurso
  - Bonus de XP para miembros
- **Impacto:** Alto | **Esfuerzo:** Alto

#### 3.3 Minijuegos Casuales
- **Descripción:** Romper monotonía de trivias
- **Juegos:**
  - "Dados de Hades": Azar con obolos
  - "Memoria del Cocytos": Juego de cartas
  - "Ruleta del Destino": Spin diario
- **Impacto:** Medio | **Esfuerzo:** Medio

#### 3.4 Chat de Guild
- **Descripción:** Canal exclusivo de escuadrón
- **Features:**
  - Chat de texto
  - Pizarra de anuncios
  - Calendario de eventos
- **Impacto:** Alto | **Esfuerzo:** Bajo

#### 3.5 Crafting Receta-Driven
- **Descripción:** Sistema de recetas en Forge
- **Features:**
  - Combinar materiales para crear items
  - Recetas descubribles
  - Blueprints como items coleccionables
- **Impacto:** Medio | **Esfuerzo:** Medio

---

### PRIORIDAD 4 - BAJO (Futuro)

#### 4.1 BattleRoyale Multijugador Real
- **Descripción:** Matchmaking con Firebase Realtime Database
- **Impacto:** Medio | **Esfuerzo:** Alto

#### 4.2 Premium Battle Pass
- **Descripción:** Versión premium con doble recompensa
- **Precio:** $3-5 USD por temporada
- **Impacto:** Alto | **Esfuerzo:** Bajo

#### 4.3 Tienda Premium (Cosméticos)
- **Descripción:** Moneda real para cosméticos
- **Items:** Auras, marcos animados, efectos de chat, temas UI, mascotas
- **Impacto:** Alto | **Esfuerzo:** Medio

#### 4.4 Sistema de Mentor/Aprendiz
- **Descripción:** Veteranos guían a nuevos jugadores
- **Impacto:** Medio | **Esfuerzo:** Medio

#### 4.5 Modo Spectator / Replay
- **Descripción:** Ver partidas de otros jugadores
- **Impacto:** Bajo | **Esfuerzo:** Alto

---

## 📊 ESTADO ACTUAL DEL PROYECTO

| Feature | Estado | Notas |
|---------|--------|-------|
| Autenticación | ✅ Funcional | Google Auth |
| Trivias | ✅ Corregido | Sincronización + Combo System |
| Misiones Diarias | ✅ Corregido | Progreso dinámico |
| Inventario | ✅ Corregido | Se guarda y muestra correctamente |
| Fragmentos de Memoria | ✅ Corregido | Sincronización arreglada |
| Responsive | ✅ Corregido | Menú móvil |
| Chat | ✅ Corregido | Mensajes privados |
| Reglas Firestore | ✅ Corregido | 8 colecciones agregadas |
| **Armería** | ✅ **NUEVO** | **Avatar Visual tipo Diablo** |
| **Combo System** | ✅ **NUEVO** | **Multiplicadores x1.5/x2/x3** |
| Equipment Sync | ✅ Corregido | Usa saveUserProfile |
| Daily Login | ⏳ Pendiente | Alta prioridad |
| Referidos | ⏳ Pendiente | Alta prioridad |
| Logros Expandidos | ⏳ Pendiente | Media prioridad |
| Eventos Temporales | ⏳ Pendiente | Media prioridad |
| Tutorial | ⏳ Pendiente | Alta prioridad |
| Dashboard | ⏳ Pendiente | Alta prioridad |
| Amigos | ⏳ Pendiente | Media prioridad |
| PWA | ⏳ Pendiente | Alta prioridad |

---

## 🎯 ROADMAP RECOMENDADO

### **Semana 1 (Inmediato)**
1. ✅ ~~Combo System~~
2. ✅ ~~Avatar Visual Diablo~~
3. Daily Login Rewards
4. Sistema de Referidos
5. PWA Completa

### **Semana 2-3**
1. Sistema de Logros Expandido
2. Eventos Temporales
3. Tutorial Guiado
4. Dashboard/Hub Central

### **Mes 2**
1. Sistema de Amigos
2. Notificaciones Push
3. Seasonal Rankings
4. Guild Wars (fase 1)

### **Mes 3**
1. Guild Wars (completo)
2. Minijuegos Casuales
3. Chat de Guild
4. Crafting Receta-Driven

---

## 💡 IDEAS ADICIONALES DE MEJORA

### UX/UI
- [ ] Tema claro/oscuro toggle
- [ ] Animaciones de carga personalizadas
- [ ] Sonidos configurables por tipo
- [ ] Accesibilidad (textos más grandes, alto contraste)
- [ ] Búsqueda global en toda la app

### Técnico
- [ ] Migrar a Zustand para state management
- [ ] Tests unitarios para motor RPG
- [ ] Cloud Functions para validación server-side
- [ ] Rate limiting anti-cheat
- [ ] Analytics y telemetría

### Monetización
- [ ] Soporte / Donaciones (Ko-fi/BuyMeACoffee)
- [ ] Starter Packs
- [ ] Premium Battle Pass
- [ ] Tienda de cosméticos

### Retención
- [ ] Recordatorios por email
- [ ] Contenido rotativo semanal
- [ ] Progresión horizontal (side-grading)
- [ ] Sistema de energía "Cosmo Vital"

---

## 📝 NOTAS FINALES

### Bugs Conocidos (Menores)
1. Algunas páginas aún pueden tener el bug de sincronización (17 páginas restantes)
2. Labyrinth.tsx tiene lógica de muerte incompleta
3. BattleRoyale es simulado, no multijugador real

### Deuda Técnica
1. AuthContext sobrecargado → Migrar a Zustand
2. Sin validación server-side → Cloud Functions
3. Queries N+1 → Paginación y caching
4. Sin tests → Vitest + React Testing Library

### Recomendaciones
1. **Implementar gradualmente:** No intentar hacer todo a la vez
2. **Testing continuo:** Probar cada feature antes de subir
3. **Comunicar cambios:** Anunciar nuevas features en el chat global
4. **Recopilar feedback:** Preguntar a los usuarios qué quieren
5. **Analytics:** Instalar Vercel Analytics para trackear uso

---

**Generado:** 2026-04-13  
**Versión del Proyecto:** 1.2.0  
**Últimos Commits:** 
- `e65ccc5` - Avatar Visual tipo Diablo
- `e534a36` - Combo/Streak System
- `364a1de` - Corrección de sincronización de inventario

**Próximos Pasos:** Implementar Daily Login Rewards + Sistema de Referidos
