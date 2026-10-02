import React from 'react';
import { GameEngine } from '../game/GameEngine.ts';
import { Shield, Crosshair, Award, ShoppingCart, Check, Heart, Skull, Play, BookOpen, Info, RotateCcw, Save, FolderOpen, X } from 'lucide-react';

interface ModalProps {
  engine: GameEngine;
  onRefresh: () => void;
}

export const UIModals: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  // Main Menu Screen
  if (engine.screen === 'menu') {
    return <MainMenuModal engine={engine} onRefresh={onRefresh} />;
  }

  // Help Screen
  if (engine.screen === 'help') {
    return <HelpModal engine={engine} onRefresh={onRefresh} />;
  }

  // About Screen
  if (engine.screen === 'about') {
    return <AboutModal engine={engine} onRefresh={onRefresh} />;
  }

  // Overlays during Gameplay
  const { shop, inventory, questLog, stats, paused, gameOver, victory } = engine.overlays;

  if (gameOver) {
    return <GameOverModal engine={engine} onRefresh={onRefresh} />;
  }

  if (victory) {
    return <VictoryModal engine={engine} onRefresh={onRefresh} />;
  }

  if (shop) {
    return <ShopModal engine={engine} onRefresh={onRefresh} />;
  }

  if (inventory) {
    return <InventoryModal engine={engine} onRefresh={onRefresh} />;
  }

  if (questLog) {
    return <QuestModal engine={engine} onRefresh={onRefresh} />;
  }

  if (stats) {
    return <StatsModal engine={engine} onRefresh={onRefresh} />;
  }

  if (paused) {
    return <PauseModal engine={engine} onRefresh={onRefresh} />;
  }

  return null;
};

// Main Menu
const MainMenuModal: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  const items = [
    { label: 'NEW GAME', icon: <Play className="w-5 h-5" /> },
    { label: 'LOAD GAME', icon: <FolderOpen className="w-5 h-5" /> },
    { label: 'HOW TO PLAY', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'ABOUT', icon: <Info className="w-5 h-5" /> },
    { label: 'RESET SAVE', icon: <RotateCcw className="w-5 h-5" /> },
  ];

  const handleSelect = (idx: number) => {
    if (idx === 4) {
      localStorage.removeItem('zombie_frontier_save');
      engine.reset();
      onRefresh();
      return;
    }
    engine.activateMenuItem(idx);
    onRefresh();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50">
      <div className="text-center mb-8">
        <h1 className="text-5xl sm:text-6xl font-black tracking-wider text-red-500 drop-shadow-[0_4px_16px_rgba(239,68,68,0.5)]">
          ZOMBIE FRONTIER
        </h1>
        <p className="text-cyan-300 font-semibold tracking-widest mt-2 text-sm sm:text-base uppercase">
          Top-Down Graphical Survival Shooter
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {items.map((item, idx) => {
          const isSelected = engine.menuIndex === idx;
          return (
            <button
              key={item.label}
              onClick={() => handleSelect(idx)}
              onMouseEnter={() => { engine.menuIndex = idx; onRefresh(); }}
              className={`w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-bold tracking-wider transition-all duration-150 border ${
                isSelected
                  ? 'bg-cyan-700 text-white border-cyan-400 shadow-lg shadow-cyan-900/40 scale-105'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center flex flex-col items-center gap-2">
        <div className="text-xs text-slate-400 font-mono">
          Use <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">W/S</kbd> or{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">↑/↓</kbd> &{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Enter</kbd> or click to select
        </div>
        <div className="px-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded-full text-xs text-slate-400 flex items-center gap-2 shadow-md">
          <span>Zombie Frontier</span>
          <span className="text-slate-600">•</span>
          <span>Developed by</span>
          <span className="text-cyan-400 font-bold tracking-wide">Niket Raj</span>
        </div>
      </div>
    </div>
  );
};

// Help / How to play
const HelpModal: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  const close = () => {
    engine.screen = 'menu';
    onRefresh();
  };

  const controls = [
    { key: 'W A S D', action: 'Move survivor' },
    { key: 'Mouse', action: 'Aim crosshair' },
    { key: 'Left Click', action: 'Fire weapon (hold to auto-fire)' },
    { key: '1, 2, 3, 4', action: 'Switch owned weapons' },
    { key: 'R', action: 'Reload magazine' },
    { key: 'G', action: 'Throw explosive grenade' },
    { key: 'H', action: 'Use medkit (+50 HP)' },
    { key: 'P / E', action: 'Toggle Armory / Shop' },
    { key: 'I / TAB', action: 'Toggle Inventory' },
    { key: 'Q', action: 'Toggle Quest Log' },
    { key: 'T', action: 'Toggle Player Statistics' },
    { key: 'F5 / F9', action: 'Save / Load game' },
    { key: 'ESC', action: 'Pause / Close modal' },
  ];

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-cyan-500/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-amber-400 text-center mb-4 tracking-wider">
          HOW TO PLAY
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 text-sm">
          {controls.map(c => (
            <div key={c.key} className="flex items-center justify-between bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-lg">
              <span className="font-mono font-bold text-cyan-300">{c.key}</span>
              <span className="text-slate-300 text-xs">{c.action}</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-300 space-y-2 mb-6">
          <p className="font-bold text-red-400">MISSION OBJECTIVE:</p>
          <p>• Reach <span className="text-cyan-300 font-bold">Level 5</span> and eliminate the dreaded <span className="text-purple-400 font-bold">Necro Lord</span> boss.</p>
          <p>• Survive increasingly relentless zombie waves. Collect gold, medkits and grenades dropped by fallen enemies.</p>
          <p>• Visit the <span className="text-emerald-400 font-bold">Armory (P)</span> to purchase Shotgun, Assault Rifle, and Plasma Rifle, replenish ammo, or upgrade Armor.</p>
          <p>• Complete <span className="text-amber-400 font-bold">Quests (Q)</span> for massive bonus Gold and XP.</p>
        </div>

        <div className="text-center">
          <button
            onClick={close}
            className="px-6 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl transition"
          >
            Back to Menu (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

// About Modal
const AboutModal: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  const close = () => {
    engine.screen = 'menu';
    onRefresh();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-purple-500/60 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-center">
        <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-purple-300 mb-2 tracking-wider">
          ABOUT ZOMBIE FRONTIER
        </h2>
        <p className="text-xs text-purple-400 font-mono mb-6">Niketraj08/ZombieFrontierSFML Web Port</p>

        <div className="text-slate-300 text-sm space-y-3 mb-6 text-left bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <p>• Originally created and developed as a C++17 SFML top-down graphical survival shooter by <strong className="text-cyan-300">Niket Raj</strong>.</p>
          <p>• Faithfully migrated to modern web canvas technology in AI Studio with real-time smooth mechanics, projectile combat, and zero external asset dependencies.</p>
          <p>• Features procedural sound synthesis using the Web Audio API, responsive letterboxing, high-precision mouse tracking, and full keyboard/click dual controls.</p>
          <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Author & Developer:</span>
            <span className="text-cyan-400 font-bold text-sm">Niket Raj</span>
          </div>
        </div>

        <button
          onClick={close}
          className="px-6 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl transition"
        >
          Back to Menu (ESC)
        </button>
      </div>
    </div>
  );
};

// Shop Modal
const ShopModal: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  const close = () => {
    engine.overlays.shop = false;
    onRefresh();
  };

  const p = engine.player;

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900 border border-emerald-500/70 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-black text-emerald-300">ARMORY</h2>
          </div>
          <div className="text-amber-400 font-bold font-mono text-lg">
            Gold: {p.gold}G
          </div>
        </div>

        {/* Weapons List */}
        <div className="space-y-2 mb-5">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Weapons (Press 1 - 4)
          </div>
          {engine.weapons.map((w, idx) => {
            const isEquipped = p.weapon === idx;
            const canAfford = p.gold >= w.price;
            return (
              <div
                key={w.name}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  isEquipped
                    ? 'bg-emerald-950/60 border-emerald-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-2 text-sm sm:text-base">
                    <span>{idx + 1}. {w.name}</span>
                    {isEquipped && (
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">
                        EQUIPPED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    DMG: <span className="text-slate-200">{w.damage}</span> | Fire Rate: <span className="text-slate-200">{w.delay}s</span> | Mag: <span className="text-slate-200">{w.magazine}</span>
                  </div>
                </div>

                <div>
                  {w.owned ? (
                    <button
                      onClick={() => { engine.shopWeapon(idx); onRefresh(); }}
                      disabled={isEquipped}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        isEquipped
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : 'bg-cyan-700 hover:bg-cyan-600 text-white'
                      }`}
                    >
                      {isEquipped ? 'Active' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => { engine.shopWeapon(idx); onRefresh(); }}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        canAfford
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      Buy for {w.price}G
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Consumables and Upgrades */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
            <div>
              <div className="font-bold text-sm text-cyan-300">5. Ammo Pack</div>
              <div className="text-xs text-slate-400 mt-1">Refills active weapon reserve ammo</div>
            </div>
            <button
              onClick={() => { engine.shopAmmo(); onRefresh(); }}
              disabled={p.gold < 80}
              className="mt-3 w-full py-1.5 bg-cyan-700 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded-lg transition"
            >
              80G
            </button>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
            <div>
              <div className="font-bold text-sm text-emerald-300">6. Medkit</div>
              <div className="text-xs text-slate-400 mt-1">+1 Medkit (Current: {p.medkits})</div>
            </div>
            <button
              onClick={() => { engine.shopMedkit(); onRefresh(); }}
              disabled={p.gold < 70}
              className="mt-3 w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded-lg transition"
            >
              70G
            </button>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
            <div>
              <div className="font-bold text-sm text-blue-300">7. Armor +1</div>
              <div className="text-xs text-slate-400 mt-1">Permanent damage reduction (Lv {p.armor})</div>
            </div>
            <button
              onClick={() => { engine.shopArmor(); onRefresh(); }}
              disabled={p.gold < 250}
              className="mt-3 w-full py-1.5 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded-lg transition"
            >
              250G
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Press 1-7 on keyboard or click to purchase.</span>
          <button onClick={close} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold">
            Close (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

// Inventory Modal
const InventoryModal: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  const close = () => {
    engine.overlays.inventory = false;
    onRefresh();
  };

  const p = engine.player;

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900 border border-blue-500/70 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-blue-300 mb-4 border-b border-slate-800 pb-3">
          INVENTORY
        </h2>

        {/* Consumables */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Medkits</div>
              <div className="text-xl font-bold text-emerald-400">{p.medkits}</div>
            </div>
            <button
              onClick={() => { engine.heal(); onRefresh(); }}
              disabled={p.medkits <= 0 || p.hp >= p.maxHp}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded-lg transition"
            >
              Use (H)
            </button>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Grenades</div>
              <div className="text-xl font-bold text-amber-400">{p.grenades}</div>
            </div>
            <span className="text-xs text-slate-500 font-mono">Press G to throw</span>
          </div>
        </div>

        {/* Weapons */}
        <div className="space-y-2 mb-6">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Owned Weapons (Press 1-4)
          </div>
          {engine.weapons.map((w, idx) => {
            if (!w.owned) return null;
            const isEquipped = p.weapon === idx;
            return (
              <div
                key={w.name}
                onClick={() => { p.weapon = idx; onRefresh(); }}
                className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border transition ${
                  isEquipped
                    ? 'bg-blue-950/70 border-blue-500 text-white shadow-md'
                    : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">
                    {idx + 1}. {w.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    Ammo: {w.ammo} / {w.reserve}
                  </div>
                </div>

                {isEquipped ? (
                  <span className="text-xs font-bold text-blue-300 bg-blue-900/60 px-2.5 py-1 rounded-full border border-blue-500/50">
                    Active
                  </span>
                ) : (
                  <button className="text-xs text-slate-400 hover:text-white px-2 py-1">
                    Equip
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button onClick={close} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm">
            Close (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

// Quest Log Modal
const QuestModal: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  const close = () => {
    engine.overlays.questLog = false;
    onRefresh();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900 border border-amber-500/70 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-amber-300 mb-4 border-b border-slate-800 pb-3">
          QUEST LOG
        </h2>

        <div className="space-y-3 mb-6">
          {engine.quests.map(q => {
            const pct = Math.min(100, Math.floor((q.progress / q.target) * 100));
            return (
              <div
                key={q.title}
                className={`p-4 rounded-xl border ${
                  q.complete
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-sm ${q.complete ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {q.title}
                  </span>
                  {q.complete ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-600/50">
                      <Check className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-400">
                      {Math.min(q.progress, q.target)} / {q.target}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 mb-2">{q.description}</div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      q.complete ? 'bg-emerald-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="text-[11px] text-amber-300/80 font-mono">
                  Reward: +{q.gold} Gold, +{q.xp} XP
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button onClick={close} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm">
            Close (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

// Player Stats Modal
const StatsModal: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  const close = () => {
    engine.overlays.stats = false;
    onRefresh();
  };

  const p = engine.player;
  const statsList = [
    { label: 'Survivor Level', val: `${p.level}` },
    { label: 'Experience (XP)', val: `${p.xp} / ${engine.neededXp()}` },
    { label: 'Hit Points (HP)', val: `${p.hp} / ${p.maxHp}` },
    { label: 'Damage Reduction (Armor)', val: `+${p.armor}` },
    { label: 'Damage Multiplier', val: `${(engine.damageMultiplier() * 100).toFixed(0)}%` },
    { label: 'Zombies Eliminated', val: `${p.kills}` },
    { label: 'Current Gold', val: `${p.gold}G` },
    { label: 'Total Score', val: `${p.score}` },
    { label: 'Current Wave', val: `${engine.wave}` },
    { label: 'Equipped Weapon', val: engine.weapon().name },
  ];

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900 border border-purple-500/70 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-purple-300 mb-4 border-b border-slate-800 pb-3">
          PLAYER STATISTICS
        </h2>

        <div className="space-y-2 mb-6">
          {statsList.map(s => (
            <div key={s.label} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">{s.label}:</span>
              <span className="font-bold text-slate-100 font-mono">{s.val}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={close} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm">
            Close (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

// Pause Modal
const PauseModal: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  const resume = () => {
    engine.overlays.paused = false;
    onRefresh();
  };

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900 border border-cyan-500/70 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
        <h2 className="text-3xl font-black text-amber-400 mb-6 tracking-wider">
          GAME PAUSED
        </h2>

        <div className="flex flex-col gap-2.5 mb-6">
          <button
            onClick={resume}
            className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl transition"
          >
            Resume (ESC)
          </button>

          <button
            onClick={() => { engine.save(); onRefresh(); }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            Save Game (F5)
          </button>

          <button
            onClick={() => { engine.load(); onRefresh(); }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <FolderOpen className="w-4 h-4 text-emerald-400" />
            Load Game (F9)
          </button>

          <button
            onClick={() => {
              engine.overlays.shop = true;
              engine.overlays.paused = false;
              onRefresh();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition"
          >
            Open Armory (P)
          </button>

          <button
            onClick={() => {
              engine.overlays.paused = false;
              engine.screen = 'menu';
              onRefresh();
            }}
            className="w-full py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 font-semibold rounded-xl transition mt-2"
          >
            Quit to Title
          </button>
        </div>
      </div>
    </div>
  );
};

// Game Over Modal
const GameOverModal: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  const restart = () => {
    engine.reset();
    engine.screen = 'playing';
    onRefresh();
  };

  const toMenu = () => {
    engine.reset();
    engine.screen = 'menu';
    onRefresh();
  };

  return (
    <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-red-500 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
        <Skull className="w-16 h-16 text-red-500 mx-auto mb-2 animate-bounce" />
        <h2 className="text-4xl font-black text-red-500 tracking-wider mb-2">
          YOU DIED
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          The city swallowed another brave survivor.
        </p>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6 text-sm space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-300">
            <span>Final Score:</span>
            <span className="font-bold text-amber-400">{engine.player.score}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Zombies Slain:</span>
            <span className="font-bold text-white">{engine.player.kills}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Wave Reached:</span>
            <span className="font-bold text-cyan-400">{engine.wave}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={restart}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-lg shadow-red-900/40"
          >
            Play Again (ENTER)
          </button>

          <button
            onClick={toMenu}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            Main Menu (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

// Victory Modal
const VictoryModal: React.FC<ModalProps> = ({ engine, onRefresh }) => {
  const restart = () => {
    engine.reset();
    engine.screen = 'playing';
    onRefresh();
  };

  const toMenu = () => {
    engine.reset();
    engine.screen = 'menu';
    onRefresh();
  };

  return (
    <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-emerald-400 rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center">
        <Award className="w-16 h-16 text-emerald-400 mx-auto mb-2 animate-bounce" />
        <h2 className="text-4xl font-black text-emerald-400 tracking-wider mb-2">
          VICTORY!
        </h2>
        <p className="text-amber-300 font-bold text-base mb-6">
          THE NECRO LORD HAS FALLEN!
        </p>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6 text-sm space-y-2 font-mono">
          <div className="flex justify-between text-slate-300">
            <span>Final Score:</span>
            <span className="font-bold text-emerald-400 text-lg">{engine.player.score}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Total Kills:</span>
            <span className="font-bold text-white">{engine.player.kills}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Final Wave:</span>
            <span className="font-bold text-cyan-400">{engine.wave}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={restart}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/40"
          >
            Play Again (ENTER)
          </button>

          <button
            onClick={toMenu}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            Main Menu (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
