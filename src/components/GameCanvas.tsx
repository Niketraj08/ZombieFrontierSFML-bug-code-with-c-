import React, { useEffect, useRef } from 'react';
import { GameEngine, WINDOW_H, WINDOW_W, WORLD_H, WORLD_W } from '../game/GameEngine.ts';

interface GameCanvasProps {
  engine: GameEngine;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      // Update engine physics & AI
      engine.update(dt);

      // Render
      renderCanvas(ctx, engine);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine]);

  // Handle pointer / mouse movements on the canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WINDOW_W / rect.width;
    const scaleY = WINDOW_H / rect.height;

    const screenX = (e.clientX - rect.left) * scaleX;
    const screenY = (e.clientY - rect.top) * scaleY;

    engine.mouseScreen = { x: screenX, y: screenY };
    engine.mouseWorld = {
      x: screenX + engine.camera.x - WINDOW_W / 2,
      y: screenY + engine.camera.y - WINDOW_H / 2,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      engine.mouseHeld = true;
      if (engine.screen === 'playing') {
        engine.shoot();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      engine.mouseHeld = false;
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={WINDOW_W}
        height={WINDOW_H}
        className="w-full h-full max-w-[177.78vh] max-h-[56.25vw] aspect-[16/9] cursor-crosshair shadow-2xl block object-contain"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};

function renderCanvas(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  // Clear screen
  ctx.save();
  ctx.fillStyle = '#070a0f';
  ctx.fillRect(0, 0, WINDOW_W, WINDOW_H);

  if (engine.screen === 'menu') {
    renderMenuBackground(ctx);
    ctx.restore();
    return;
  }

  // Camera transform for World rendering
  const cx = engine.camera.x;
  const cy = engine.camera.y;

  ctx.save();
  ctx.translate(-cx + WINDOW_W / 2, -cy + WINDOW_H / 2);

  // 1. Floor grid
  ctx.fillStyle = '#171c22';
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  ctx.strokeStyle = '#1e242b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= WORLD_W; x += 64) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD_H);
  }
  for (let y = 0; y <= WORLD_H; y += 64) {
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_W, y);
  }
  ctx.stroke();

  // 2. Decorations (crates & safe zone)
  for (let i = 0; i < 35; i++) {
    const x = (i * 193) % WORLD_W;
    const y = (i * 127) % WORLD_H;
    ctx.fillStyle = '#262c33';
    ctx.fillRect(x, y, 48, 42);
    ctx.strokeStyle = '#373e46';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 48, 42);
  }

  // Safe zone circle
  ctx.fillStyle = 'rgba(20, 130, 170, 0.14)';
  ctx.strokeStyle = 'rgba(60, 190, 230, 0.43)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1600, 1100, 115, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // World boundary warning
  ctx.strokeStyle = 'rgba(240, 60, 60, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, WORLD_W - 4, WORLD_H - 4);

  // 3. Pickups
  for (const p of engine.pickups) {
    const s = 10 + Math.sin(p.pulse) * 3;
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, s, 0, Math.PI * 2);
    if (p.type === 0) {
      ctx.fillStyle = '#ffd732';
      ctx.shadowColor = '#ffd732';
      ctx.shadowBlur = 8;
    } else if (p.type === 1) {
      ctx.fillStyle = '#46e664';
      ctx.shadowColor = '#46e664';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#e66428';
      ctx.shadowColor = '#e66428';
      ctx.shadowBlur = 8;
    }
    ctx.fill();

    // Icon inside pickup
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (p.type === 0) ctx.fillText('$', p.pos.x, p.pos.y);
    else if (p.type === 1) ctx.fillText('+', p.pos.x, p.pos.y);
    else ctx.fillText('G', p.pos.x, p.pos.y);

    ctx.restore();
  }

  // 4. Bullets
  for (const b of engine.bullets) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.enemy ? '#ff4650' : '#ffe65a';
    ctx.shadowColor = b.enemy ? '#ff4650' : '#ffe65a';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }

  // 5. Enemies
  for (const e of engine.enemies) {
    ctx.save();

    // Necro Lord Boss purple aura
    if (e.type === 4) {
      ctx.beginPath();
      ctx.arc(e.pos.x, e.pos.y, e.radius + 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(190, 50, 220, 0.47)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(e.pos.x, e.pos.y, e.radius, 0, Math.PI * 2);
    ctx.fillStyle = e.flash > 0 ? '#ffffff' : engine.enemyColor(e.type);
    ctx.fill();
    ctx.strokeStyle = e.type === 4 ? '#ff64ff' : '#ffe6e6';
    ctx.lineWidth = e.type === 4 ? 5 : 2;
    ctx.stroke();

    // Enemy Health Bar
    const barW = e.radius * 2;
    const barH = 6;
    const barX = e.pos.x - e.radius;
    const barY = e.pos.y - e.radius - 13;
    const hpRatio = Math.max(0, Math.min(1, e.hp / e.maxHp));

    ctx.fillStyle = '#321419';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#dc323c';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.restore();
  }

  // 6. Particles
  for (const p of engine.particles) {
    ctx.save();
    const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 7. Damage floaters
  for (const f of engine.damageFloaters) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life / f.maxLife));
    ctx.fillStyle = f.color;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(f.text, f.pos.x, f.pos.y);
    ctx.restore();
  }

  // 8. Player
  ctx.save();
  const player = engine.player;
  ctx.beginPath();
  ctx.arc(player.pos.x, player.pos.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.invuln > 0 ? '#ffffff' : '#3cb4ff';
  ctx.fill();
  ctx.strokeStyle = '#b4f0ff';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Gun barrel
  const dx = engine.mouseWorld.x - player.pos.x;
  const dy = engine.mouseWorld.y - player.pos.y;
  const angle = Math.atan2(dy, dx);

  ctx.translate(player.pos.x, player.pos.y);
  ctx.rotate(angle);
  ctx.fillStyle = '#dcdce6';
  ctx.fillRect(0, -3.5, 34, 7);
  ctx.restore();

  // Restore camera matrix
  ctx.restore();

  // 9. Crosshair drawn on screen coordinates
  const mx = engine.mouseScreen.x;
  const my = engine.mouseScreen.y;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mx, my, 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(mx - 13, my - 1, 26, 2);
  ctx.fillRect(mx - 1, my - 13, 2, 26);
  ctx.restore();

  ctx.restore();
}

function renderMenuBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#070a0f';
  ctx.fillRect(0, 0, WINDOW_W, WINDOW_H);

  // Background stars/dust
  ctx.fillStyle = '#3c465a';
  for (let i = 0; i < 40; i++) {
    const x = ((i * 137) + 50) % WINDOW_W;
    const y = ((i * 223) + 70) % WINDOW_H;
    ctx.beginPath();
    ctx.arc(x, y, (i % 3) + 1, 0, Math.PI * 2);
    ctx.fill();
  }
}
