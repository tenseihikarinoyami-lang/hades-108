export type DifficultyLevel = 'Humano' | 'Caballero de Bronce' | 'Caballero de Plata' | 'Espectro' | 'Dios';

export interface TriviaQuestion {
  q: string;
  options: string[];
  answer: number;
  bgImage: string;
}

export interface TriviaArena {
  id: string;
  title: string;
  description: string;
  questions: TriviaQuestion[];
}

export interface TriviaLevel {
  id: string;
  name: DifficultyLevel;
  description: string;
  arenas: TriviaArena[];
}

// Helper to generate empty arenas to fulfill the 10 arenas per level requirement
const generateEmptyArenas = (levelPrefix: string, count: number, startIndex: number): TriviaArena[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${levelPrefix}-arena-${startIndex + i}`,
    title: `Arena ${startIndex + i}: Desafío Sellado`,
    description: "Esta arena aún no ha sido desbloqueada por los dioses.",
    questions: []
  }));
};

// We define the structure for 5 levels, 10 arenas each (50 arenas total).
// Due to size constraints, we populate the first arena of each level with 5 questions.
// You can easily add more questions to the arrays below following the same format.
export const TRIVIA_DATABASE: TriviaLevel[] = [
  {
    id: "level-1",
    name: "Humano",
    description: "Nivel Fácil. Conocimientos básicos del mundo mortal.",
    arenas: [
      {
        id: "humano-arena-1",
        title: "Arena 1: Despertar Shonen",
        description: "Preguntas básicas sobre animes populares.",
        questions: [
          {
            q: "¿Quién es el protagonista principal de Dragon Ball?",
            options: ["Vegeta", "Goku", "Gohan", "Piccolo"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1601850494422-3fb19e130c55?w=800&q=80"
          },
          {
            q: "¿Cómo se llama la aldea donde vive Naruto?",
            options: ["Aldea de la Arena", "Aldea de la Niebla", "Aldea de la Hoja", "Aldea del Sonido"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80"
          },
          {
            q: "¿Qué tipo de Pokémon es Pikachu?",
            options: ["Agua", "Fuego", "Planta", "Eléctrico"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800&q=80"
          },
          {
            q: "¿En League of Legends, qué carril suele ocupar el ADC?",
            options: ["Top", "Mid", "Jungla", "Bot"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
          },
          {
            q: "¿Cuál es el nombre del barco de los Piratas de Sombrero de Paja?",
            options: ["Going Merry", "Moby Dick", "Red Force", "Oro Jackson"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80"
          },
          {
            q: "¿Qué animal es el compañero de Ash Ketchum?",
            options: ["Un perro", "Un ratón eléctrico", "Un gato", "Un pájaro"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&q=80"
          },
          {
            q: "¿Cuál es el sueño de Naruto Uzumaki?",
            options: ["Ser el más rico", "Ser Hokage", "Destruir la aldea", "Encontrar el One Piece"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1580477659154-081c988862d2?w=800&q=80"
          },
          {
            q: "¿Qué deporte se juega en el anime 'Haikyuu!!'?",
            options: ["Fútbol", "Baloncesto", "Voleibol", "Béisbol"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80"
          },
          {
            q: "¿Quién es el rival principal de Yugi Muto?",
            options: ["Joey Wheeler", "Seto Kaiba", "Maximillion Pegasus", "Marik Ishtar"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          },
          {
            q: "¿En qué anime los personajes usan 'Equipos de Maniobras Tridimensionales'?",
            options: ["Sword Art Online", "Attack on Titan", "Tokyo Ghoul", "Bleach"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80"
          },
          { q: "¿Quién es el autor de One Piece?", options: ["Masashi Kishimoto", "Eiichiro Oda", "Akira Toriyama", "Tite Kubo"], answer: 1, bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Bleach?", options: ["Ichigo Kurosaki", "Uryu Ishida", "Yasutora Sado", "Renji Abarai"], answer: 0, bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80" },
          { q: "¿Qué anime trata sobre un cuaderno que mata personas?", options: ["Code Geass", "Death Note", "Monster", "Psycho-Pass"], answer: 1, bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80" },
          { q: "¿Quién es el hermano de Edward Elric?", options: ["Roy Mustang", "Alphonse Elric", "Scar", "Envy"], answer: 1, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Hunter x Hunter?", options: ["Killua", "Kurapika", "Leorio", "Gon"], answer: 3, bgImage: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&q=80" },
          { q: "¿Qué anime tiene como protagonistas a Tanjiro y Nezuko?", options: ["Jujutsu Kaisen", "Demon Slayer", "Black Clover", "Fire Force"], answer: 1, bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80" },
          { q: "¿Quién es el protagonista de My Hero Academia?", options: ["Bakugo", "Todoroki", "Midoriya", "Kirishima"], answer: 2, bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80" },
          { q: "¿Cómo se llama el espíritu que acompaña a Yoh Asakura?", options: ["Amidamaru", "Bason", "Tokageroh", "Matamune"], answer: 0, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿Qué anime trata sobre un mundo virtual llamado Aincrad?", options: ["Log Horizon", "Sword Art Online", "Overlord", "Accel World"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿Quién es el capitán de los Siete Pecados Capitales?", options: ["Ban", "King", "Meliodas", "Escanor"], answer: 2, bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Black Clover?", options: ["Yuno", "Noelle", "Asta", "Yami"], answer: 2, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" },
          { q: "¿Qué anime trata sobre un detective que encoge por un veneno?", options: ["Detective Conan", "Lupin III", "Kindaichi", "Sherlock"], answer: 0, bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80" },
          { q: "¿Quién es el protagonista de JoJo's Bizarre Adventure Parte 3?", options: ["Jonathan Joestar", "Joseph Joestar", "Jotaro Kujo", "Josuke Higashikata"], answer: 2, bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Tokyo Ghoul?", options: ["Touka Kirishima", "Ken Kaneki", "Shuu Tsukiyama", "Hideyoshi Nagachika"], answer: 1, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Qué anime trata sobre un grupo de huérfanos que escapan de una granja?", options: ["The Promised Neverland", "Made in Abyss", "Seraph of the End", "Dr. Stone"], answer: 0, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" },
          { q: "¿Quién es el protagonista de Dr. Stone?", options: ["Taiju", "Senku", "Tsukasa", "Gen"], answer: 1, bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Jujutsu Kaisen?", options: ["Megumi Fushiguro", "Nobara Kugisaki", "Yuji Itadori", "Satoru Gojo"], answer: 2, bgImage: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80" },
          { q: "¿Qué anime trata sobre un mundo donde el 80% tiene superpoderes?", options: ["One Punch Man", "My Hero Academia", "Mob Psycho 100", "Fire Force"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80" },
          { q: "¿Quién es el protagonista de Fire Force?", options: ["Arthur Boyle", "Shinra Kusakabe", "Maki Oze", "Takehisa Hinawa"], answer: 1, bgImage: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Mob Psycho 100?", options: ["Reigen", "Shigeo Kageyama", "Ritsu", "Teru"], answer: 1, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" },
          { q: "¿Qué anime trata sobre un samurái con una espada de filo invertido?", options: ["Rurouni Kenshin", "Samurai Champloo", "Gintama", "Afro Samurai"], answer: 0, bgImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80" },
          { q: "¿Quién es el protagonista de Gintama?", options: ["Shinpachi", "Kagura", "Gintoki Sakata", "Hijikata"], answer: 2, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Cowboy Bebop?", options: ["Jet Black", "Spike Spiegel", "Faye Valentine", "Edward"], answer: 1, bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80" },
          { q: "¿Qué anime trata sobre un grupo de piratas espaciales?", options: ["Outlaw Star", "Cowboy Bebop", "Trigun", "Space Dandy"], answer: 1, bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80" },
          { q: "¿Quién es el protagonista de Trigun?", options: ["Wolfwood", "Vash the Stampede", "Knives", "Meryl"], answer: 1, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Hellsing?", options: ["Seras Victoria", "Alucard", "Integra Hellsing", "Alexander Anderson"], answer: 1, bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80" },
          { q: "¿Qué anime trata sobre una guerra por el Santo Grial?", options: ["Fate/Stay Night", "Magi", "The Magi's Grandson", "Re:Creators"], answer: 0, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Quién es el protagonista de Fate/Zero?", options: ["Shirou Emiya", "Kiritsugu Emiya", "Rin Tohsaka", "Saber"], answer: 1, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Steins;Gate?", options: ["Kurisu Makise", "Rintaro Okabe", "Mayuri Shiina", "Itaru Hashida"], answer: 1, bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" },
          { q: "¿Qué anime trata sobre viajes en el tiempo usando un microondas?", options: ["Erased", "Steins;Gate", "Tokyo Revengers", "Orange"], answer: 1, bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" },
          { q: "¿Quién es el protagonista de Tokyo Revengers?", options: ["Mikey", "Draken", "Takemichi Hanagaki", "Baji"], answer: 2, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Blue Exorcist?", options: ["Yukio Okumura", "Rin Okumura", "Shiemi Moriyama", "Mephisto Pheles"], answer: 1, bgImage: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80" },
          { q: "¿Qué anime trata sobre el hijo de Satanás que quiere ser exorcista?", options: ["Soul Eater", "Blue Exorcist", "D.Gray-man", "Noragami"], answer: 1, bgImage: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80" },
          { q: "¿Quién es el protagonista de Soul Eater?", options: ["Maka Albarn", "Soul Evans", "Black Star", "Death the Kid"], answer: 0, bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Noragami?", options: ["Hiyori Iki", "Yukine", "Yato", "Bishamon"], answer: 2, bgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80" },
          { q: "¿Qué anime trata sobre un dios menor que hace trabajos por 5 yenes?", options: ["Kamisama Kiss", "Noragami", "Inari Kon Kon", "Gugure! Kokkuri-san"], answer: 1, bgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80" },
          { q: "¿Quién es el protagonista de Parasyte?", options: ["Migi", "Shinichi Izumi", "Satomi Murano", "Kana Kimishima"], answer: 1, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Cómo se llama el parásito que vive en la mano de Shinichi?", options: ["Lefty", "Migi", "Handy", "Parasite"], answer: 1, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Qué anime trata sobre una invasión de parásitos alienígenas?", options: ["Parasyte", "Terra Formars", "Gantz", "Ajin"], answer: 0, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Quién es el protagonista de Psycho-Pass?", options: ["Shinya Kogami", "Akane Tsunemori", "Nobuchika Ginoza", "Shogo Makishima"], answer: 1, bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" }
        ]
      },
      {
        id: "humano-arena-2",
        title: "Arena 2: Iniciación Gamer",
        description: "Cultura general de videojuegos.",
        questions: [
          {
            q: "¿De qué color es el traje clásico de Mario Bros?",
            options: ["Verde y Azul", "Rojo y Azul", "Amarillo y Negro", "Blanco y Rojo"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1612404730960-5c71577fca11?w=800&q=80"
          },
          {
            q: "¿Cómo se llama la princesa que Link debe rescatar?",
            options: ["Peach", "Daisy", "Zelda", "Rosalina"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80"
          },
          {
            q: "¿Qué compañía creó la consola PlayStation?",
            options: ["Nintendo", "Microsoft", "Sega", "Sony"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80"
          },
          {
            q: "¿En Minecraft, qué material necesitas para hacer un pico de diamante?",
            options: ["Hierro y Palos", "Diamantes y Palos", "Oro y Piedra", "Diamantes y Hilo"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1600189021941-86f2b4c1945a?w=800&q=80"
          },
          {
            q: "¿Cuál es el juego más vendido de la historia?",
            options: ["Tetris", "Minecraft", "GTA V", "Wii Sports"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"
          }
        ]
      },
      {
        id: "humano-arena-3",
        title: "Arena 3: Mitos Clásicos",
        description: "Mitología griega básica.",
        questions: [
          {
            q: "¿Quién es el dios griego del Inframundo?",
            options: ["Zeus", "Poseidón", "Hades", "Ares"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80"
          },
          {
            q: "¿Qué criatura mitológica tiene cuerpo de caballo y torso de hombre?",
            options: ["Minotauro", "Centauro", "Sátiro", "Grifo"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
          },
          {
            q: "¿Quién es la diosa griega de la sabiduría?",
            options: ["Afrodita", "Atenea", "Hera", "Artemisa"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80"
          },
          {
            q: "¿Qué héroe griego era invulnerable excepto en su talón?",
            options: ["Hércules", "Perseo", "Aquiles", "Teseo"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80"
          },
          {
            q: "¿Cómo se llama el perro de tres cabezas que guarda el Inframundo?",
            options: ["Ortro", "Quimera", "Cerbero", "Hidra"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80"
          }
        ]
      },
      {
        id: "humano-arena-4",
        title: "Arena 4: Cine y Animación",
        description: "Películas de anime y clásicos de Ghibli.",
        questions: [
          {
            q: "¿Qué película de Studio Ghibli ganó un Premio Óscar?",
            options: ["Mi Vecino Totoro", "El Viaje de Chihiro", "La Princesa Mononoke", "El Castillo Ambulante"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80"
          },
          {
            q: "¿Quién dirigió la película 'Your Name' (Kimi no Na wa)?",
            options: ["Hayao Miyazaki", "Makoto Shinkai", "Mamoru Hosoda", "Satoshi Kon"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
          },
          {
            q: "¿En qué película de Ghibli aparece un gato negro llamado Jiji?",
            options: ["Kiki: Entregas a domicilio", "Susurros del corazón", "Haru en el reino de los gatos", "Ponyo"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80"
          },
          {
            q: "¿Cuál es la película de anime más taquillera de la historia (hasta 2023)?",
            options: ["El Viaje de Chihiro", "Your Name", "Demon Slayer: Mugen Train", "Suzume"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80"
          },
          {
            q: "¿Qué película cyberpunk de 1988 revolucionó la animación japonesa?",
            options: ["Ghost in the Shell", "Akira", "Perfect Blue", "Evangelion: Death and Rebirth"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80"
          }
        ]
      },
      {
        id: "humano-arena-5",
        title: "Arena 5: Música y Openings",
        description: "Bandas sonoras que marcaron una época.",
        questions: [
          {
            q: "¿Cómo se llama el primer opening de Saint Seiya?",
            options: ["Soldier Dream", "Pegasus Fantasy", "Chikyuugi", "Blue Dream"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
          },
          {
            q: "¿Qué banda interpreta 'Unravel', el famoso opening de Tokyo Ghoul?",
            options: ["Asian Kung-Fu Generation", "FLOW", "TK from Ling Tosite Sigure", "UVERworld"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"
          },
          {
            q: "¿Qué opening de Naruto Shippuden es interpretado por Ikimonogakari?",
            options: ["Silhouette", "Blue Bird", "Sign", "Hero's Come Back!!"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80"
          },
          {
            q: "¿Cómo se llama la canción principal de League of Legends Worlds 2014?",
            options: ["Legends Never Die", "Ignite", "Warriors", "Rise"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
          },
          {
            q: "¿Qué artista canta 'Gurenge', el primer opening de Demon Slayer?",
            options: ["LiSA", "Aimer", "Eir Aoi", "ReoNa"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80"
          }
        ]
      },
      {
        id: "humano-arena-6",
        title: "Arena 6: Mascotas y Compañeros",
        description: "Los fieles amigos de los protagonistas.",
        questions: [
          { q: "¿Cómo se llama el gato de Sailor Moon?", options: ["Artemis", "Diana", "Luna", "Kero"], answer: 2, bgImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80" },
          { q: "¿Qué animal es Tony Chopper en One Piece?", options: ["Un mapache", "Un reno", "Un perro", "Un oso"], answer: 1, bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80" },
          { q: "¿Cómo se llama el perro ninja de Kakashi?", options: ["Akamaru", "Pakkun", "Gamakichi", "Kurama"], answer: 1, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" },
          { q: "¿Qué criatura acompaña a Ash Ketchum siempre fuera de su Pokebola?", options: ["Bulbasaur", "Charmander", "Squirtle", "Pikachu"], answer: 3, bgImage: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800&q=80" },
          { q: "¿Cómo se llama el cerdo compañero de Meliodas?", options: ["Hawk", "Puck", "Happy", "Iggy"], answer: 0, bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80" }
        ]
      },
      {
        id: "humano-arena-7",
        title: "Arena 7: Comida y Banquetes",
        description: "Gastronomía en el anime.",
        questions: [
          { q: "¿Cuál es la comida favorita de Naruto?", options: ["Sushi", "Ramen", "Onigiri", "Takoyaki"], answer: 1, bgImage: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80" },
          { q: "¿Qué fruta le dio sus poderes a Monkey D. Luffy?", options: ["Mera Mera no Mi", "Gomu Gomu no Mi", "Ope Ope no Mi", "Ito Ito no Mi"], answer: 1, bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80" },
          { q: "¿Qué plato prepara Sanji a menudo para Nami y Robin?", options: ["Carne asada", "Postres y té", "Sopa de mariscos", "Curry"], answer: 1, bgImage: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80" },
          { q: "¿En Dragon Ball Super, qué comida de la Tierra fascina a Bills (Beerus)?", options: ["Pizza", "Pudín", "Hamburguesas", "Todas las anteriores"], answer: 3, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿Qué anime se centra en batallas culinarias extremas?", options: ["Toriko", "Food Wars! (Shokugeki no Soma)", "Yakitate!! Japan", "Silver Spoon"], answer: 1, bgImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80" }
        ]
      },
      {
        id: "humano-arena-8",
        title: "Arena 8: Deportes y Juegos",
        description: "Pasión y competencia en la cancha.",
        questions: [
          { q: "¿De qué deporte trata el anime Haikyuu!!?", options: ["Baloncesto", "Béisbol", "Voleibol", "Fútbol"], answer: 2, bgImage: "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Captain Tsubasa (Súper Campeones)?", options: ["Kojiro Hyuga", "Tsubasa Ozora (Oliver Atom)", "Genzo Wakabayashi (Benji Price)", "Taro Misaki"], answer: 1, bgImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80" },
          { q: "¿Qué juego de mesa se juega en Yu-Gi-Oh!?", options: ["Ajedrez", "Duelo de Monstruos", "Go", "Shogi"], answer: 1, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" },
          { q: "¿En Kuroko no Basket, cómo se llama la legendaria generación de jugadores?", options: ["La Generación de los Milagros", "Los Reyes de la Cancha", "Los Cinco Fantásticos", "La Generación Dorada"], answer: 0, bgImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80" },
          { q: "¿De qué deporte trata el anime Blue Lock?", options: ["Natación", "Ciclismo", "Fútbol", "Tenis"], answer: 2, bgImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80" }
        ]
      },
      {
        id: "humano-arena-9",
        title: "Arena 9: Mechas y Robots",
        description: "Gigantes de acero.",
        questions: [
          { q: "¿Cómo se llama el robot que pilota Shinji Ikari?", options: ["Gundam RX-78", "EVA-01", "Mazinger Z", "Gurren Lagann"], answer: 1, bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80" },
          { q: "¿Qué grita Koji Kabuto al disparar los puños de Mazinger Z?", options: ["¡Fuego!", "¡Puños Fuera! (Rocket Punch)", "¡Rayo Láser!", "¡Ataque Meteoro!"], answer: 1, bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80" },
          { q: "¿En Tengen Toppa Gurren Lagann, qué objeto usa Simon para encender su mecha?", options: ["Una llave en forma de taladro", "Un cristal de energía", "Una tarjeta magnética", "Su propia sangre"], answer: 0, bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80" },
          { q: "¿Qué anime popularizó el género de los 'Real Robots' en 1979?", options: ["Macross", "Mobile Suit Gundam", "Evangelion", "Code Geass"], answer: 1, bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" },
          { q: "¿En Darling in the Franxx, cómo se llama el mecha que pilotan Hiro y Zero Two?", options: ["Strelizia", "Delphinium", "Argentea", "Genista"], answer: 0, bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80" }
        ]
      },
      {
        id: "humano-arena-10",
        title: "Arena 10: Isekai y Reencarnación",
        description: "Viajes a otros mundos.",
        questions: [
          { q: "¿En qué anime el protagonista reencarna como un slime?", options: ["Overlord", "Re:Zero", "That Time I Got Reincarnated as a Slime", "Sword Art Online"], answer: 2, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de Sword Art Online?", options: ["Kirito", "Asuna", "Klein", "Eugeo"], answer: 0, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿Qué habilidad especial tiene Subaru en Re:Zero?", options: ["Magia de fuego", "Regreso por la muerte", "Invisibilidad", "Fuerza sobrehumana"], answer: 1, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" },
          { q: "¿En Konosuba, qué diosa inútil acompaña a Kazuma?", options: ["Eris", "Aqua", "Hestia", "Athena"], answer: 1, bgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80" },
          { q: "¿En No Game No Life, cómo se llaman los hermanos protagonistas?", options: ["Sora y Shiro", "Edward y Alphonse", "Tanjiro y Nezuko", "Kirito y Leafa"], answer: 0, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" }
        ]
      },
      {
        id: "humano-arena-11",
        title: "Arena 11: Otaku Supremo",
        description: "Preguntas de anime y manga de nivel experto.",
        questions: [
          { q: "¿Quién es el autor de 'Berserk'?", options: ["Takehiko Inoue", "Kentaro Miura", "Naoki Urasawa", "Yoshihiro Togashi"], answer: 1, bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80" },
          { q: "¿Cómo se llama el protagonista de 'Vagabond'?", options: ["Musashi Miyamoto", "Kojiro Sasaki", "Guts", "Thorfinn"], answer: 0, bgImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80" },
          { q: "¿En qué año se estrenó el anime original de 'Evangelion'?", options: ["1993", "1995", "1997", "1999"], answer: 1, bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80" },
          { q: "¿Cuál es el nombre de la espada de Guts en Berserk?", options: ["Zangetsu", "Dragon Slayer", "Excalibur", "Muramasa"], answer: 1, bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80" },
          { q: "¿Quién es el protagonista de 'Monster'?", options: ["Johan Liebert", "Kenzo Tenma", "Heinrich Lunge", "Wolfgang Grimmer"], answer: 1, bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80" }
        ]
      },
      {
        id: "humano-arena-12",
        title: "Arena 12: Maestro de Novelas Visuales",
        description: "Fate, Steins;Gate, Clannad y más.",
        questions: [
          { q: "¿Cuál es el nombre de la heroína principal de 'Fate/stay night'?", options: ["Rin Tohsaka", "Saber", "Sakura Matou", "Ilyasviel"], answer: 1, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿En 'Steins;Gate', qué significa 'El Psy Kongroo'?", options: ["Es un código de tiempo", "No tiene significado real", "Es el nombre de un dios", "Es una contraseña de laboratorio"], answer: 1, bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" },
          { q: "¿Cómo se llama la protagonista de 'Clannad'?", options: ["Nagisa Furukawa", "Kyou Fujibayashi", "Tomoyo Sakagami", "Kotomi Ichinose"], answer: 0, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Qué estudio desarrolló la novela visual 'Muv-Luv'?", options: ["Type-Moon", "Key", "âge", "Nitroplus"], answer: 2, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿En 'Danganronpa', quién es el director de la Academia Pico de la Esperanza?", options: ["Monokuma", "Junko Enoshima", "Makoto Naegi", "Kyoko Kirigiri"], answer: 0, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" }
        ]
      }
    ]
  },
  {
    id: "level-2",
    name: "Caballero de Bronce",
    description: "Nivel Normal. El cosmos comienza a arder.",
    arenas: [
      {
        id: "bronce-arena-1",
        title: "Arena 1: Torneo Galáctico",
        description: "Conocimiento intermedio de Saint Seiya y LoL.",
        questions: [
          {
            q: "¿Quién es el Caballero de Bronce del Dragón?",
            options: ["Seiya", "Shiryu", "Hyoga", "Shun"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80"
          },
          {
            q: "¿Qué campeón de LoL dice 'La muerte es como el viento, siempre a mi lado'?",
            options: ["Yone", "Zed", "Talon", "Yasuo"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80"
          },
          {
            q: "¿Cómo se llama el demonio dentro de Inuyasha?",
            options: ["Kurama", "No tiene", "Sesshomaru", "Naraku"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1509266272358-7701da638078?w=800&q=80"
          },
          {
            q: "¿Qué alquimista es conocido como el Alquimista de Acero?",
            options: ["Alphonse Elric", "Roy Mustang", "Edward Elric", "Van Hohenheim"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80"
          },
          {
            q: "¿Qué objeto en LoL otorga un escudo mágico que bloquea la siguiente habilidad?",
            options: ["Velo de la Banshee", "Apariencia Espiritual", "Fuerza de la Naturaleza", "Yelmo Adaptable"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1614036417651-1d4789192759?w=800&q=80"
          },
          {
            q: "¿En Saint Seiya, qué diosa reencarna en Saori Kido?",
            options: ["Hera", "Afrodita", "Atenea", "Artemisa"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80"
          },
          {
            q: "¿Qué técnica usa Seiya de Pegaso?",
            options: ["Polvo de Diamantes", "Meteoros de Pegaso", "Dragón Naciente", "Cadena Nebular"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80"
          },
          {
            q: "¿Cuál es el nombre del gremio principal en Fairy Tail?",
            options: ["Sabertooth", "Blue Pegasus", "Fairy Tail", "Lamia Scale"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
          },
          {
            q: "¿En LoL, qué monstruo épico otorga el 'Ojo del Heraldo'?",
            options: ["Barón Nashor", "Dragón Anciano", "Heraldo de la Grieta", "Escurridizo"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
          },
          {
            q: "¿Qué tipo de magia usa Natsu Dragneel?",
            options: ["Magia de Hielo", "Dragon Slayer de Fuego", "Magia Celestial", "Magia de Agua"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80"
          }
        ]
      },
      {
        id: "bronce-arena-3",
        title: "Arena 3: Armaduras y Cosmos",
        description: "Detalles técnicos sobre las armaduras.",
        questions: [
          {
            q: "¿De qué material están hechas las armaduras de los Caballeros de Atenea?",
            options: ["Oricalco, Gammanium y Polvo de Estrellas", "Oro, Plata y Bronce", "Acero Valyrio", "Adamantium"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80"
          },
          {
            q: "¿A qué temperatura se congela una Armadura de Oro?",
            options: ["-100 grados", "-200 grados", "Cero Absoluto (-273.15 grados)", "Nunca se congelan"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80"
          },
          {
            q: "¿Qué se necesita para reparar una armadura muerta?",
            options: ["Fuego de dragón", "Sangre de Caballero", "Polvo de estrellas", "Lágrimas de Atenea"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80"
          },
          {
            q: "¿Cuántas armaduras de Bronce existen en total según el Hipermito?",
            options: ["12", "24", "48", "88"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80"
          },
          {
            q: "¿Qué armadura de bronce tiene la capacidad de regenerarse a sí misma como un fénix?",
            options: ["Pegaso", "Dragón", "Cisne", "Fénix"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80"
          }
        ]
      },
      {
        id: "bronce-arena-4",
        title: "Arena 4: Armas y Reliquias",
        description: "Objetos mágicos y armas legendarias.",
        questions: [
          {
            q: "¿Cómo se llama la espada de Meliodas en Nanatsu no Taizai?",
            options: ["Excalibur", "Lostvayne", "Chastiefol", "Rhitta"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80"
          },
          {
            q: "¿Qué arma usa Inuyasha?",
            options: ["Tessaiga (Colmillo de Acero)", "Tenseiga (Colmillo Sagrado)", "Tokijin", "Bakusaiga"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"
          },
          {
            q: "¿En LoL, qué objeto se construye con un Espadón y una Picacha?",
            options: ["Filo Infinito", "Sanguinaria", "Ángel Guardián", "Hoja del Rey Arruinado"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1614036417651-1d4789192759?w=800&q=80"
          },
          {
            q: "¿Qué reliquia del Milenio posee Yugi Muto?",
            options: ["El Anillo del Milenio", "El Ojo del Milenio", "El Rompecabezas del Milenio", "La Balanza del Milenio"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          },
          {
            q: "¿Qué arma usa el Caballero de Andrómeda?",
            options: ["Un escudo", "Una espada", "Un arco", "Cadenas"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80"
          }
        ]
      },
      {
        id: "bronce-arena-5",
        title: "Arena 5: Técnicas de Combate",
        description: "Ataques especiales y poderes característicos.",
        questions: [
          {
            q: "¿Quién le enseñó el Kamehameha a Goku?",
            options: ["Kaiosama", "Maestro Roshi", "Kami-sama", "Abuelo Gohan"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"
          },
          {
            q: "¿Qué elemento de chakra se necesita para realizar el Chidori?",
            options: ["Fuego", "Viento", "Rayo", "Agua"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1614036417651-1d4789192759?w=800&q=80"
          },
          {
            q: "¿Cómo se llama la técnica suprema de Ikki de Fénix?",
            options: ["Ilusión Diabólica", "Alas del Fénix", "Vuelo del Fénix", "Llamas del Infierno"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80"
          },
          {
            q: "¿Qué campeón de LoL usa la habilidad definitiva 'Réquiem'?",
            options: ["Thresh", "Mordekaiser", "Karthus", "Hecarim"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
          },
          {
            q: "¿Cuál es el ataque característico de Vegeta?",
            options: ["Makankosappo", "Resplandor Final (Final Flash)", "Masenko", "Kienzan"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          }
        ]
      },
      {
        id: "bronce-arena-6",
        title: "Arena 6: Transformaciones",
        description: "Poderes desatados y nuevas formas.",
        questions: [
          { q: "¿Qué transformación alcanza Goku en Namekusei?", options: ["Super Saiyajin 2", "Super Saiyajin", "Kaio-ken", "Ultra Instinto"], answer: 1, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿Cómo se llama la transformación demoníaca de Inuyasha?", options: ["Modo Yokai", "Sangre de Demonio", "Despertar", "No tiene nombre específico"], answer: 1, bgImage: "https://images.unsplash.com/photo-1509266272358-7701da638078?w=800&q=80" },
          { q: "¿Qué campeón de LoL se transforma en un dragón gigante?", options: ["Aurelion Sol", "Shyvana", "Smolder", "Gnar"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿Qué armadura viste Seiya al final de la saga de Poseidón?", options: ["Armadura de Pegaso Divina", "Armadura de Oro de Sagitario", "Armadura de Odín", "Armadura de Bronce dorada"], answer: 1, bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80" },
          { q: "¿En Bleach, cómo se llama la liberación completa de una Zanpakuto?", options: ["Shikai", "Bankai", "Resurrección", "Vollständig"], answer: 1, bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80" }
        ]
      },
      {
        id: "bronce-arena-7",
        title: "Arena 7: Torneos y Exámenes",
        description: "Las pruebas más duras del anime.",
        questions: [
          { q: "¿En qué fase del Examen Chunin pelea Rock Lee contra Gaara?", options: ["Primera fase (Escrito)", "Segunda fase (Bosque de la Muerte)", "Preliminares de la tercera fase", "Finales de la tercera fase"], answer: 2, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" },
          { q: "¿Quién gana el Torneo de las Artes Marciales Oscuras en Yu Yu Hakusho?", options: ["El Equipo Toguro", "El Equipo Urameshi", "El Equipo Masho", "El Equipo Rokuyukai"], answer: 1, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" },
          { q: "¿En el Torneo Galáctico de Saint Seiya, quién roba la Armadura de Oro de Sagitario?", options: ["Ikki de Fénix", "Saga de Géminis", "Docrates", "Los Caballeros Negros"], answer: 0, bgImage: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80" },
          { q: "¿Qué universo gana el Torneo del Poder en Dragon Ball Super?", options: ["Universo 11", "Universo 6", "Universo 7", "Universo 9"], answer: 2, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿En My Hero Academia, quién gana el Festival Deportivo de la U.A. (primer año)?", options: ["Izuku Midoriya", "Shoto Todoroki", "Katsuki Bakugo", "Fumikage Tokoyami"], answer: 2, bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80" }
        ]
      },
      {
        id: "bronce-arena-8",
        title: "Arena 8: Maestros y Mentores",
        description: "Los que enseñaron el camino.",
        questions: [
          { q: "¿Quién fue el maestro de Naruto que le enseñó el Rasengan?", options: ["Kakashi", "Iruka", "Jiraiya", "Minato"], answer: 2, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" },
          { q: "¿Quién entrenó a Izuku Midoriya antes de entrar a la U.A.?", options: ["Gran Torino", "All Might", "Eraserhead", "Endeavor"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80" },
          { q: "¿Quién es el maestro de Saitama en One Punch Man?", options: ["Bang (Silver Fang)", "No tiene maestro", "Genos", "King"], answer: 1, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" },
          { q: "¿En Demon Slayer, quién entrenó a Tanjiro Kamado?", options: ["Giyu Tomioka", "Sakonji Urokodaki", "Jigoro Kuwajima", "Kyojuro Rengoku"], answer: 1, bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80" },
          { q: "¿En LoL, quién fue el maestro de Yasuo y Yone?", options: ["Maestro Yi", "Shen", "El Anciano Souma", "Kennen"], answer: 2, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" }
        ]
      },
      {
        id: "bronce-arena-9",
        title: "Arena 9: Rivales Legendarios",
        description: "Amistad y competencia.",
        questions: [
          { q: "¿Quién es el eterno rival de Goku?", options: ["Piccolo", "Vegeta", "Freezer", "Broly"], answer: 1, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿Quién es el rival de Yugi Muto que posee al Dragón Blanco de Ojos Azules?", options: ["Joey Wheeler", "Maximillion Pegasus", "Seto Kaiba", "Marik Ishtar"], answer: 2, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" },
          { q: "¿En LoL, quién es la rival de Vi, su propia hermana?", options: ["Caitlyn", "Jinx", "Ekko", "Zeri"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿Quién es el rival de Asta en Black Clover?", options: ["Yami", "Yuno", "Noelle", "Magna"], answer: 1, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" },
          { q: "¿En Death Note, quién es el principal rival intelectual de Light Yagami?", options: ["Near", "Mello", "L", "Ryuk"], answer: 2, bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80" }
        ]
      },
      {
        id: "bronce-arena-10",
        title: "Arena 10: Objetos Mágicos",
        description: "Reliquias de gran poder.",
        questions: [
          { q: "¿Cuántas Esferas del Dragón se necesitan para invocar a Shenlong?", options: ["5", "7", "9", "12"], answer: 1, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿En LoL, qué objeto te revive tras recibir daño letal?", options: ["Reloj de Arena de Zhonya", "Ángel Guardián", "Fuerza de la Trinidad", "Sombrero Mortal de Rabadon"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿Qué objeto usa Sailor Moon para transformarse en la primera temporada?", options: ["Un cetro", "Un broche mágico", "Una pluma", "Un espejo"], answer: 1, bgImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80" },
          { q: "¿En Hunter x Hunter, qué juego de consola es en realidad un mundo real creado con Nen?", options: ["Sword Art Online", "Greed Island", "Yggdrasil", "The World"], answer: 1, bgImage: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&q=80" },
          { q: "¿Qué objeto le da a Yugi Muto la capacidad de transformarse en el Faraón?", options: ["El Anillo del Milenio", "El Ojo del Milenio", "El Rompecabezas del Milenio", "La Balanza del Milenio"], answer: 2, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" }
        ]
      }
    ]
  },
  {
    id: "level-3",
    name: "Caballero de Plata",
    description: "Nivel Difícil. Solo los guerreros experimentados sobreviven.",
    arenas: [
      {
        id: "plata-arena-1",
        title: "Arena 1: Santuario",
        description: "Detalles oscuros y lore profundo.",
        questions: [
          {
            q: "¿Quién fue el maestro de Hyoga de Cisne en el manga original?",
            options: ["Camus de Acuario", "Crystal Saint", "Marin de Águila", "Milo de Escorpio"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80"
          },
          {
            q: "¿En Evangelion, qué significa el acrónimo AT Field?",
            options: ["Absolute Terror Field", "Anti-Tank Field", "Advanced Tactical Field", "Angel Termination Field"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80"
          },
          {
            q: "¿Qué campeón de LoL fue el primero en ser lanzado (alfabéticamente de los originales)?",
            options: ["Alistar", "Annie", "Ashe", "Amumu"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"
          },
          {
            q: "¿Cómo se llama el Stand de Jotaro Kujo?",
            options: ["Crazy Diamond", "Star Platinum", "The World", "Silver Chariot"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80"
          },
          {
            q: "¿Qué estudio animó la primera temporada de One Punch Man?",
            options: ["J.C. Staff", "Bones", "Madhouse", "MAPPA"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&q=80"
          },
          {
            q: "¿En Hunter x Hunter, a qué tipo de Nen pertenece Gon Freecss?",
            options: ["Emisión", "Transformación", "Intensificación", "Materialización"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&q=80"
          },
          {
            q: "¿Cuál es el nombre de la espada de Ichigo Kurosaki en su forma Bankai inicial?",
            options: ["Zangetsu", "Tensa Zangetsu", "Senbonzakura", "Kyoka Suigetsu"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80"
          },
          {
            q: "¿En LoL, qué evento del lore enfrentó a Rengar y Kha'Zix?",
            options: ["La Ruina", "La Caza", "Invasión del Vacío", "Guerra de Freljord"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80"
          },
          {
            q: "¿Quién es el autor del manga 'Monster'?",
            options: ["Naoki Urasawa", "Kentaro Miura", "Takehiko Inoue", "Junji Ito"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80"
          },
          {
            q: "¿Qué personaje de Naruto es conocido como 'El Relámpago Amarillo de Konoha'?",
            options: ["Kakashi Hatake", "Jiraiya", "Minato Namikaze", "Naruto Uzumaki"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80"
          }
        ]
      },
      {
        id: "plata-arena-2",
        title: "Arena 2: Secretos de Runaterra",
        description: "Lore profundo de League of Legends.",
        questions: [
          {
            q: "¿Cuál es el verdadero nombre de Jhin?",
            options: ["Khada Jhin", "No se conoce", "Shen", "Zed"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"
          },
          {
            q: "¿Qué región de Runaterra está gobernada por Swain?",
            options: ["Demacia", "Noxus", "Ionia", "Freljord"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
          },
          {
            q: "¿Quién traicionó a Azir en la antigua Shurima?",
            options: ["Nasus", "Renekton", "Xerath", "Sivir"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?w=800&q=80"
          },
          {
            q: "¿Qué campeón es la hermana de Vi?",
            options: ["Caitlyn", "Jinx", "Ekko", "Zeri"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          },
          {
            q: "¿Qué demonio habita dentro de Swain?",
            options: ["Evelynn", "Tahm Kench", "Raum", "Fiddlesticks"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
          }
        ]
      },
      {
        id: "plata-arena-3",
        title: "Arena 3: Maestros del Nen",
        description: "Conocimiento avanzado de Hunter x Hunter.",
        questions: [
          {
            q: "¿Quién es el presidente de la Asociación de Cazadores al inicio de la serie?",
            options: ["Ging Freecss", "Isaac Netero", "Pariston Hill", "Cheadle Yorkshire"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&q=80"
          },
          {
            q: "¿Cuál es la habilidad Nen de Kurapika que solo puede usar contra la Brigada Fantasma?",
            options: ["Cárcel de Cadenas (Chain Jail)", "Cadena de Curación", "Tiempo del Emperador", "Cadena del Juicio"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80"
          },
          {
            q: "¿Cómo se llama el rey de las Hormigas Quimera?",
            options: ["Neferpitou", "Shaiapouf", "Menthuthuyoupi", "Meruem"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80"
          },
          {
            q: "¿Qué tipo de cazador es Kite?",
            options: ["Cazador de Bestias", "Cazador de Ruinas", "Cazador de Contratos", "Cazador Gourmet"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80"
          },
          {
            q: "¿Cuál es el nombre del juego mortal en la isla de Greed Island?",
            options: ["Greed Island", "G.I.", "El Juego de Ging", "No tiene nombre"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1600189021941-86f2b4c1945a?w=800&q=80"
          }
        ]
      },
      {
        id: "plata-arena-4",
        title: "Arena 4: Estrategia y Táctica",
        description: "Batallas mentales y planes maestros.",
        questions: [
          {
            q: "¿Quién es el brillante estratega de la rebelión en Code Geass?",
            options: ["Suzaku Kururugi", "Lelouch vi Britannia", "Schneizel el Britannia", "Charles zi Britannia"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80"
          },
          {
            q: "¿En No Game No Life, cómo se llaman los hermanos protagonistas?",
            options: ["Sora y Shiro", "Kirito y Asuna", "Edward y Alphonse", "Tanjiro y Nezuko"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80"
          },
          {
            q: "¿Qué personaje de Naruto es conocido por su inteligencia superior a 200 de IQ?",
            options: ["Kakashi Hatake", "Itachi Uchiha", "Shikamaru Nara", "Orochimaru"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80"
          },
          {
            q: "¿En Death Note, quién es el sucesor principal de L?",
            options: ["Mello", "Near", "Matt", "Light"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80"
          },
          {
            q: "¿Qué campeón de LoL es el 'Gran General Noxiano' conocido por su visión estratégica?",
            options: ["Darius", "Swain", "Katarina", "Sion"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
          }
        ]
      },
      {
        id: "plata-arena-5",
        title: "Arena 5: Geografía y Mundos",
        description: "Lugares icónicos del anime y los videojuegos.",
        questions: [
          {
            q: "¿Cómo se llama la isla final donde se encuentra el One Piece?",
            options: ["Raftel (Laugh Tale)", "Lodestar", "Marineford", "Sabaody"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80"
          },
          {
            q: "¿En qué país ficticio se desarrolla la historia de Fullmetal Alchemist?",
            options: ["Xing", "Drachma", "Amestris", "Ishval"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80"
          },
          {
            q: "¿Cuál es la capital de la nación de Demacia en Runaterra?",
            options: ["Noxus Prime", "Gran Ciudad de Demacia", "Piltover", "Aguasturbias"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
          },
          {
            q: "¿Cómo se llama el mundo donde habitan los Hollows en Bleach?",
            options: ["Sociedad de Almas", "Mundo Humano", "Hueco Mundo", "Infierno"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1501432377862-3d0432b87a14?w=800&q=80"
          },
          {
            q: "¿Dónde entrenó Seiya para obtener la armadura de Pegaso?",
            options: ["Isla de la Reina Muerte", "Siberia", "Cinco Picos", "Santuario de Atenea en Grecia"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80"
          }
        ]
      },
      {
        id: "plata-arena-6",
        title: "Arena 6: Organizaciones Secretas",
        description: "Grupos oscuros y sindicatos.",
        questions: [
          { q: "¿Cómo se llama la organización criminal de Shigaraki en My Hero Academia?", options: ["La Liga de Villanos", "El Ejército de Liberación", "Los Ocho Preceptos", "Vanguardia"], answer: 0, bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80" },
          { q: "¿En Naruto, quién es el verdadero líder en las sombras de Akatsuki (antes de Madara/Kaguya)?", options: ["Pain", "Itachi", "Obito (Tobi)", "Zetsu"], answer: 2, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" },
          { q: "¿Qué organización busca la Piedra Filosofal en Fullmetal Alchemist?", options: ["Los Homúnculos", "El Ejército de Amestris", "La Quimera", "Los Alquimistas Estatales"], answer: 0, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" },
          { q: "¿En LoL, qué organización secreta lidera Zed?", options: ["La Orden Kinkou", "La Orden de las Sombras", "La Rosa Negra", "Los Iluminadores"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿Cómo se llama el grupo de asesinos al que pertenece Killua en Hunter x Hunter?", options: ["La Brigada Fantasma", "La Familia Zoldyck", "Los Cazadores Negros", "Las Hormigas Quimera"], answer: 1, bgImage: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&q=80" }
        ]
      },
      {
        id: "plata-arena-7",
        title: "Arena 7: Magia y Sistemas de Poder",
        description: "Reglas de los mundos fantásticos.",
        questions: [
          { q: "¿En Jujutsu Kaisen, qué es la 'Expansión de Dominio'?", options: ["Un ataque de energía", "La materialización del espacio innato del usuario", "Una barrera defensiva", "Una invocación de Shikigami"], answer: 1, bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80" },
          { q: "¿En Fullmetal Alchemist, cuál es la regla fundamental de la alquimia?", options: ["La Ley de la Conservación de la Masa", "El Intercambio Equivalente", "La Piedra Filosofal", "El Principio de Transmutación"], answer: 1, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" },
          { q: "¿Qué tipo de Nen usa Hisoka (Bungee Gum)?", options: ["Emisión", "Intensificación", "Transformación", "Especialización"], answer: 2, bgImage: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&q=80" },
          { q: "¿En Fate/stay night, qué clase de Servant es Artoria Pendragon?", options: ["Archer", "Lancer", "Saber", "Rider"], answer: 2, bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80" },
          { q: "¿En LoL, de dónde proviene la magia de Sylas?", options: ["Es un mago de hielo", "Roba la magia de otros", "Usa magia de sangre", "Magia celestial de Targon"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" }
        ]
      },
      {
        id: "plata-arena-8",
        title: "Arena 8: E-Sports y Competitivo",
        description: "El mundo profesional del gaming.",
        questions: [
          { q: "¿Qué equipo ganó el primer Campeonato Mundial de League of Legends (Worlds 2011)?", options: ["SK Telecom T1", "Fnatic", "Taipei Assassins", "Team SoloMid"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿Quién es considerado el mejor jugador de la historia de League of Legends?", options: ["Uzi", "Rookie", "Faker", "ShowMaker"], answer: 2, bgImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80" },
          { q: "¿Qué trofeo se entrega al ganador de Worlds en LoL?", options: ["La Copa del Invocador", "El Escudo de Demacia", "La Corona de Runaterra", "El Cáliz de la Victoria"], answer: 0, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿En qué país se celebraron las finales de Worlds 2023 de LoL?", options: ["China", "Estados Unidos", "Corea del Sur", "Francia"], answer: 2, bgImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80" },
          { q: "¿Qué equipo coreano logró ganar Worlds cuatro veces (2013, 2015, 2016, 2023)?", options: ["Samsung Galaxy", "Damwon Gaming", "T1 (SK Telecom T1)", "Gen.G"], answer: 2, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" }
        ]
      },
      {
        id: "plata-arena-9",
        title: "Arena 9: Dioses y Deidades",
        description: "Seres supremos del anime.",
        questions: [
          { q: "¿Quién es el Dios de la Destrucción del Universo 7 en Dragon Ball Super?", options: ["Champa", "Bills (Beerus)", "Whis", "Zeno-sama"], answer: 1, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿En Noragami, qué tipo de dios es Yato?", options: ["Dios de la Guerra", "Dios de la Calamidad", "Dios de la Fortuna", "Dios de la Sabiduría"], answer: 1, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" },
          { q: "¿En Saint Seiya, qué dios reencarna en el cuerpo de Julian Solo?", options: ["Hades", "Apolo", "Poseidón", "Ares"], answer: 2, bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80" },
          { q: "¿En LoL, qué campeón es el Aspecto de la Guerra?", options: ["Leona", "Diana", "Pantheon", "Taric"], answer: 2, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿En Record of Ragnarok (Shuumatsu no Valkyrie), quién es el primer dios en pelear?", options: ["Zeus", "Poseidón", "Thor", "Shiva"], answer: 2, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" }
        ]
      },
      {
        id: "plata-arena-10",
        title: "Arena 10: Viajes en el Tiempo",
        description: "Alterando el destino.",
        questions: [
          { q: "¿En Steins;Gate, qué objeto usan para enviar mensajes al pasado?", options: ["Un teléfono móvil", "Un microondas", "Una computadora", "Un reloj de bolsillo"], answer: 1, bgImage: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80" },
          { q: "¿En Dragon Ball Z, quién viaja en el tiempo para advertir sobre los Androides?", options: ["Goku", "Vegeta", "Trunks", "Bulma"], answer: 2, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿En Tokyo Revengers, cómo viaja Takemichi al pasado?", options: ["Durmiendo", "Dando un apretón de manos a Naoto", "Muriendo", "Usando una máquina"], answer: 1, bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80" },
          { q: "¿En LoL, qué campeón manipula el tiempo con su dispositivo Z-Drive?", options: ["Zilean", "Ekko", "Heimerdinger", "Viktor"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿En Erased (Boku dake ga Inai Machi), a qué edad regresa el protagonista para salvar a su compañera?", options: ["A la preparatoria", "A la universidad", "A la escuela primaria (10-11 años)", "Al día de su nacimiento"], answer: 2, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" }
        ]
      }
    ]
  },
  {
    id: "level-4",
    name: "Espectro",
    description: "Nivel Muy Difícil. Conocimiento digno del Inframundo.",
    arenas: [
      {
        id: "espectro-arena-1",
        title: "Arena 1: Prisión del Cocytos",
        description: "Preguntas extremadamente específicas.",
        questions: [
          {
            q: "¿Cuál es el nombre de la estrella maligna de Radamanthys?",
            options: ["Estrella Terrestre de la Oscuridad", "Estrella Celeste de la Fiereza", "Estrella Celeste de la Nobleza", "Estrella Terrestre de la Locura"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80"
          },
          {
            q: "¿En LoL, cuánto oro exacto otorga la primera sangre (First Blood)?",
            options: ["300", "400", "450", "500"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80"
          },
          {
            q: "¿Quién compuso la banda sonora de Cowboy Bebop?",
            options: ["Hiroyuki Sawano", "Yoko Kanno", "Shiro Sagisu", "Kenji Kawai"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
          },
          {
            q: "¿Cuál es el nombre real de L en Death Note?",
            options: ["L Lawliet", "L. Lamperouge", "Light Yagami", "No se revela"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80"
          },
          {
            q: "¿Qué objeto de LoL fue eliminado y se llamaba 'Tenaza de Muerte Ígnea' (Deathfire Grasp)?",
            options: ["Un sombrero", "Una espada", "Una varita", "Una calavera con fuego"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1501432377862-3d0432b87a14?w=800&q=80"
          },
          {
            q: "¿En qué año se emitió el primer episodio de Neon Genesis Evangelion en Japón?",
            options: ["1993", "1995", "1997", "1999"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80"
          },
          {
            q: "¿Cuál es el nombre del primer homúnculo creado en Fullmetal Alchemist: Brotherhood?",
            options: ["Envy", "Greed", "Pride", "Wrath"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80"
          },
          {
            q: "¿Qué campeón de LoL tiene la pasiva 'Tejedora de Piedra'?",
            options: ["Malphite", "Taliyah", "Qiyana", "Galio"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"
          },
          {
            q: "¿Quién es el creador del manga 'Gantz'?",
            options: ["Hiroya Oku", "Inio Asano", "Tsugumi Ohba", "Sui Ishida"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          },
          {
            q: "¿En Saint Seiya, qué espectro toca la lira en el Inframundo?",
            options: ["Orfeo de Lira", "Pharaoh de Esfinge", "Lune de Balrog", "Caronte de Aqueronte"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
          }
        ]
      },
      {
        id: "espectro-arena-2",
        title: "Arena 2: Jueces del Infierno",
        description: "Trivia sobre los guerreros más fuertes de Hades.",
        questions: [
          {
            q: "¿Quiénes son los tres Jueces del Infierno en Saint Seiya?",
            options: ["Saga, Shura, Camus", "Radamanthys, Minos, Aiacos", "Lune, Pharaoh, Caronte", "Thanatos, Hypnos, Hades"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80"
          },
          {
            q: "¿Qué técnica usa Minos de Grifo para controlar a sus oponentes?",
            options: ["Marioneta Cósmica", "Aleteo de Garuda", "Gran Caución", "Ilusión Galáctica"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1580238053495-b9720401fd45?w=800&q=80"
          },
          {
            q: "¿Qué Caballero Dorado derrotó a Radamanthys en The Lost Canvas?",
            options: ["Kardia de Escorpio", "Regulus de Leo", "El Cid de Capricornio", "Manigoldo de Cáncer"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1577493341514-229ea9d560f9?w=800&q=80"
          },
          {
            q: "¿A qué estrella maligna pertenece Aiacos de Garuda?",
            options: ["Estrella Celeste de la Fiereza", "Estrella Celeste del Heroísmo", "Estrella Celeste de la Nobleza", "Estrella Terrestre de la Oscuridad"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1550847024-d2b38021481b?w=800&q=80"
          },
          {
            q: "¿Qué espectro luchó contra Mu de Aries en el castillo de Hades?",
            options: ["Myu de Papillon", "Niobe de Deep", "Radamanthys de Wyvern", "Giganto de Cyclops"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1534269222346-5a896154c41d?w=800&q=80"
          }
        ]
      },
      {
        id: "espectro-arena-3",
        title: "Arena 3: Oscuridad Profunda",
        description: "Lore avanzado de animes Seinen.",
        questions: [
          {
            q: "¿Cómo se llama el protagonista de Berserk?",
            options: ["Griffith", "Guts", "Casca", "Puck"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          },
          {
            q: "¿En Tokyo Ghoul, qué tipo de Kagune tiene Ken Kaneki?",
            options: ["Ukaku", "Koukaku", "Rinkaku", "Bikaku"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80"
          },
          {
            q: "¿Qué organización persigue a los Ajin en el anime homónimo?",
            options: ["El Gobierno Japonés", "Comité de Gestión de Ajin", "Fundación Sato", "Fuerza de Autodefensa"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"
          },
          {
            q: "¿En Psycho-Pass, cómo se llama el sistema que mide el estado mental?",
            options: ["Sistema Sibyl", "Sistema Dominator", "Sistema Panopticon", "Sistema Oracle"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80"
          },
          {
            q: "¿Quién es el antagonista principal en la primera temporada de Vinland Saga?",
            options: ["Thors", "Askeladd", "Thorkell", "Canute"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80"
          }
        ]
      },
      {
        id: "espectro-arena-4",
        title: "Arena 4: El Lado Oscuro",
        description: "Villanos, traiciones y tragedias.",
        questions: [
          {
            q: "¿Quién orquestó el Eclipse en Berserk?",
            options: ["El Rey de Midland", "Zodd", "Griffith", "Guts"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          },
          {
            q: "¿Qué villano de JoJo's Bizarre Adventure usa el Stand 'Killer Queen'?",
            options: ["Dio Brando", "Kars", "Yoshikage Kira", "Diavolo"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
          },
          {
            q: "¿En Hunter x Hunter, quién asesina a Kite?",
            options: ["Meruem", "Neferpitou", "Hisoka", "Illumi"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80"
          },
          {
            q: "¿Qué Caballero Dorado traicionó a Atenea e intentó asesinarla cuando era bebé?",
            options: ["Deathmask de Cáncer", "Saga de Géminis", "Shura de Capricornio", "Aphrodite de Piscis"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80"
          },
          {
            q: "¿En LoL, quién traicionó y arruinó a Viego, el Rey Arruinado?",
            options: ["Hecarim", "Thresh", "Kalista", "Gwen"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
          }
        ]
      },
      {
        id: "espectro-arena-5",
        title: "Arena 5: Muertes y Sacrificios",
        description: "Momentos trágicos que rompieron el internet.",
        questions: [
          {
            q: "¿Quién asesina a Portgas D. Ace en One Piece?",
            options: ["Barbanegra", "Akainu", "Aokiji", "Kizaru"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80"
          },
          {
            q: "¿Quién mata a Jiraiya en Naruto Shippuden?",
            options: ["Orochimaru", "Itachi", "Pain", "Obito"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80"
          },
          {
            q: "¿Qué personaje de Fullmetal Alchemist es asesinado por Envy disfrazado de su esposa?",
            options: ["Roy Mustang", "Maes Hughes", "Alex Louis Armstrong", "Jean Havoc"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80"
          },
          {
            q: "¿Cómo muere Jonathan Joestar en JoJo's Bizarre Adventure?",
            options: ["Asesinado por Kars", "De viejo", "En un barco que explota junto a la cabeza de Dio", "Envenenado"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
          },
          {
            q: "¿Qué Pilar muere heroicamente en la película Demon Slayer: Mugen Train?",
            options: ["Giyu Tomioka", "Tengen Uzui", "Kyojuro Rengoku", "Sanemi Shinazugawa"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          }
        ]
      },
      {
        id: "espectro-arena-6",
        title: "Arena 6: Finales Trágicos",
        description: "Desenlaces oscuros y tristes.",
        questions: [
          { q: "¿Cómo termina el anime de Cyberpunk: Edgerunners?", options: ["David y Lucy escapan a la luna", "David muere salvando a Lucy", "Destruyen Arasaka", "David se convierte en un constructo"], answer: 1, bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" },
          { q: "¿En Devilman Crybaby, qué sucede al final?", options: ["Akira salva a Miki", "Satanás destruye la Tierra y se queda solo", "Los demonios son sellados", "Dios perdona a los demonios"], answer: 1, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" },
          { q: "¿Qué le ocurre a Lelouch al final de Code Geass (R2)?", options: ["Goberna el mundo eternamente", "Se exilia con C.C.", "Es asesinado por Suzaku (Zero) para traer la paz", "Pierde sus poderes y memoria"], answer: 2, bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80" },
          { q: "¿En Death Note, cómo muere Light Yagami en el manga?", options: ["Ryuk escribe su nombre en la Death Note", "Muere por disparos de Matsuda", "Se suicida", "Es ejecutado en prisión"], answer: 0, bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80" },
          { q: "¿En Evangelion (The End of Evangelion), quiénes son los únicos humanos que quedan en la playa al final?", options: ["Shinji y Rei", "Shinji y Misato", "Shinji y Asuka", "Solo Shinji"], answer: 2, bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80" }
        ]
      },
      {
        id: "espectro-arena-7",
        title: "Arena 7: Monstruos y Demonios",
        description: "Criaturas de pesadilla.",
        questions: [
          { q: "¿En Claymore, cómo se llaman los monstruos devoradores de humanos?", options: ["Yoma", "Hollows", "Ghouls", "Akuma"], answer: 0, bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80" },
          { q: "¿Qué es el 'Dios Mano' (God Hand) en Berserk?", options: ["Un grupo de 5 demonios supremos", "Un arma legendaria", "El rey de Midland", "Una secta religiosa"], answer: 0, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" },
          { q: "¿En LoL, qué campeón es conocido como 'El Terror Nocturno'?", options: ["Fiddlesticks", "Nocturne", "Shaco", "Evelynn"], answer: 1, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Cómo se llaman los demonios en D.Gray-man creados por el Conde Milenario?", options: ["Hollows", "Akuma", "Noah", "Yoma"], answer: 1, bgImage: "https://images.unsplash.com/photo-1501432377862-3d0432b87a14?w=800&q=80" },
          { q: "¿En Hellsing, cuál es el verdadero nombre de Alucard?", options: ["Vlad Tepes (Drácula)", "Arthur Hellsing", "Alexander Anderson", "No tiene nombre"], answer: 0, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" }
        ]
      },
      {
        id: "espectro-arena-8",
        title: "Arena 8: Traiciones y Engaños",
        description: "Puñaladas por la espalda.",
        questions: [
          { q: "¿En Bleach, quién finge su muerte y traiciona a la Sociedad de Almas?", options: ["Gin Ichimaru", "Sosuke Aizen", "Kaname Tosen", "Byakuya Kuchiki"], answer: 1, bgImage: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=800&q=80" },
          { q: "¿En Attack on Titan, quiénes se revelan como el Titán Colosal y el Titán Acorazado?", options: ["Eren y Armin", "Jean y Connie", "Reiner y Bertholdt", "Zeke y Pieck"], answer: 2, bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80" },
          { q: "¿En Berserk, quién sacrifica a la Banda del Halcón durante el Eclipse?", options: ["Guts", "Casca", "Griffith", "El Rey de Midland"], answer: 2, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" },
          { q: "¿En Naruto, quién manipula a Nagato (Pain) desde las sombras?", options: ["Orochimaru", "Itachi", "Obito (haciéndose pasar por Madara)", "Kabuto"], answer: 2, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" },
          { q: "¿En Saint Seiya, qué Caballero de Oro intentó asesinar a Atenea cuando era un bebé?", options: ["Aiolia de Leo", "Saga de Géminis", "Shaka de Virgo", "Deathmask de Cáncer"], answer: 1, bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80" }
        ]
      },
      {
        id: "espectro-arena-9",
        title: "Arena 9: Sacrificios Heroicos",
        description: "Dieron su vida por otros.",
        questions: [
          { q: "¿En Naruto, quién usa el Sello Consumidor del Demonio de la Muerte para sellar a Kurama?", options: ["Hiruzen Sarutobi", "Jiraiya", "Minato Namikaze", "Kakashi Hatake"], answer: 2, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" },
          { q: "¿En Dragon Ball Z, quién se autodestruye para intentar matar a Majin Buu?", options: ["Goku", "Piccolo", "Vegeta", "Chaoz"], answer: 2, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿En Saint Seiya (Saga de Hades), quiénes se sacrifican en el Muro de los Lamentos?", options: ["Los Caballeros de Bronce", "Atenea", "Los 12 Caballeros de Oro", "Los Espectros"], answer: 2, bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80" },
          { q: "¿En One Piece, quién se sacrifica para salvar a la tripulación en el Archipiélago Sabaody (aparentemente)?", options: ["Zoro", "Bartholomew Kuma", "Rayleigh", "Jinbe"], answer: 1, bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80" },
          { q: "¿En Demon Slayer, qué Pilar da su vida protegiendo a los pasajeros del Tren Infinito?", options: ["Tengen Uzui", "Giyu Tomioka", "Kyojuro Rengoku", "Shinobu Kocho"], answer: 2, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" }
        ]
      },
      {
        id: "espectro-arena-10",
        title: "Arena 10: Villanos Incomprendidos",
        description: "El fin justifica los medios.",
        questions: [
          { q: "¿En Naruto, cuál era el verdadero objetivo de Itachi Uchiha al masacrar a su clan?", options: ["Probar su fuerza", "Evitar un golpe de estado y una guerra civil", "Obtener el Mangekyou Sharingan Eterno", "Órdenes de Akatsuki"], answer: 1, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" },
          { q: "¿En Death Note, cuál es la justificación de Light Yagami para matar?", options: ["Venganza personal", "Crear un mundo sin crimen donde él sea el dios", "Aburrimiento", "Órdenes de Ryuk"], answer: 1, bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80" },
          { q: "¿En LoL, por qué Sylas inició una rebelión en Demacia?", options: ["Por poder político", "Para liberar a los magos oprimidos y encarcelados", "Para servir a Noxus", "Por locura"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿En Attack on Titan, por qué Zeke Jaeger quiere esterilizar a los Eldianos?", options: ["Para que mueran lentamente y acabar con el sufrimiento de los Titanes", "Para que Marley domine el mundo", "Porque odia a su padre", "Para revivir a Ymir"], answer: 0, bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80" },
          { q: "¿En Fullmetal Alchemist, por qué Scar asesina a los Alquimistas Estatales?", options: ["Por placer", "Venganza por el genocidio de su pueblo, Ishval", "Para obtener la Piedra Filosofal", "Porque es un Homúnculo"], answer: 1, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" }
        ]
      }
    ]
  },
  {
    id: "level-5",
    name: "Dios",
    description: "Nivel Extremadamente Difícil. Solo Hades conoce las respuestas.",
    arenas: [
      {
        id: "dios-arena-1",
        title: "Arena 1: Campos Elíseos",
        description: "El desafío definitivo.",
        questions: [
          {
            q: "¿En el manga de Saint Seiya, de qué color es originalmente el cabello de Shun de Andrómeda?",
            options: ["Verde", "Castaño", "Rubio", "Rojo"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80"
          },
          {
            q: "¿Qué parche de League of Legends introdujo el mapa de la Grieta del Invocador actualizado visualmente?",
            options: ["Parche 4.20", "Parche 5.1", "Parche 4.19", "Parche 3.14"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
          },
          {
            q: "¿Cuál es el nombre del creador de la serie 'Lain' (Serial Experiments Lain)?",
            options: ["Hideaki Anno", "Yoshitoshi ABe", "Satoshi Kon", "Mamoru Oshii"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80"
          },
          {
            q: "¿En qué año se lanzó el primer volumen del manga de Berserk?",
            options: ["1989", "1992", "1987", "1990"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          },
          {
            q: "¿Qué actor de voz (Seiyuu) interpreta a Dio Brando en JoJo's Bizarre Adventure?",
            options: ["Daisuke Ono", "Tomokazu Sugita", "Takehito Koyasu", "Hiroshi Kamiya"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
          },
          {
            q: "¿En el lore antiguo de LoL, quién era el invocador que controlaba a Lee Sin?",
            options: ["Reginald Ashram", "Kite", "No tenía invocador", "Él mismo se invocaba"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"
          },
          {
            q: "¿Cuál es el subtítulo exacto de la película Evangelion: 3.0?",
            options: ["You Can (Not) Advance", "You Can (Not) Redo", "Thrice Upon a Time", "You Are (Not) Alone"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80"
          },
          {
            q: "¿En el manga original de Yu-Gi-Oh!, a qué juego desafía Yami Yugi a Seto Kaiba en su primer encuentro?",
            options: ["Duelo de Monstruos", "Capsule Monsters", "Death-T", "Un juego de cartas con cuchillos"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          },
          {
            q: "¿Qué estudio de animación produjo la OVA 'Angel's Egg' (Tenshi no Tamago)?",
            options: ["Studio Ghibli", "Studio Deen", "Toei Animation", "Madhouse"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80"
          },
          {
            q: "¿En Saint Seiya, cuál es el nombre de la técnica secreta de Shaka de Virgo que quita los 5 sentidos?",
            options: ["Tenbu Horin", "Rikudo Rinne", "Tenma Kofuku", "Ohm"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80"
          }
        ]
      },
      {
        id: "dios-arena-2",
        title: "Arena 2: Hipermito",
        description: "El origen del universo.",
        questions: [
          {
            q: "¿En el Hipermito de Saint Seiya, qué dios le dio a Atenea la armadura (Kamui)?",
            options: ["Zeus", "Hefesto", "Nadie, nació con ella", "Urano"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80"
          },
          {
            q: "¿Qué campeón de LoL es conocido como 'El Forjador de Estrellas'?",
            options: ["Bard", "Aurelion Sol", "Zoe", "Pantheon"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80"
          },
          {
            q: "¿En qué año se lanzó el juego original de 'Fate/stay night'?",
            options: ["2002", "2004", "2006", "2008"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"
          },
          {
            q: "¿Quién es el dios primordial del Caos en la mitología griega (y Saint Seiya)?",
            options: ["Cronos", "Urano", "Caos", "Eros"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80"
          },
          {
            q: "¿Qué objeto místico usan los Aspectos en Targon (LoL)?",
            options: ["Piedras Rúnicas", "Armas Celestiales", "El poder del sol y la luna", "No usan objetos, son entidades"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
          }
        ]
      },
      {
        id: "dios-arena-3",
        title: "Arena 3: Secretos de los Dioses",
        description: "Preguntas imposibles.",
        questions: [
          {
            q: "¿En el manga de Saint Seiya Next Dimension, quién es el decimotercer Caballero Dorado?",
            options: ["Odysseus de Ofiuco", "Asclepio de Ofiuco", "Suikyo de Copa", "Shion de Aries"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80"
          },
          {
            q: "¿Cuántos capítulos tiene el manga original de 'Akira'?",
            options: ["120", "150", "180", "120 no, son 6 volúmenes de extensión variable"],
            answer: 3,
            bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80"
          },
          {
            q: "¿En qué año se fundó Riot Games?",
            options: ["2004", "2006", "2008", "2010"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
          },
          {
            q: "¿Cuál es el nombre del creador de la franquicia 'Gundam'?",
            options: ["Yoshiyuki Tomino", "Hideaki Anno", "Mamoru Oshii", "Hayao Miyazaki"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80"
          },
          {
            q: "¿Qué significa el nombre 'Seiya' en japonés?",
            options: ["Flecha Estelar", "Caballero de las Estrellas", "Pegaso Volador", "Héroe del Cosmos"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800&q=80"
          }
        ]
      },
      {
        id: "dios-arena-4",
        title: "Arena 4: Creadores y Estudios",
        description: "El detrás de escena del anime y los juegos.",
        questions: [
          {
            q: "¿Qué estudio de animación fue fundado por ex-miembros de Gainax y produjo Kill la Kill?",
            options: ["MAPPA", "Trigger", "Bones", "Ufotable"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80"
          },
          {
            q: "¿Quién es el autor del manga 'Vagabond'?",
            options: ["Kentaro Miura", "Takehiko Inoue", "Naoki Urasawa", "Makoto Yukimura"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=800&q=80"
          },
          {
            q: "¿Qué compositor creó la banda sonora de Nier: Automata?",
            options: ["Nobuo Uematsu", "Keiichi Okabe", "Yoko Shimomura", "Shoji Meguro"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
          },
          {
            q: "¿En qué año se publicó el primer capítulo de One Piece en la Weekly Shonen Jump?",
            options: ["1995", "1997", "1999", "2001"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
          },
          {
            q: "¿Qué diseñador de personajes trabajó en Final Fantasy, Vampire Hunter D y Castlevania?",
            options: ["Tetsuya Nomura", "Yoshitaka Amano", "Ayami Kojima", "Akihiko Yoshida"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80"
          }
        ]
      },
      {
        id: "dios-arena-5",
        title: "Arena 5: Doblaje y Seiyuus",
        description: "Las voces detrás de las leyendas.",
        questions: [
          {
            q: "¿Qué famoso actor de doblaje latino le dio voz a Seiya de Pegaso?",
            options: ["Mario Castañeda", "René García", "Jesús Barrero", "Carlos Segundo"],
            answer: 2,
            bgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
          },
          {
            q: "¿Qué Seiyuu japonés interpreta a Levi Ackerman en Attack on Titan y a Trafalgar Law en One Piece?",
            options: ["Yuki Kaji", "Hiroshi Kamiya", "Daisuke Ono", "Mamoru Miyano"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80"
          },
          {
            q: "¿Quién es la voz original en japonés de Goku desde 1986?",
            options: ["Masako Nozawa", "Mayumi Tanaka", "Megumi Hayashibara", "Romi Park"],
            answer: 0,
            bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80"
          },
          {
            q: "¿Qué actor de doblaje latino es conocido por ser la voz de Vegeta y Hyoga de Cisne?",
            options: ["Mario Castañeda", "René García", "Gerardo Reyero", "Lalo Garza"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"
          },
          {
            q: "¿Qué Seiyuu interpreta a Jolyne Cujoh en JoJo's Stone Ocean y es una gran fan de la franquicia?",
            options: ["Miyuki Sawashiro", "Ai Fairouz", "Kana Hanazawa", "Aoi Yuki"],
            answer: 1,
            bgImage: "https://images.unsplash.com/photo-1542451542907-6cf80ff362d6?w=800&q=80"
          }
        ]
      },
      {
        id: "dios-arena-6",
        title: "Arena 6: Lore Oculto de LoL",
        description: "Secretos de Runaterra.",
        questions: [
          { q: "¿Quién forjó la espada de Aatrox?", options: ["Ornn", "Él mismo (es su propio cuerpo encarcelado)", "Zoe", "Pantheon"], answer: 1, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿Qué campeón de LoL es la manifestación de la Muerte en Runaterra?", options: ["Thresh", "Karthus", "Kindred", "Yone"], answer: 2, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿Cuál es el nombre del continente perdido de donde proviene Neeko?", options: ["Icathia", "Oovi-Kat", "Camavor", "Ixtal"], answer: 1, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
          { q: "¿Quién fue el rey de Camavor antes de Viego?", options: ["Vladimir", "Mordekaiser", "El padre de Viego (Rey anterior)", "Hecarim"], answer: 2, bgImage: "https://images.unsplash.com/photo-1614036417651-1d4789192759?w=800&q=80" },
          { q: "¿Qué demonio primordial representa el 'Miedo' en Runaterra?", options: ["Evelynn", "Tahm Kench", "Nocturne", "Fiddlesticks"], answer: 3, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" }
        ]
      },
      {
        id: "dios-arena-7",
        title: "Arena 7: Mitología en Saint Seiya",
        description: "Referencias mitológicas profundas.",
        questions: [
          { q: "¿En la mitología griega, quién es la madre de Atenea?", options: ["Hera", "Metis", "Afrodita", "Deméter"], answer: 1, bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80" },
          { q: "¿Qué dios gemelo sirve a Hades y representa el Sueño?", options: ["Thanatos", "Hypnos", "Morfeo", "Deimos"], answer: 1, bgImage: "https://images.unsplash.com/photo-1505506874110-6a7a6099837b?w=800&q=80" },
          { q: "¿En el Inframundo de Saint Seiya, qué río deben cruzar las almas pagando a Caronte?", options: ["Estigia", "Aqueronte", "Leteo", "Cocytos"], answer: 1, bgImage: "https://images.unsplash.com/photo-1505672678657-cc7037095e60?w=800&q=80" },
          { q: "¿Qué monstruo mitológico derrotó Belerofonte montando a Pegaso?", options: ["Medusa", "El Minotauro", "La Quimera", "La Hidra"], answer: 2, bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
          { q: "¿En Saint Seiya Omega, quién es el dios romano del tiempo y antagonista principal de la segunda temporada?", options: ["Marte", "Saturno", "Júpiter", "Apolo"], answer: 1, bgImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" }
        ]
      },
      {
        id: "dios-arena-8",
        title: "Arena 8: Creadores y Estudios",
        description: "Los arquitectos del anime.",
        questions: [
          { q: "¿Qué estudio de animación produjo las primeras temporadas de Attack on Titan?", options: ["MAPPA", "Wit Studio", "Madhouse", "Bones"], answer: 1, bgImage: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&q=80" },
          { q: "¿Quién es el mangaka creador de Hunter x Hunter y Yu Yu Hakusho?", options: ["Akira Toriyama", "Eiichiro Oda", "Yoshihiro Togashi", "Masashi Kishimoto"], answer: 2, bgImage: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&q=80" },
          { q: "¿Qué famoso estudio fundó Hayao Miyazaki?", options: ["Toei Animation", "Kyoto Animation", "Studio Ghibli", "Ufotable"], answer: 2, bgImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80" },
          { q: "¿Qué estudio es famoso por su increíble animación en Demon Slayer y Fate/stay night?", options: ["Ufotable", "MAPPA", "Pierrot", "A-1 Pictures"], answer: 0, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" },
          { q: "¿Quién es el creador de la franquicia Saint Seiya?", options: ["Masami Kurumada", "Shingo Araki", "Megumu Okada", "Shiori Teshirogi"], answer: 0, bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80" }
        ]
      },
      {
        id: "dios-arena-9",
        title: "Arena 9: Curiosidades de Desarrollo",
        description: "Secretos de producción.",
        questions: [
          { q: "¿Qué campeón de LoL fue cancelado durante el desarrollo y se llamaba 'Omen'?", options: ["Un demonio con forma de araña/bestia", "Un dragón de agua", "Un cyborg asesino", "Un mago de arena"], answer: 0, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿Por qué Masashi Kishimoto le puso gafas a Naruto en el primer capítulo?", options: ["Para que pareciera un nerd", "Porque era muy difícil dibujar las gafas repetidamente, así que las cambió por la banda ninja", "Porque era un homenaje a otro manga", "Para ocultar un Dojutsu"], answer: 1, bgImage: "https://images.unsplash.com/photo-1504333638930-c8787321ffa0?w=800&q=80" },
          { q: "¿Qué famoso mangaka fue asistente de Nobuhiro Watsuki (Rurouni Kenshin)?", options: ["Eiichiro Oda (One Piece)", "Tite Kubo (Bleach)", "Masashi Kishimoto (Naruto)", "Akira Toriyama (Dragon Ball)"], answer: 0, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" },
          { q: "¿En Neon Genesis Evangelion, por qué los últimos dos episodios ocurren en la mente de Shinji?", options: ["Fue una decisión puramente artística desde el inicio", "Se quedaron sin presupuesto y tiempo de producción", "Hideaki Anno perdió el guion original", "Censura del canal de televisión"], answer: 1, bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80" },
          { q: "¿Qué nombre iba a tener originalmente 'Dragon Ball Z' antes de que Toriyama confundiera un '2' con una 'Z'?", options: ["Dragon Ball 2", "Dragon Ball Super", "Dragon Ball GT", "Dragon Ball X"], answer: 0, bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" }
        ]
      },
      {
        id: "dios-arena-10",
        title: "Arena 10: Lore Profundo (Nivel Experto)",
        description: "Solo para verdaderos eruditos.",
        questions: [
          { q: "¿En el lore de LoL, cómo se llama la entidad cósmica que creó a Aurelion Sol?", options: ["Los Vigilantes", "Targon", "No se sabe, él es el creador del universo", "Bardo"], answer: 2, bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
          { q: "¿En One Piece, qué es el 'Siglo Vacío'?", options: ["Un periodo de 100 años del que no hay registros históricos", "El tiempo que Gold Roger estuvo enfermo", "La era antes de las Frutas del Diablo", "El tiempo que Joy Boy estuvo dormido"], answer: 0, bgImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80" },
          { q: "¿En Saint Seiya (Hipermito), quién le dio a la humanidad la capacidad de usar el Cosmos?", options: ["Atenea", "Zeus", "Prometeo", "La Voluntad de los Dioses (Big Will)"], answer: 3, bgImage: "https://images.unsplash.com/photo-1533596482381-8079d38c1a63?w=800&q=80" },
          { q: "¿En Dark Souls (lore similar a anime oscuro), quién es el Señor de la Ceniza original?", options: ["Gwyn, Señor de la Luz Solar", "Artorias", "El Rey Sin Nombre", "Manus"], answer: 0, bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80" },
          { q: "¿En Evangelion, qué son exactamente los 'Ángeles'?", options: ["Extraterrestres de otra galaxia", "Demonios del infierno", "Humanos evolucionados", "Descendientes de Adán (otra rama evolutiva de la vida en la Tierra)"], answer: 3, bgImage: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80" }
        ]
      }
    ]
  }
];
