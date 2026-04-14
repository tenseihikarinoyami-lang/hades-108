import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Server, Globe, Cpu } from 'lucide-react';

export const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <Activity className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
        <h1 className="text-4xl font-display font-bold text-white uppercase tracking-widest">Estado del Sistema</h1>
        <p className="text-muted-foreground font-mono">Infraestructura Serverless en Vercel</p>
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
                <p className="text-xs text-muted-foreground font-mono">Región: {status?.region || 'Global'}</p>
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
              <p className="text-2xl font-bold text-white">Vercel Edge</p>
              <p className="text-xs text-muted-foreground font-mono">Latencia: Optimizada</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-accent/20">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-accent flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Respuesta del Backend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-black/40 p-4 rounded font-mono text-xs text-green-400 overflow-x-auto">
            {JSON.stringify(status, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
