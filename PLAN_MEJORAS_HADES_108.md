# Plan Detallado de Mejora - Hades 108

## 1. Vision General

El proyecto ya tiene una base fuerte: identidad del espectro, Arena, Torre, Laberinto, modos sociales, armeria, economia y progreso persistente con Firebase. El siguiente salto no debe ser "agregar por agregar", sino convertir Hades 108 en un juego con:

- mayor identidad de personaje
- mejor retencion diaria y semanal
- mas profundidad de progresion
- mejor lectura de recompensas
- mas eventos de comunidad
- menos puntos fragiles a nivel tecnico

## 2. Lo Nuevo Mas Valioso para Agregar

### 2.1 Sistema de los 108 Espectros

- Completar fichas narrativas para los 108 espectros.
- Agregar rareza narrativa por legion: jueces, elite, avanzados, base.
- Permitir "despertar" de habilidad del espectro en 3 niveles.
- Crear afinidades de espectro contra tipos de enemigos o elementos.
- Habilitar "coleccion de espectros" con bonus por descubrir familias completas.

### 2.2 Progresion de Personaje

- Arbol de talentos separado por ofensiva, control, supervivencia y botin.
- Sistema de maestrias por modo de juego.
- Recompensas por hitos de nivel cada 5 niveles.
- Sistema de ascension con temporadas.
- Build presets para cambiar entre Arena, Torre y Laberinto.

### 2.3 Equipamiento

- Sets completos con bonus de 2 y 3 piezas.
- Salvado de presets de equipo.
- Comparador visual de stats antes de equipar.
- Historial de equipo obtenido.
- Sistema de reciclaje para convertir equipo en materiales.
- Tooltip mas claro para rareza, set, sockets y encantamientos.

### 2.4 Modos de Juego

- Arena:
  - cadenas de enemigos con modificadores semanales
  - arenas tematicas por saga
  - mini jefes por ronda
- Torre:
  - bendiciones entre pisos
  - tiendas temporales cada 5 pisos
  - eventos sorpresa
- Laberinto:
  - nodos de riesgo/recompensa
  - niebla de guerra real
  - reliquias temporales por run
- World Boss:
  - fases cooperativas
  - tabla de contribucion por faccion
  - recompensas por rol: dano, soporte, supervivencia
- Battle Royale:
  - eventos de mapa
  - cajas aleatorias
  - tormenta progresiva
- Secret Bosses / Primordiales:
  - condiciones de invocacion especiales
  - recompensas unicas por primera victoria
  - diario de bestiario

### 2.5 Comunidad y Social

- Perfiles publicos con historial de logros.
- Rankings por modo, faccion, temporada y espectro.
- Desafios de amistad.
- Misiones de guild.
- Guerra Santa con temporadas y premios de cierre.
- Canales de chat por guild, faccion y comercio.

### 2.6 Economia

- Mas usos para obolos, fragmentos y materiales.
- Subastas con expiracion visual.
- Mercado negro rotativo diario.
- Economia de crafting con recetas.
- Vendedores por region o prision del inframundo.

### 2.7 Live Ops y Retencion

- calendario semanal de eventos
- login rewards mas profundos
- contratos diarios y semanales
- misiones de faccion
- pases de temporada con desafios unicos
- rotacion de bonus por dias

## 3. Lo Que Mas Conviene Mejorar Ahora

### 3.1 UX / UI

- Mostrar mas claro que recompensa acaba de caer y donde verla.
- Mostrar comparacion de equipo al instante.
- Mejorar feedback de efectos activos.
- Estandarizar mensajes de exito, error y advertencia.
- Agregar indicadores persistentes de habilidad de espectro, pasiva de faccion y poder primordial.

### 3.2 Claridad del Progreso

- Barra de progreso de nivel mas visible.
- Historial de recompensas recientes.
- Pantalla de resumen al terminar cada run.
- Vista de coleccion de espectros y primordiales derrotados.

### 3.3 Contenido

- Mas preguntas por arena para evitar repeticion.
- Pools de preguntas por saga, personaje, tecnica y manga/anime.
- Boss modifiers por temporada.
- Variantes de jefes y enemigos por dificultad.

### 3.4 Balance

- Revisar drops para que no haya exceso o escasez.
- Ajustar curvas de XP y obolos.
- Medir si ciertas facciones o habilidades dominan demasiado.
- Balancear Torre para que la dificultad suba mejor entre pisos.

## 4. Revision por Modulo

### 4.1 Perfil

Mejoras recomendadas:
- buscador de espectros
- filtros por ejercito y legion
- galeria completa de emblemas
- historial de cambios de identidad

### 4.2 Armeria / Forja

Mejoras recomendadas:
- comparador de items
- locking de piezas
- filtros por tipo, rareza, set y elemento
- ordenamiento por poder real
- accion rapida: equipar, vender, reciclar, mejorar

### 4.3 Arena

Mejoras recomendadas:
- mutaciones por ronda
- bendiciones previas a la batalla
- log de dano, loot y bonos aplicados
- enemigos con resistencia elemental propia

### 4.4 Torre

Mejoras recomendadas:
- reliquias temporales por run
- puntos de descanso
- comerciar entre pisos
- resumen por piso superado

### 4.5 Laberinto

Mejoras recomendadas:
- eventos tipo roguelite
- trampas visibles e invisibles
- caminos secretos
- recompensas por exploracion completa

### 4.6 Primordiales / Secret Bosses

Mejoras recomendadas:
- enciclopedia de jefes
- animacion de invocacion
- debilidades y resistencias visibles
- tiers de dificultad por jefe

### 4.7 Chat / Friends / Guilds

Mejoras recomendadas:
- invitaciones rapidas a partidas
- estado online real
- rol dentro de guild
- historial de guild wars

### 4.8 Auction House / Economia

Mejoras recomendadas:
- filtro por rareza y precio
- historial de ventas
- comision visible
- compras recientes destacadas

## 5. Prioridad Recomendada

### Fase 1 - Alta prioridad

- consolidar sistema de 108 espectros
- aplicar habilidades de espectro en mas modos
- mejorar armeria y comparacion de equipo
- reforzar paneles de resumen de run
- agregar telemetria basica de errores y economia

### Fase 2 - Muy valiosa

- sistema de sets
- reliquias temporales
- guild missions
- eventos semanales
- leaderboard por temporada

### Fase 3 - Expansion fuerte

- raids por faccion
- territorios con bonus reales
- crafting complejo
- bestiario completo
- codex del inframundo

## 6. Plan Tecnico

### 6.1 Frontend

- separar logica compartida de combate en helpers
- reducir duplicacion entre Arena y Torre
- unificar toasts, efectos y calculos de bonus
- agregar pruebas de componentes criticos

### 6.2 Firebase

- endurecer reglas con validaciones mas finas
- indexar consultas frecuentes
- monitorear tamano de documentos de usuario
- mover eventos complejos a Cloud Functions cuando sea necesario

### 6.3 Calidad

- test de humo por modulo
- checklist de QA por release
- logs de errores del cliente
- dashboard de salud de funciones compartidas

### 6.4 Performance

- code splitting por rutas grandes
- carga diferida de modulos pesados
- optimizar bundle de trivia y modos IA
- cachear catlogos estaticos

## 7. Roadmap Sugerido de Ejecucion

### Sprint 1

- sistema de 108 espectros
- logos unicos
- habilidades pasivas base
- mejoras visuales del perfil

### Sprint 2

- comparador de equipo
- sets y bonus
- resumen avanzado de Arena y Torre
- mejoras de drop y economia

### Sprint 3

- eventos semanales
- guild objectives
- ranking por espectro
- codex de primordiales

### Sprint 4

- crafting profundo
- presets de build
- raids cooperativas
- telemetria y balance automatizado

## 8. Checklist de Cierre por Cada Entrega

- build ok
- lint ok
- reglas de Firebase revisadas
- documento de cambios actualizado
- QA manual de Perfil, Arena, Torre, Armeria y Primordiales
- verificacion de persistencia en Firestore

## 9. Recomendacion Final

Lo mejor que podemos hacer es mantener una regla simple:

- cada nueva feature debe tocar progreso, identidad o retencion
- cada modo nuevo debe compartir sistemas ya existentes
- cada recompensa debe sentirse visible, util y deseable

Si seguimos esa linea, Hades 108 puede crecer sin volverse inconsistente ni fragil.
