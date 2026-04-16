import React, { useEffect, useState } from 'react';
import { Activity, Cpu, Globe, Server } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateEngagementMetrics, getRecentAnalyticsEvents } from '@/lib/analytics';

export const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(calculateEngagementMetrics());
  const [recentEvents, setRecentEvents] = useState(getRecentAnalyticsEvents());

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    setMetrics(calculateEngagementMetrics());
    setRecentEvents(getRecentAnalyticsEvents());
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <Activity className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
        <h1 className="text-4xl font-display font-bold text-white uppercase tracking-widest">Estado del Sistema</h1>
        <p className="text-muted-foreground font-mono">Infraestructura, telemetria y salud del cliente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-blue-400 flex items-center gap-2">
              <Server className="w-4 h-4" /> Servidor API
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse h-4 bg-white/10 rounded w-3/4" />
            ) : (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">{status?.status || 'Offline'}</p>
                <p className="text-xs text-muted-foreground font-mono">Region: {status?.region || 'Global'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-purple-400 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Despliegue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">Vercel Edge + PWA</p>
              <p className="text-xs text-muted-foreground font-mono">Telemetria local activa</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-accent/20">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-accent flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Telemetria del cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 bg-background/50 border border-accent/10 clip-diagonal text-center">
            <div className="text-2xl text-white font-display">{metrics.pageViews}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Page views</div>
          </div>
          <div className="p-3 bg-background/50 border border-accent/10 clip-diagonal text-center">
            <div className="text-2xl text-white font-display">{metrics.runCompletions}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Runs</div>
          </div>
          <div className="p-3 bg-background/50 border border-accent/10 clip-diagonal text-center">
            <div className="text-2xl text-white font-display">{metrics.economyEvents}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Economia</div>
          </div>
          <div className="p-3 bg-background/50 border border-accent/10 clip-diagonal text-center">
            <div className="text-2xl text-red-300 font-display">{metrics.errors}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Errores</div>
          </div>
          <div className="p-3 bg-background/50 border border-accent/10 clip-diagonal text-center">
            <div className="text-2xl text-cyan-300 font-display">{metrics.totalEvents}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Eventos</div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-accent/20">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-accent flex items-center gap-2">
            <Activity className="w-4 h-4" /> Eventos recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentEvents.length === 0 ? (
            <div className="text-sm text-muted-foreground font-mono">Todavia no hay eventos capturados.</div>
          ) : (
            recentEvents.map((event) => (
              <div key={`${event.eventName}-${event.timestamp}`} className="border border-accent/10 bg-background/40 p-3 clip-diagonal">
                <div className="flex justify-between items-center gap-4">
                  <div className="font-mono text-white">{event.eventName}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</div>
                </div>
                <pre className="mt-2 text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(event.properties, null, 2)}</pre>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-accent/20">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-accent flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Respuesta del backend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-black/40 p-4 rounded font-mono text-xs text-green-400 overflow-x-auto">{JSON.stringify(status, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
};
