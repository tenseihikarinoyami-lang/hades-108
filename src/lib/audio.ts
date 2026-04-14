// Audio System for SFX and Ambient Music

class AudioSystem {
  private context: AudioContext | null = null;
  private ambientAudio: HTMLAudioElement | null = null;
  public isMuted: boolean = false;

  constructor() {
    // Initialize ambient music
    this.ambientAudio = new Audio('https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=dark-ambient-11438.mp3');
    this.ambientAudio.loop = true;
    this.ambientAudio.volume = 0.3;
  }

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ambientAudio) {
      this.ambientAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  public toggleAmbient(play: boolean) {
    if (!this.ambientAudio) return;
    if (play && !this.isMuted) {
      this.ambientAudio.play().catch(e => console.log('Audio autoplay prevented:', e));
    } else {
      this.ambientAudio.pause();
    }
  }

  // Generate sci-fi UI sounds using Web Audio API
  public playSFX(type: 'hover' | 'click' | 'success' | 'error' | 'damage' | 'shield' | 'power_activate' | 'boss_phase') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.context) return;

    const osc = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(this.context.destination);

    const now = this.context.currentTime;

    switch (type) {
      case 'hover':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'click':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'success':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1); // C#
        osc.frequency.setValueAtTime(659.25, now + 0.2); // E
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'shield':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'power_activate':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.5);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      case 'boss_phase':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, now);
        osc.frequency.setValueAtTime(100, now + 0.2);
        osc.frequency.setValueAtTime(50, now + 0.4);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      case 'error':
      case 'damage':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        // Add some noise/distortion for "cristal roto" effect
        if (type === 'damage') {
          const noise = this.context.createBufferSource();
          const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.3, this.context.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          noise.buffer = buffer;
          const noiseFilter = this.context.createBiquadFilter();
          noiseFilter.type = 'highpass';
          noiseFilter.frequency.value = 1000;
          noise.connect(noiseFilter);
          noiseFilter.connect(gainNode);
          noise.start(now);
        }

        osc.start(now);
        osc.stop(now + 0.3);
        break;
    }
  }
}

export const audio = new AudioSystem();
