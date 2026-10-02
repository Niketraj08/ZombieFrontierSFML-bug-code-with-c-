import React, { useEffect, useReducer, useRef } from 'react';
import { GameEngine } from './game/GameEngine.ts';
import { GameCanvas } from './components/GameCanvas.tsx';
import { HUD } from './components/HUD.tsx';
import { UIModals } from './components/UIModals.tsx';

export function App() {
  const engineRef = useRef<GameEngine | null>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }

  const engine = engineRef.current;

  useEffect(() => {
    engine.onStateChange = () => {
      forceUpdate();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default actions for game keys
      if (
        [
          'Tab',
          'Space',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'F5',
          'F9',
        ].includes(e.code)
      ) {
        e.preventDefault();
      }

      engine.keysDown.add(e.code);
      engine.handleKeyDown(e.code);
      forceUpdate();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keysDown.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine]);

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* 2D Canvas */}
      <GameCanvas engine={engine} />

      {/* In-Game HUD */}
      {engine.screen === 'playing' && (
        <HUD engine={engine} onRefresh={forceUpdate} />
      )}

      {/* Screen Modals & Overlays */}
      <UIModals engine={engine} onRefresh={forceUpdate} />

      {/* Developer Footer */}
      <footer className="absolute bottom-2 z-20 pointer-events-auto flex items-center justify-center gap-2 text-[11px] sm:text-xs text-slate-400 bg-slate-950/90 backdrop-blur px-4 py-1.5 rounded-full border border-slate-800 shadow-lg">
        <span className="font-bold text-slate-300">Zombie Frontier</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-300 font-medium">Developed by</span>
        <span className="text-cyan-400 font-bold tracking-wide">Niket Raj</span>
      </footer>
    </div>
  );
}

export default App;
