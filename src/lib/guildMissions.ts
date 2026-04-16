export interface GuildMission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  completed: boolean;
}

type GuildSnapshot = {
  id: string;
  score: number;
  members: string[];
  nodes?: string[];
};

type ResourceNode = {
  ownerGuildId: string | null;
};

export const getWeeklyGuildMissions = (
  guild?: GuildSnapshot | null,
  nodes: ResourceNode[] = []
): GuildMission[] => {
  if (!guild) return [];

  const controlledNodes = nodes.filter((node) => node.ownerGuildId === guild.id).length;
  const memberCount = guild.members.length;
  const guildScore = guild.score || 0;

  return [
    {
      id: 'guild_power',
      title: 'Acumular poder de escuadron',
      description: 'Supera un umbral semanal de poder total.',
      progress: guildScore,
      target: 5000,
      reward: '500 obolos para el fondo del escuadron',
      completed: guildScore >= 5000,
    },
    {
      id: 'guild_nodes',
      title: 'Controlar nodos estrategicos',
      description: 'Mantengan presencia sobre los recursos del mapa.',
      progress: controlledNodes,
      target: 2,
      reward: 'Bonus de recoleccion para todos los miembros',
      completed: controlledNodes >= 2,
    },
    {
      id: 'guild_roster',
      title: 'Completar destacamento',
      description: 'Recluta o mantengan un nucleo fuerte de miembros activos.',
      progress: memberCount,
      target: 6,
      reward: 'Buff de prestigio semanal',
      completed: memberCount >= 6,
    },
  ];
};
