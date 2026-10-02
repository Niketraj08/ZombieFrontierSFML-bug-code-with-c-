import { Bullet, DamageFloater, Enemy, OverlayState, Particle, Pickup, Player, Quest, ScreenType, Vector2, Weapon } from './types.ts';
import { playSound } from '../sound.ts';

export const WINDOW_W = 1280;
export const WINDOW_H = 720;
export const WORLD_W = 3200;
export const WORLD_H = 2200;

export function len(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function norm(v: Vector2): Vector2 {
  const l = len(v);
  return l < 0.001 ? { x: 0, y: 0 } : { x: v.x / l, y: v.y / l };
}

export function dist(a: Vector2, b: Vector2): number {
  return len({ x: a.x - b.x, y: a.y - b.y });
}

export function rnd(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

export function frnd(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

export class GameEngine {
  player!: Player;
  weapons!: Weapon[];
  enemies: Enemy[] = [];
  bullets: Bullet[] = [];
  pickups: Pickup[] = [];
  particles: Particle[] = [];
  damageFloaters: DamageFloater[] = [];
  quests!: Quest[];

  screen: ScreenType = 'menu';
  menuIndex: number = 0;
  wave: number = 1;
  killsWave: number = 0;

  overlays: OverlayState = {
    paused: false,
    shop: false,
    inventory: false,
    questLog: false,
    stats: false,
    gameOver: false,
    victory: false,
  };

  spawnTimer: number = 0;
  bossTimer: number = 0;
  camera: Vector2 = { x: 1600, y: 1100 };
  mouseWorld: Vector2 = { x: 1600, y: 1100 };
  mouseScreen: Vector2 = { x: 640, y: 360 };
  mouseHeld: boolean = false;
  keysDown: Set<string> = new Set();

  onStateChange?: () => void;

  constructor() {
    this.init();
  }

  init() {
    this.initWeapons();
    this.initQuests();
    this.reset();
  }

  initWeapons() {
    this.weapons = [
      { name: 'Pistol', damage: 18, delay: 0.28, magazine: 12, ammo: 12, reserve: 72, maxReserve: 120, price: 0, owned: true },
      { name: 'Shotgun', damage: 36, delay: 0.70, magazine: 6, ammo: 6, reserve: 36, maxReserve: 60, price: 450, owned: false },
      { name: 'Assault Rifle', damage: 24, delay: 0.11, magazine: 30, ammo: 30, reserve: 120, maxReserve: 240, price: 900, owned: false },
      { name: 'Plasma Rifle', damage: 62, delay: 0.40, magazine: 10, ammo: 10, reserve: 50, maxReserve: 80, price: 1700, owned: false },
    ];
  }

  initQuests() {
    this.quests = [
      { title: 'First Blood', description: 'Kill 5 enemies.', target: 5, progress: 0, gold: 150, xp: 100, complete: false },
      { title: 'Zombie Hunter', description: 'Kill 20 enemies.', target: 20, progress: 0, gold: 500, xp: 350, complete: false },
      { title: 'Survivor', description: 'Reach level 5.', target: 5, progress: 0, gold: 750, xp: 500, complete: false },
      { title: 'Armed', description: 'Own 3 weapons.', target: 3, progress: 0, gold: 900, xp: 500, complete: false },
    ];
  }

  reset() {
    this.player = {
      pos: { x: 1600, y: 1100 },
      speed: 280,
      radius: 20,
      hp: 100,
      maxHp: 100,
      armor: 0,
      level: 1,
      xp: 0,
      gold: 150,
      score: 0,
      kills: 0,
      grenades: 3,
      medkits: 3,
      weapon: 0,
      fireTimer: 0,
      grenadeTimer: 0,
      invuln: 0,
    };

    for (let i = 0; i < this.weapons.length; i++) {
      this.weapons[i].owned = (i === 0);
      this.weapons[i].ammo = this.weapons[i].magazine;
      this.weapons[i].reserve = i === 0 ? 72 : Math.floor(this.weapons[i].maxReserve / 2);
    }

    this.initQuests();
    this.enemies = [];
    this.bullets = [];
    this.pickups = [];
    this.particles = [];
    this.damageFloaters = [];
    this.wave = 1;
    this.killsWave = 0;
    this.spawnTimer = 0;
    this.bossTimer = 0;

    this.overlays = {
      paused: false,
      shop: false,
      inventory: false,
      questLog: false,
      stats: false,
      gameOver: false,
      victory: false,
    };

    for (let i = 0; i < 5; i++) {
      this.spawnEnemy(i % 2);
    }
    this.updateCamera();
    this.notify();
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  weapon(): Weapon {
    return this.weapons[this.player.weapon] || this.weapons[0];
  }

  damageMultiplier(): number {
    return 1 + (this.player.level - 1) * 0.07;
  }

  neededXp(): number {
    return 100 + (this.player.level - 1) * 80;
  }

  blocked(p: Vector2, r: number): boolean {
    return p.x - r < 0 || p.y - r < 0 || p.x + r > WORLD_W || p.y + r > WORLD_H;
  }

  spawnPosition(): Vector2 {
    for (let i = 0; i < 100; i++) {
      const p: Vector2 = { x: frnd(80, WORLD_W - 80), y: frnd(100, WORLD_H - 80) };
      if (dist(p, this.player.pos) > 550 && !this.blocked(p, 40)) {
        return p;
      }
    }
    return { x: 100, y: 100 };
  }

  enemyColor(type: number): string {
    if (type === 0) return '#5abe64';
    if (type === 1) return '#dcb43c';
    if (type === 2) return '#5096dc';
    if (type === 3) return '#dc5a50';
    return '#b432d2';
  }

  enemyName(type: number): string {
    if (type === 0) return 'Walker';
    if (type === 1) return 'Runner';
    if (type === 2) return 'Spitter';
    if (type === 3) return 'Brute';
    return 'Necro Lord';
  }

  baseHp(type: number): number {
    if (type === 0) return 55;
    if (type === 1) return 40;
    if (type === 2) return 85;
    if (type === 3) return 150;
    return 2200;
  }

  baseDamage(type: number): number {
    if (type === 0) return 9;
    if (type === 1) return 7;
    if (type === 2) return 12;
    if (type === 3) return 20;
    return 35;
  }

  baseSpeed(type: number): number {
    if (type === 0) return 75;
    if (type === 1) return 125;
    if (type === 2) return 55;
    if (type === 3) return 48;
    return 45;
  }

  baseXp(type: number): number {
    if (type === 0) return 25;
    if (type === 1) return 35;
    if (type === 2) return 55;
    if (type === 3) return 90;
    return 1200;
  }

  baseGold(type: number): number {
    if (type === 0) return 15;
    if (type === 1) return 25;
    if (type === 2) return 45;
    if (type === 3) return 80;
    return 1500;
  }

  spawnEnemy(type: number = -1) {
    if (type < 0) {
      const r = rnd(1, 100);
      if (this.wave < 2) type = 0;
      else if (this.wave < 4) type = r < 70 ? 0 : 1;
      else if (this.wave < 7) type = r < 45 ? 0 : (r < 75 ? 1 : 2);
      else type = r < 35 ? 0 : (r < 60 ? 1 : (r < 85 ? 2 : 3));
    }
    this.addEnemy(this.spawnPosition(), type);
  }

  addEnemy(p: Vector2, type: number) {
    const scale = 1 + this.wave * 0.09;
    let radius = 18;
    let maxHp = Math.floor(this.baseHp(type) * scale);
    let damage = Math.floor(this.baseDamage(type) * scale);
    let speed = this.baseSpeed(type);
    let xp = Math.floor(this.baseXp(type) * scale);
    let gold = Math.floor(this.baseGold(type) * scale);

    if (type === 0) radius = 18;
    if (type === 1) radius = 17;
    if (type === 2) radius = 21;
    if (type === 3) radius = 29;

    if (type === 4) {
      radius = 58;
      maxHp = 2200 + this.wave * 220;
      damage = 35 + this.wave * 4;
      speed = 45;
      xp = 1200;
      gold = 1500;
    }

    const enemy: Enemy = {
      pos: p,
      type,
      radius,
      speed,
      hp: maxHp,
      maxHp,
      damage,
      xp,
      gold,
      attackTimer: 0,
      flash: 0,
    };
    this.enemies.push(enemy);
  }

  spawnBoss() {
    this.addEnemy(this.spawnPosition(), 4);
    const last = this.enemies[this.enemies.length - 1];
    if (last) {
      this.particlesAt(last.pos, '#be28e6', 90);
    }
    playSound.killEnemy(true);
  }

  bossUnlocked(): boolean {
    return this.player.level >= 5;
  }

  bossAlive(): boolean {
    return this.enemies.some(e => e.type === 4);
  }

  ownedWeapons(): number {
    return this.weapons.filter(w => w.owned).length;
  }

  update(dt: number) {
    if (this.screen !== 'playing') return;
    if (
      this.overlays.paused ||
      this.overlays.shop ||
      this.overlays.inventory ||
      this.overlays.questLog ||
      this.overlays.stats ||
      this.overlays.gameOver ||
      this.overlays.victory
    ) {
      return;
    }

    this.player.fireTimer -= dt;
    this.player.grenadeTimer -= dt;
    this.player.invuln -= dt;

    this.updatePlayer(dt);

    if (this.mouseHeld) {
      this.shoot();
    }

    this.updateEnemies(dt);
    this.updateBullets(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);
    this.updateDamageFloaters(dt);
    this.updateCamera();

    this.spawnTimer += dt;
    const maxEnemies = 7 + this.wave * 2;
    if (this.spawnTimer > Math.max(0.5, 2.1 - this.wave * 0.07)) {
      this.spawnTimer = 0;
      if (this.enemies.length < maxEnemies) {
        this.spawnEnemy();
      }
    }

    if (this.killsWave >= 5 + this.wave * 2) {
      this.nextWave();
    }

    this.questsUpdate();
    this.levelUp();

    if (this.player.hp <= 0 && !this.overlays.gameOver) {
      this.overlays.gameOver = true;
      playSound.gameOver();
      this.notify();
    }

    if (this.bossUnlocked() && this.wave >= 5 && !this.bossAlive() && this.bossTimer <= 0) {
      this.spawnBoss();
      this.bossTimer = 999999;
    }
  }

  updatePlayer(dt: number) {
    let dx = 0;
    let dy = 0;

    if (this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp')) dy -= 1;
    if (this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown')) dy += 1;
    if (this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft')) dx -= 1;
    if (this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight')) dx += 1;

    const d = norm({ x: dx, y: dy });
    const nx = this.player.pos.x + d.x * this.player.speed * dt;
    const ny = this.player.pos.y + d.y * this.player.speed * dt;

    if (!this.blocked({ x: nx, y: this.player.pos.y }, this.player.radius)) {
      this.player.pos.x = nx;
    }
    if (!this.blocked({ x: this.player.pos.x, y: ny }, this.player.radius)) {
      this.player.pos.y = ny;
    }

    this.player.pos.x = Math.max(this.player.radius, Math.min(WORLD_W - this.player.radius, this.player.pos.x));
    this.player.pos.y = Math.max(this.player.radius, Math.min(WORLD_H - this.player.radius, this.player.pos.y));
  }

  updateCamera() {
    const hw = WINDOW_W / 2;
    const hh = WINDOW_H / 2;
    this.camera.x = Math.max(hw, Math.min(WORLD_W - hw, this.player.pos.x));
    this.camera.y = Math.max(hh, Math.min(WORLD_H - hh, this.player.pos.y));
  }

  shoot() {
    const w = this.weapon();
    if (this.player.fireTimer > 0) return;

    if (w.ammo <= 0) {
      this.reload();
      return;
    }

    const d = norm({ x: this.mouseWorld.x - this.player.pos.x, y: this.mouseWorld.y - this.player.pos.y });
    if (len(d) < 0.01) return;

    w.ammo--;
    this.player.fireTimer = w.delay;
    const damage = Math.floor(w.damage * this.damageMultiplier());

    playSound.shoot(w.name);

    if (w.name === 'Shotgun') {
      for (let i = -2; i <= 2; i++) {
        const a = Math.atan2(d.y, d.x) + i * 0.07;
        const v = { x: Math.cos(a), y: Math.sin(a) };
        this.bullets.push({
          pos: { x: this.player.pos.x + v.x * 25, y: this.player.pos.y + v.y * 25 },
          vel: { x: v.x * 900, y: v.y * 900 },
          damage,
          life: 1.3,
          radius: 5,
          enemy: false,
        });
      }
    } else {
      this.bullets.push({
        pos: { x: this.player.pos.x + d.x * 25, y: this.player.pos.y + d.y * 25 },
        vel: { x: d.x * 1050, y: d.y * 1050 },
        damage,
        life: 1.7,
        radius: w.name === 'Plasma Rifle' ? 7 : 5,
        enemy: false,
      });
    }

    this.muzzle({ x: this.player.pos.x + d.x * 28, y: this.player.pos.y + d.y * 28 }, d);
    this.notify();
  }

  reload() {
    const w = this.weapon();
    const need = w.magazine - w.ammo;
    if (need <= 0 || w.reserve <= 0) return;
    const take = Math.min(need, w.reserve);
    w.ammo += take;
    w.reserve -= take;
    playSound.reload();
    this.notify();
  }

  grenade() {
    if (this.player.grenadeTimer > 0 || this.player.grenades <= 0) return;
    const d = norm({ x: this.mouseWorld.x - this.player.pos.x, y: this.mouseWorld.y - this.player.pos.y });
    if (len(d) < 0.01) return;

    this.player.grenades--;
    this.player.grenadeTimer = 0.8;
    const target = { x: this.player.pos.x + d.x * 300, y: this.player.pos.y + d.y * 300 };
    this.explosion(target, 155, 90);
    this.notify();
  }

  heal() {
    if (this.player.medkits <= 0 || this.player.hp >= this.player.maxHp) return;
    this.player.medkits--;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
    this.particlesAt(this.player.pos, '#46e664', 20);
    playSound.heal();
    this.notify();
  }

  updateEnemies(dt: number) {
    for (const e of this.enemies) {
      e.attackTimer -= dt;
      e.flash -= dt;

      const to = { x: this.player.pos.x - e.pos.x, y: this.player.pos.y - e.pos.y };
      const d = len(to);

      if (d > e.radius + this.player.radius + 8) {
        const v = norm(to);
        let mult = 1;
        if (e.type === 1) mult = 1.65;
        if (e.type === 2) mult = 0.72;
        if (e.type === 3) mult = 0.62;
        if (e.type === 4) mult = 0.55;

        const nx = e.pos.x + v.x * e.speed * mult * dt;
        const ny = e.pos.y + v.y * e.speed * mult * dt;
        if (!this.blocked({ x: nx, y: ny }, e.radius)) {
          e.pos.x = nx;
          e.pos.y = ny;
        }
      } else if (e.attackTimer <= 0) {
        this.enemyAttack(e);
      }

      // Spitter ranged shot
      if (e.type === 2 && d < 700 && e.attackTimer <= 0) {
        const v = norm(to);
        this.bullets.push({
          pos: { x: e.pos.x + v.x * 25, y: e.pos.y + v.y * 25 },
          vel: { x: v.x * 430, y: v.y * 430 },
          damage: e.damage,
          life: 2.0,
          radius: 6,
          enemy: true,
        });
        e.attackTimer = 1.5;
        playSound.enemyShoot();
      }

      // Brute 3-way spread shot
      if (e.type === 3 && d < 520 && e.attackTimer <= 0) {
        const v = norm(to);
        for (let i = -1; i <= 1; i++) {
          const a = Math.atan2(v.y, v.x) + i * 0.14;
          const q = { x: Math.cos(a), y: Math.sin(a) };
          this.bullets.push({
            pos: { x: e.pos.x, y: e.pos.y },
            vel: { x: q.x * 470, y: q.y * 470 },
            damage: e.damage,
            life: 1.8,
            radius: 7,
            enemy: true,
          });
        }
        e.attackTimer = 2.0;
        playSound.enemyShoot();
      }
    }
  }

  enemyAttack(e: Enemy) {
    let damage = e.damage;
    if (e.type === 4) {
      damage += rnd(5, 15);
    }
    damage = Math.max(1, damage - this.player.armor);
    this.hurtPlayer(damage);
    e.attackTimer = e.type === 4 ? 0.8 : 1.0;
  }

  hurtPlayer(amount: number) {
    if (this.player.invuln > 0) return;
    this.player.hp = Math.max(0, this.player.hp - amount);
    this.player.invuln = 0.35;
    this.particlesAt(this.player.pos, '#ff4646', 10);
    this.addDamageFloater(this.player.pos, `-${amount}`, '#ff4646');
    playSound.hitPlayer();
    this.notify();
  }

  updateBullets(dt: number) {
    for (let i = 0; i < this.bullets.length; ) {
      const b = this.bullets[i];
      b.pos.x += b.vel.x * dt;
      b.pos.y += b.vel.y * dt;
      b.life -= dt;
      let remove = b.life <= 0 || this.blocked(b.pos, b.radius);

      if (!remove && b.enemy && dist(b.pos, this.player.pos) < b.radius + this.player.radius) {
        this.hurtPlayer(b.damage);
        remove = true;
      }

      if (!remove && !b.enemy) {
        for (let j = 0; j < this.enemies.length; j++) {
          const e = this.enemies[j];
          if (dist(b.pos, e.pos) < b.radius + e.radius) {
            this.hurtEnemy(e, b.damage);
            if (e.hp <= 0) {
              this.killEnemy(j);
            }
            remove = true;
            break;
          }
        }
      }

      if (remove) {
        this.bullets.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  hurtEnemy(e: Enemy, amount: number) {
    e.hp = Math.max(0, e.hp - amount);
    e.flash = 0.08;
    this.particlesAt(e.pos, this.enemyColor(e.type), 3);
    this.addDamageFloater(e.pos, `${amount}`, '#ffe650');
    playSound.hitEnemy();
  }

  killEnemy(index: number) {
    if (index >= this.enemies.length) return;
    const e = this.enemies[index];

    this.player.kills++;
    this.killsWave++;
    this.addGold(e.gold);
    this.addXp(e.xp);
    this.addScore(e.xp * 10);

    this.particlesAt(e.pos, this.enemyColor(e.type), 28);
    playSound.killEnemy(e.type === 4);

    const r = rnd(1, 100);
    if (r <= 14) this.pickup(e.pos, 0, 30);
    else if (r <= 21) this.pickup(e.pos, 1, 1);
    else if (r <= 28) this.pickup(e.pos, 2, 1);

    if (e.type === 4) {
      this.addGold(1500);
      this.addXp(1500);
      this.addScore(10000);
      this.overlays.victory = true;
      playSound.victory();
    }

    this.enemies.splice(index, 1);
    this.notify();
  }

  updatePickups(dt: number) {
    for (const p of this.pickups) {
      p.pulse += dt * 5;
    }

    for (let i = 0; i < this.pickups.length; ) {
      const p = this.pickups[i];
      if (dist(this.player.pos, p.pos) < 42) {
        if (p.type === 0) {
          this.addGold(p.value);
          this.addScore(p.value * 2);
          this.addDamageFloater(p.pos, `+${p.value} Gold`, '#ffd732');
        } else if (p.type === 1) {
          this.player.medkits++;
          this.addDamageFloater(p.pos, `+1 Medkit`, '#46e664');
        } else {
          this.player.grenades++;
          this.addDamageFloater(p.pos, `+1 Grenade`, '#e66428');
        }

        playSound.pickup(p.type);
        this.particlesAt(p.pos, '#ffdc46', 10);
        this.pickups.splice(i, 1);
        this.notify();
      } else {
        i++;
      }
    }
  }

  updateParticles(dt: number) {
    for (let i = 0; i < this.particles.length; ) {
      const p = this.particles[i];
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.vel.x *= 0.92;
      p.vel.y *= 0.92;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  updateDamageFloaters(dt: number) {
    for (let i = 0; i < this.damageFloaters.length; ) {
      const f = this.damageFloaters[i];
      f.pos.y -= 30 * dt;
      f.life -= dt;
      if (f.life <= 0) {
        this.damageFloaters.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  addDamageFloater(pos: Vector2, text: string, color: string) {
    this.damageFloaters.push({
      pos: { x: pos.x + frnd(-10, 10), y: pos.y - 15 },
      text,
      color,
      life: 0.8,
      maxLife: 0.8,
    });
  }

  pickup(p: Vector2, type: number, value: number) {
    this.pickups.push({ pos: { ...p }, type, value, pulse: frnd(0, 6.28) });
  }

  explosion(p: Vector2, radius: number, damage: number) {
    this.particlesAt(p, '#ff961e', 75);
    playSound.explosion();

    for (let i = 0; i < this.enemies.length; ) {
      const e = this.enemies[i];
      const d = dist(p, e.pos);
      if (d <= radius + e.radius) {
        const factor = 1 - Math.min(1.0, d / radius);
        this.hurtEnemy(e, Math.floor(damage * factor));
        if (e.hp <= 0) {
          this.killEnemy(i);
          continue;
        }
      }
      i++;
    }

    if (dist(p, this.player.pos) < radius * 0.3) {
      this.hurtPlayer(10);
    }
  }

  particlesAt(p: Vector2, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const a = frnd(0, 6.28318);
      const s = frnd(40, 250);
      const life = frnd(0.15, 0.9);
      this.particles.push({
        pos: { x: p.x, y: p.y },
        vel: { x: Math.cos(a) * s, y: Math.sin(a) * s },
        life,
        maxLife: life,
        size: frnd(2, 7),
        color,
      });
    }
  }

  muzzle(p: Vector2, d: Vector2) {
    for (let i = 0; i < 8; i++) {
      const a = Math.atan2(d.y, d.x) + frnd(-0.3, 0.3);
      const s = frnd(80, 250);
      const life = frnd(0.04, 0.15);
      this.particles.push({
        pos: { x: p.x, y: p.y },
        vel: { x: Math.cos(a) * s, y: Math.sin(a) * s },
        life,
        maxLife: life,
        size: frnd(2, 5),
        color: '#ffdc50',
      });
    }
  }

  questsUpdate() {
    for (const q of this.quests) {
      if (q.title === 'First Blood') q.progress = this.player.kills;
      if (q.title === 'Zombie Hunter') q.progress = this.player.kills;
      if (q.title === 'Survivor') q.progress = this.player.level;
      if (q.title === 'Armed') q.progress = this.ownedWeapons();

      if (!q.complete && q.progress >= q.target) {
        q.complete = true;
        this.addGold(q.gold);
        this.addXp(q.xp);
        this.addScore(q.gold * 5);
        this.particlesAt(this.player.pos, '#ffdc46', 30);
        this.addDamageFloater(this.player.pos, `Quest: ${q.title}!`, '#46e664');
        playSound.questComplete();
        this.notify();
      }
    }
  }

  levelUp() {
    while (this.player.xp >= this.neededXp()) {
      this.player.xp -= this.neededXp();
      this.player.level++;
      this.player.maxHp += 15;
      this.player.hp = this.player.maxHp;
      this.player.armor++;
      this.addScore(1000);
      this.particlesAt(this.player.pos, '#46dcff', 55);
      this.addDamageFloater(this.player.pos, `LEVEL UP! Lv.${this.player.level}`, '#46dcff');
      playSound.levelUp();
      this.notify();
    }
  }

  nextWave() {
    this.wave++;
    this.killsWave = 0;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 15);
    this.player.grenades++;

    for (let i = 0; i < Math.min(3, this.wave); i++) {
      this.spawnEnemy();
    }

    if (this.wave % 5 === 0 && this.bossUnlocked()) {
      this.spawnBoss();
    }
    this.addDamageFloater(this.player.pos, `WAVE ${this.wave}`, '#ffd246');
    this.notify();
  }

  addGold(n: number) {
    this.player.gold += Math.max(0, n);
  }

  addXp(n: number) {
    this.player.xp += Math.max(0, n);
  }

  addScore(n: number) {
    this.player.score += Math.max(0, n);
  }

  shopWeapon(i: number) {
    if (i < 0 || i >= this.weapons.length) return;
    if (this.weapons[i].owned) {
      this.player.weapon = i;
      playSound.uiClick();
      this.notify();
      return;
    }
    if (this.player.gold < this.weapons[i].price) return;

    this.player.gold -= this.weapons[i].price;
    this.weapons[i].owned = true;
    this.weapons[i].ammo = this.weapons[i].magazine;
    this.weapons[i].reserve = Math.floor(this.weapons[i].maxReserve / 2);
    this.player.weapon = i;
    playSound.pickup(0);
    this.notify();
  }

  shopAmmo() {
    if (this.player.gold < 80) return;
    this.player.gold -= 80;
    const w = this.weapon();
    w.reserve = Math.min(w.maxReserve, w.reserve + w.magazine * 2);
    playSound.reload();
    this.notify();
  }

  shopMedkit() {
    if (this.player.gold < 70) return;
    this.player.gold -= 70;
    this.player.medkits++;
    playSound.pickup(1);
    this.notify();
  }

  shopArmor() {
    if (this.player.gold < 250) return;
    this.player.gold -= 250;
    this.player.armor++;
    playSound.pickup(0);
    this.notify();
  }

  save() {
    try {
      const data = {
        player: this.player,
        weapons: this.weapons,
        quests: this.quests,
        wave: this.wave,
      };
      localStorage.setItem('zombie_frontier_save', JSON.stringify(data));
      this.addDamageFloater(this.player.pos, 'Game Saved!', '#46dcff');
      playSound.uiClick();
    } catch (e) {
      console.error('Failed to save game', e);
    }
  }

  load(): boolean {
    try {
      const raw = localStorage.getItem('zombie_frontier_save');
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.player && data.weapons) {
        this.player = data.player;
        this.weapons = data.weapons;
        this.quests = data.quests || this.quests;
        this.wave = data.wave || 1;

        // validate
        this.player.hp = Math.max(0, Math.min(this.player.hp, this.player.maxHp));
        this.player.level = Math.max(1, this.player.level);
        this.player.gold = Math.max(0, this.player.gold);
        this.player.grenades = Math.max(0, this.player.grenades);
        this.player.medkits = Math.max(0, this.player.medkits);
        if (this.player.weapon < 0 || this.player.weapon >= this.weapons.length) {
          this.player.weapon = 0;
        }

        this.enemies = [];
        this.bullets = [];
        this.pickups = [];
        this.particles = [];
        for (let i = 0; i < 5 + this.wave; i++) {
          this.spawnEnemy();
        }
        this.updateCamera();
        this.addDamageFloater(this.player.pos, 'Game Loaded!', '#46e664');
        playSound.uiClick();
        this.notify();
        return true;
      }
    } catch (e) {
      console.error('Failed to load game', e);
    }
    return false;
  }

  hasSave(): boolean {
    return !!localStorage.getItem('zombie_frontier_save');
  }

  handleKeyDown(code: string) {
    if (this.screen === 'menu') {
      if (code === 'ArrowUp' || code === 'KeyW') {
        this.menuIndex = (this.menuIndex + 4) % 5;
        playSound.uiClick();
        this.notify();
      } else if (code === 'ArrowDown' || code === 'KeyS') {
        this.menuIndex = (this.menuIndex + 1) % 5;
        playSound.uiClick();
        this.notify();
      } else if (code === 'Enter') {
        this.activateMenuItem(this.menuIndex);
      }
      return;
    }

    if (code === 'Escape') {
      if (this.screen === 'help' || this.screen === 'about') {
        this.screen = 'menu';
        playSound.uiClick();
        this.notify();
        return;
      }
      if (
        this.overlays.shop ||
        this.overlays.inventory ||
        this.overlays.questLog ||
        this.overlays.stats
      ) {
        this.overlays.shop = false;
        this.overlays.inventory = false;
        this.overlays.questLog = false;
        this.overlays.stats = false;
        playSound.uiClick();
        this.notify();
        return;
      }
      if (this.overlays.gameOver || this.overlays.victory) {
        this.screen = 'menu';
        this.reset();
        playSound.uiClick();
        this.notify();
        return;
      }
      this.overlays.paused = !this.overlays.paused;
      playSound.uiClick();
      this.notify();
      return;
    }

    if (this.screen !== 'playing') return;

    if (this.overlays.gameOver || this.overlays.victory) {
      if (code === 'Enter') {
        this.reset();
        this.screen = 'playing';
        playSound.uiClick();
        this.notify();
      }
      return;
    }

    if (this.overlays.shop) {
      if (code === 'Digit1') this.shopWeapon(0);
      if (code === 'Digit2') this.shopWeapon(1);
      if (code === 'Digit3') this.shopWeapon(2);
      if (code === 'Digit4') this.shopWeapon(3);
      if (code === 'Digit5') this.shopAmmo();
      if (code === 'Digit6') this.shopMedkit();
      if (code === 'Digit7') this.shopArmor();
      return;
    }

    if (this.overlays.inventory) {
      if (code === 'Digit1' && this.weapons[0]?.owned) this.player.weapon = 0;
      if (code === 'Digit2' && this.weapons[1]?.owned) this.player.weapon = 1;
      if (code === 'Digit3' && this.weapons[2]?.owned) this.player.weapon = 2;
      if (code === 'Digit4' && this.weapons[3]?.owned) this.player.weapon = 3;
      if (code === 'KeyH') this.heal();
      this.notify();
      return;
    }

    // Gameplay keys
    if (code === 'KeyR') this.reload();
    if (code === 'KeyG') this.grenade();
    if (code === 'KeyH') this.heal();
    if (code === 'F5') this.save();
    if (code === 'F9') this.load();

    // Weapon select keys 1-4 directly in game
    if (code === 'Digit1' && this.weapons[0]?.owned) { this.player.weapon = 0; this.notify(); }
    if (code === 'Digit2' && this.weapons[1]?.owned) { this.player.weapon = 1; this.notify(); }
    if (code === 'Digit3' && this.weapons[2]?.owned) { this.player.weapon = 2; this.notify(); }
    if (code === 'Digit4' && this.weapons[3]?.owned) { this.player.weapon = 3; this.notify(); }

    if (code === 'KeyP' || code === 'KeyE') {
      this.overlays.shop = !this.overlays.shop;
      this.overlays.inventory = false;
      this.overlays.questLog = false;
      this.overlays.stats = false;
      playSound.uiClick();
      this.notify();
    }
    if (code === 'KeyI' || code === 'Tab') {
      this.overlays.inventory = !this.overlays.inventory;
      this.overlays.shop = false;
      this.overlays.questLog = false;
      this.overlays.stats = false;
      playSound.uiClick();
      this.notify();
    }
    if (code === 'KeyQ') {
      this.overlays.questLog = !this.overlays.questLog;
      this.overlays.shop = false;
      this.overlays.inventory = false;
      this.overlays.stats = false;
      playSound.uiClick();
      this.notify();
    }
    if (code === 'KeyT') {
      this.overlays.stats = !this.overlays.stats;
      this.overlays.shop = false;
      this.overlays.inventory = false;
      this.overlays.questLog = false;
      playSound.uiClick();
      this.notify();
    }
  }

  activateMenuItem(index: number) {
    if (index === 0) {
      // New game
      this.reset();
      this.screen = 'playing';
      playSound.uiClick();
      this.notify();
    } else if (index === 1) {
      // Load game
      if (this.load()) {
        this.screen = 'playing';
      } else {
        this.reset();
        this.screen = 'playing';
      }
      playSound.uiClick();
      this.notify();
    } else if (index === 2) {
      this.screen = 'help';
      playSound.uiClick();
      this.notify();
    } else if (index === 3) {
      this.screen = 'about';
      playSound.uiClick();
      this.notify();
    } else if (index === 4) {
      // Exit (in web, refresh or back to title)
      this.reset();
      this.screen = 'menu';
      playSound.uiClick();
      this.notify();
    }
  }
}
