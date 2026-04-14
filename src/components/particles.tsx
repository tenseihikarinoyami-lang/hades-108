// SISTEMA DE PARTÍCULAS - Efectos visuales avanzados
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  rotation: number;
  lifetime: number;
  age: number;
}

interface ParticleSystemProps {
  type: 'fire' | 'ice' | 'lightning' | 'void' | 'gold' | 'success' | 'error';
  count?: number;
  duration?: number;
  className?: string;
}

const PARTICLE_CONFIGS = {
  fire: {
    colors: ['#ff003c', '#ff4500', '#ff8c00', '#ffd700'],
    size: [2, 6],
    speed: [1, 3],
    lifetime: 1000,
    count: 30
  },
  ice: {
    colors: ['#00f0ff', '#87ceeb', '#b0e0e6', '#e0ffff'],
    size: [3, 8],
    speed: [0.5, 2],
    lifetime: 1500,
    count: 25
  },
  lightning: {
    colors: ['#ffff00', '#ffd700', '#ffffff', '#ff8c00'],
    size: [1, 3],
    speed: [5, 10],
    lifetime: 500,
    count: 20
  },
  void: {
    colors: ['#9400d3', '#8a2be2', '#4b0082', '#000000'],
    size: [4, 10],
    speed: [0.3, 1],
    lifetime: 2000,
    count: 35
  },
  gold: {
    colors: ['#ffd700', '#ffec8b', '#ffe4b5', '#fff8dc'],
    size: [2, 5],
    speed: [0.5, 2],
    lifetime: 1500,
    count: 20
  },
  success: {
    colors: ['#00ff00', '#32cd32', '#90ee90', '#98fb98'],
    size: [3, 7],
    speed: [1, 3],
    lifetime: 1000,
    count: 25
  },
  error: {
    colors: ['#ff0000', '#dc143c', '#ff4500', '#ff6347'],
    size: [2, 6],
    speed: [1, 4],
    lifetime: 800,
    count: 20
  }
};

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  type,
  count,
  duration = 2000,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const config = PARTICLE_CONFIGS[type];
    const particleCount = count || config.count;

    // Crear partículas iniciales
    const createParticle = (): Particle => {
      const colorIndex = Math.floor(Math.random() * config.colors.length);
      return {
        id: Math.random(),
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
        speed: config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]),
        opacity: 1,
        color: config.colors[colorIndex],
        rotation: Math.random() * 360,
        lifetime: config.lifetime,
        age: 0
      };
    };

    particlesRef.current = Array.from({ length: particleCount }, createParticle);

    // Animación
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;

      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Actualizar
        particle.age += 16; // ~60fps
        particle.y -= particle.speed;
        particle.x += Math.sin(particle.age * 0.01) * 0.5;
        particle.rotation += 2;
        particle.opacity = 1 - (particle.age / particle.lifetime);

        // Reset si muere
        if (particle.age > particle.lifetime || particle.opacity <= 0) {
          particlesRef.current[index] = createParticle();
          return;
        }

        // Dibujar
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [type, count, duration]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-50 ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

// Componente de explosión de partículas para eventos específicos
export const ParticleExplosion: React.FC<{
  type: 'fire' | 'ice' | 'lightning' | 'void' | 'gold' | 'success' | 'error';
  show: boolean;
  x?: number;
  y?: number;
}> = ({ type, show, x = 50, y = 50 }) => {
  if (!show) return null;

  const colors = {
    fire: ['#ff003c', '#ff4500', '#ff8c00'],
    ice: ['#00f0ff', '#87ceeb', '#b0e0e6'],
    lightning: ['#ffff00', '#ffd700', '#ffffff'],
    void: ['#9400d3', '#8a2be2', '#4b0082'],
    gold: ['#ffd700', '#ffec8b', '#ffe4b5'],
    success: ['#00ff00', '#32cd32', '#90ee90'],
    error: ['#ff0000', '#dc143c', '#ff4500']
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50" style={{ left: `${x}%`, top: `${y}%` }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [1, 0.8, 0],
            x: [0, (Math.random() - 0.5) * 200],
            y: [0, (Math.random() - 0.5) * 200]
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: colors[type][Math.floor(Math.random() * colors[type].length)],
            boxShadow: `0 0 10px ${colors[type][0]}`
          }}
        />
      ))}
    </div>
  );
};

// Fondo de partículas ambiental
export const AmbientParticles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
};
