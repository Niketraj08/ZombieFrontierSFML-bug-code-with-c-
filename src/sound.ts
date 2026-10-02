// Web Audio API Procedural Sound Engine
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (!soundEnabled) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export const playSound = {
  shoot(weaponName: string) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (weaponName === 'Shotgun') {
      // Deep heavy blast + noise burst
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);

      // Noise component
      createNoiseBurst(ctx, now, 0.2, 0.35);
    } else if (weaponName === 'Assault Rifle') {
      // Rapid sharp pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (weaponName === 'Plasma Rifle') {
      // Sci-fi pew
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Standard Pistol crack
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);

      createNoiseBurst(ctx, now, 0.07, 0.15);
    }
  },

  enemyShoot() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  },

  reload() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Click 1 (eject)
    playTone(ctx, 480, 'square', now, 0.05, 0.15);
    // Click 2 (insert)
    playTone(ctx, 620, 'triangle', now + 0.15, 0.06, 0.2);
  },

  explosion() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Low rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);

    createNoiseBurst(ctx, now, 0.5, 0.45);
  },

  heal() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    playTone(ctx, 330, 'sine', now, 0.1, 0.2);
    playTone(ctx, 440, 'sine', now + 0.08, 0.1, 0.2);
    playTone(ctx, 550, 'sine', now + 0.16, 0.18, 0.25);
  },

  hitPlayer() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    playTone(ctx, 110, 'sawtooth', now, 0.12, 0.3);
  },

  hitEnemy() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    playTone(ctx, 160 + Math.random() * 80, 'triangle', now, 0.05, 0.1);
  },

  killEnemy(isBoss = false) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (isBoss) {
      // Roar
      playTone(ctx, 90, 'sawtooth', now, 0.8, 0.4);
      createNoiseBurst(ctx, now, 0.7, 0.3);
    } else {
      playTone(ctx, 120, 'square', now, 0.1, 0.15);
    }
  },

  pickup(type: number) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (type === 0) {
      // Gold
      playTone(ctx, 880, 'sine', now, 0.08, 0.15);
      playTone(ctx, 1320, 'sine', now + 0.06, 0.1, 0.2);
    } else if (type === 1) {
      // Medkit
      playTone(ctx, 523.25, 'triangle', now, 0.09, 0.2);
      playTone(ctx, 659.25, 'triangle', now + 0.08, 0.12, 0.2);
    } else {
      // Grenade
      playTone(ctx, 300, 'square', now, 0.07, 0.2);
      playTone(ctx, 450, 'square', now + 0.07, 0.1, 0.2);
    }
  },

  levelUp() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      playTone(ctx, freq, 'triangle', now + idx * 0.08, 0.2, 0.25);
    });
  },

  questComplete() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    playTone(ctx, 523, 'sine', now, 0.1, 0.2);
    playTone(ctx, 659, 'sine', now + 0.09, 0.1, 0.2);
    playTone(ctx, 784, 'sine', now + 0.18, 0.1, 0.2);
    playTone(ctx, 1046, 'sine', now + 0.27, 0.3, 0.25);
  },

  uiClick() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    playTone(ctx, 500, 'sine', now, 0.04, 0.1);
  },

  victory() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((freq, idx) => {
      playTone(ctx, freq, 'sine', now + idx * 0.14, 0.4, 0.25);
    });
  },

  gameOver() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    playTone(ctx, 220, 'sawtooth', now, 0.3, 0.3);
    playTone(ctx, 196, 'sawtooth', now + 0.28, 0.3, 0.3);
    playTone(ctx, 164, 'sawtooth', now + 0.56, 0.5, 0.35);
  }
};

function playTone(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  gainVal: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function createNoiseBurst(ctx: AudioContext, startTime: number, duration: number, gainVal: number) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, startTime);
  filter.frequency.exponentialRampToValueAtTime(100, startTime + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(startTime);
  noise.stop(startTime + duration);
}
