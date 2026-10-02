export interface Vector2 {
  x: number;
  y: number;
}

export interface Weapon {
  name: string;
  damage: number;
  delay: number;
  magazine: number;
  ammo: number;
  reserve: number;
  maxReserve: number;
  price: number;
  owned: boolean;
}

export interface Player {
  pos: Vector2;
  speed: number;
  radius: number;
  hp: number;
  maxHp: number;
  armor: number;
  level: number;
  xp: number;
  gold: number;
  score: number;
  kills: number;
  grenades: number;
  medkits: number;
  weapon: number; // index
  fireTimer: number;
  grenadeTimer: number;
  invuln: number;
}

export interface Enemy {
  pos: Vector2;
  type: number; // 0=Walker, 1=Runner, 2=Spitter, 3=Brute, 4=Necro Lord
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  damage: number;
  xp: number;
  gold: number;
  attackTimer: number;
  flash: number;
}

export interface Bullet {
  pos: Vector2;
  vel: Vector2;
  damage: number;
  life: number;
  radius: number;
  enemy: boolean;
}

export interface Pickup {
  pos: Vector2;
  type: number; // 0: Gold, 1: Medkit, 2: Grenade
  value: number;
  pulse: number;
}

export interface Particle {
  pos: Vector2;
  vel: Vector2;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface DamageFloater {
  pos: Vector2;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface Quest {
  title: string;
  description: string;
  target: number;
  progress: number;
  gold: number;
  xp: number;
  complete: boolean;
}

export type ScreenType = 'menu' | 'playing' | 'help' | 'about';

export interface OverlayState {
  paused: boolean;
  shop: boolean;
  inventory: boolean;
  questLog: boolean;
  stats: boolean;
  gameOver: boolean;
  victory: boolean;
}
