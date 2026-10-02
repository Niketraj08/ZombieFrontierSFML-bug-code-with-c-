import React from 'react';
import { GameEngine } from '../game/GameEngine.ts';
import { Heart, Shield, Crosshair, Award, Coins, Flame, Plus, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { isSoundEnabled, toggleSound } from '../sound.ts';

interface HUDProps {
  engine: GameEngine;
  onRefresh: () => void;
}

export const HUD: React.FC<HUDProps> = ({ engine, onRefresh }) => {
  const p = engine.player;
  const w = engine.weapon();
  const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
  const soundOn = isSoundEnabled();

  const handleToggleSound = () => {
    toggleSound();
    onRefresh();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none p-3 select-none flex flex-col gap-2">
      {/* Top Bar */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Wave, Level, HP */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-amber-400">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>WAVE {engine.wave}</span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
            <Award className="w-5 h-5 text-cyan-400" />
            <span>LVL {p.level}</span>
          </div>

          {/* Health Bar */}
          <div className="flex items-center gap-2">
            <div className="relative w-36 sm:w-44 h-5 bg-slate-950 border border-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-150"
                style={{ width: `${hpPct}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white drop-shadow">
                {p.hp}/{p.maxHp} HP
              </span>
            </div>
            {p.armor > 0 && (
              <div className="flex items-center gap-1 text-xs text-blue-300 bg-blue-950/70 border border-blue-600/50 px-2 py-0.5 rounded-full font-bold">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                +{p.armor}
              </div>
            )}
          </div>
        </div>

        {/* Center: Gold & Score */}
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{p.gold}G</span>
          </div>
          <div className="font-mono text-slate-300">
            <span className="text-slate-400 text-xs">SCORE: </span>
            <span className="font-bold text-white">{p.score}</span>
          </div>
        </div>

        {/* Right: Weapon Info, Grenades, Medkits, Quick Panels */}
        <div className="flex items-center gap-3">
          {/* Active Weapon */}
          <div className="bg-slate-800/90 border border-slate-600/60 rounded-lg px-3 py-1 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-emerald-300 text-xs sm:text-sm">{w.name}</span>
            <span className="font-mono text-xs sm:text-sm text-slate-200">
              {w.ammo} <span className="text-slate-500">/</span> {w.reserve}
            </span>
            {w.ammo < w.magazine && w.reserve > 0 && (
              <button
                onClick={() => { engine.reload(); onRefresh(); }}
                className="ml-1 text-[10px] px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-semibold transition"
                title="Reload (R)"
              >
                R
              </button>
            )}
          </div>

          {/* Grenade & Medkit Quick Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { engine.grenade(); onRefresh(); }}
              disabled={p.grenades <= 0}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                p.grenades > 0
                  ? 'bg-amber-900/60 hover:bg-amber-800/80 border-amber-600/70 text-amber-200'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Throw Grenade (G)"
            >
              <span>💣 {p.grenades}</span>
              <span className="text-[10px] opacity-70">G</span>
            </button>

            <button
              onClick={() => { engine.heal(); onRefresh(); }}
              disabled={p.medkits <= 0 || p.hp >= p.maxHp}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                p.medkits > 0 && p.hp < p.maxHp
                  ? 'bg-emerald-900/60 hover:bg-emerald-800/80 border-emerald-600/70 text-emerald-200'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Use Medkit (H)"
            >
              <Heart className="w-3.5 h-3.5 text-emerald-400" />
              <span>{p.medkits}</span>
              <span className="text-[10px] opacity-70">H</span>
            </button>
          </div>

          {/* Menus / Modals shortcuts */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                engine.overlays.shop = !engine.overlays.shop;
                engine.overlays.inventory = false;
                engine.overlays.questLog = false;
                engine.overlays.stats = false;
                onRefresh();
              }}
              className="px-2.5 py-1 text-xs font-bold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 rounded-lg transition"
              title="Armory / Shop (P or E)"
            >
              Shop [P]
            </button>

            <button
              onClick={() => {
                engine.overlays.inventory = !engine.overlays.inventory;
                engine.overlays.shop = false;
                engine.overlays.questLog = false;
                engine.overlays.stats = false;
                onRefresh();
              }}
              className="px-2 py-1 text-xs font-bold bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-200 rounded-lg transition"
              title="Inventory (I or Tab)"
            >
              Inv [I]
            </button>

            <button
              onClick={() => {
                engine.overlays.questLog = !engine.overlays.questLog;
                engine.overlays.shop = false;
                engine.overlays.inventory = false;
                engine.overlays.stats = false;
                onRefresh();
              }}
              className="px-2 py-1 text-xs font-bold bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-200 rounded-lg transition"
              title="Quests (Q)"
            >
              Quests [Q]
            </button>

            <button
              onClick={() => {
                engine.overlays.stats = !engine.overlays.stats;
                engine.overlays.shop = false;
                engine.overlays.inventory = false;
                engine.overlays.questLog = false;
                onRefresh();
              }}
              className="px-2 py-1 text-xs font-bold bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 rounded-lg transition"
              title="Player Stats (T)"
            >
              Stats [T]
            </button>

            <button
              onClick={handleToggleSound}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-600/60 rounded-lg transition"
              title={soundOn ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>

            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-600/60 rounded-lg transition"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar Hints & Boss Alert */}
      <div className="flex items-center justify-between text-xs px-2 pointer-events-auto">
        <div className="flex items-center gap-2 text-slate-400 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full border border-slate-800">
          <button
            onClick={() => { engine.save(); onRefresh(); }}
            className="hover:text-cyan-400 font-semibold transition"
          >
            F5 Save
          </button>
          <span>|</span>
          <button
            onClick={() => { engine.load(); onRefresh(); }}
            className="hover:text-cyan-400 font-semibold transition"
          >
            F9 Load
          </button>
          <span>|</span>
          <button
            onClick={() => { engine.overlays.paused = !engine.overlays.paused; onRefresh(); }}
            className="hover:text-amber-400 font-semibold transition"
          >
            ESC Pause
          </button>
        </div>

        {engine.bossUnlocked() ? (
          <div className="bg-purple-950/90 text-purple-300 font-bold border border-purple-500/80 px-3 py-1 rounded-full shadow-lg shadow-purple-900/30 animate-pulse flex items-center gap-1.5">
            <span>💀</span>
            <span>NECRO LORD BOSS UNLOCKED</span>
          </div>
        ) : (
          <div className="text-slate-400 bg-slate-950/70 border border-slate-800/60 px-3 py-1 rounded-full font-medium">
            Boss unlocks at Level 5
          </div>
        )}
      </div>
    </div>
  );
};
