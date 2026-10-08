import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, Cpu, BookOpen } from 'lucide-react';

interface CppSourceModalProps {
  onClose: () => void;
}

export const CppSourceModal: React.FC<CppSourceModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'readme' | 'info' | 'cmake' | 'bat'>('readme');

  const readmeContent = `# 🧟 Zombie Frontier — C++17 & SFML 3.0.2

![Zombie Frontier Game Banner](./public/banner.jpg)

> A fast-paced, top-down 2D graphical survival shooter written in C++17 and SFML 3.0.2, featuring wave defense, tactical weapons, enemy AI, boss encounters, quests, particle effects, and full economy.

## 👤 Developer & Project Info
- Developer & Author: Niket Raj (niketrajkvs@gmail.com)
- GitHub Repository: Niketraj08/ZombieFrontierSFML-bug-code-with-c-
- Language & Graphics Engine: C++17 + SFML 3.0.2
- Build Systems: CMake (CMakeLists.txt), GNU Make (Makefile), Windows Batch (build_and_run.bat)

## 🔄 Gameplay Process & Progression ("Proccess")
1. Early Survival (Waves 1 – 2): Move with WASD, aim with Mouse, reload with R, collect Gold/Medkit/Grenade drops.
2. Economy & Armory Upgrades (Waves 2 – 4): Open Armory (P/E) to buy Shotgun (450G), Assault Rifle (900G), Plasma Rifle (1700G), Ammo Packs (80G), Medkits (70G), and Armor +1 (250G).
3. Combat Tactics & Enemy AI: Battle Walkers, fast Runners, ranged Spitters, triple-shot Brutes, and use Grenades (G).
4. Quests & Leveling: Press Q to track First Blood, Zombie Hunter, Survivor, and Armed quests for bonus Gold & XP.
5. Boss Showdown (Level 5 / Wave 5+): Defeat the Necro Lord boss to claim Victory!

## 💻 Building & Running C++
cmake -S . -B build
cmake --build build --config Release
.\\build\\Release\\ZombieFrontier.exe

---
Developed by Niket Raj • © 2026 Niket Raj`;

  const cmakeContent = `cmake_minimum_required(VERSION 3.22)
project(ZombieFrontier LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
    SFML
    GIT_REPOSITORY https://github.com/SFML/SFML.git
    GIT_TAG 3.0.2
)
FetchContent_MakeAvailable(SFML)

if(EXISTS "\${CMAKE_CURRENT_SOURCE_DIR}/src/main.cpp")
    set(MAIN_SRC src/main.cpp)
else()
    set(MAIN_SRC native/main.cpp)
endif()

add_executable(ZombieFrontier \${MAIN_SRC})
target_link_libraries(ZombieFrontier PRIVATE SFML::Graphics SFML::Window SFML::System)`;

  const batContent = `@echo off
echo Building Zombie Frontier (C++17 + SFML 3.0.2)...
if not exist build mkdir build
cmake -S . -B build
cmake --build build --config Release
if %ERRORLEVEL% EQU 0 (
    echo Build succeeded! Launching ZombieFrontier.exe...
    .\\build\\Release\\ZombieFrontier.exe
)
pause`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-cyan-500/70 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
          <Cpu className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>C++17 + SFML Project & README.md</span>
              <span className="text-xs bg-cyan-950 border border-cyan-700 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                src/main.cpp
              </span>
            </h2>
            <p className="text-xs text-slate-400">Developed by Niket Raj</p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab('readme')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'readme'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> README.md
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" /> C++ Build Guide
          </button>
          <button
            onClick={() => setActiveTab('cmake')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'cmake'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" /> CMakeLists.txt
          </button>
          <button
            onClick={() => setActiveTab('bat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'bat'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" /> build_and_run.bat
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 text-sm space-y-3 font-sans">
          {activeTab === 'readme' && (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-slate-700 relative">
                <img
                  src="/banner.jpg"
                  alt="Zombie Frontier Game Banner"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-3 flex items-end justify-between">
                  <div>
                    <div className="text-sm font-black text-red-400 tracking-wider">ZOMBIE FRONTIER — C++17 & SFML 3.0.2</div>
                    <div className="text-[11px] text-cyan-300 font-semibold">Developer: Niket Raj</div>
                  </div>
                  <button
                    onClick={() => handleCopy(readmeContent)}
                    className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs rounded font-mono flex items-center gap-1 border border-slate-600"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy README.md'}
                  </button>
                </div>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 whitespace-pre-wrap leading-relaxed">
                {readmeContent}
              </pre>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-cyan-300 text-sm">C++ Project Files in Repository:</h3>
                <p>
                  • <code className="text-cyan-400 font-bold font-mono">src/main.cpp</code> & <code className="text-cyan-400 font-mono">native/main.cpp</code> — Complete C++17 + SFML 3.0.2 game code.
                </p>
                <p>
                  • <code className="text-cyan-400 font-mono">CMakeLists.txt</code> — CMake build script with automatic SFML 3.0.2 FetchContent.
                </p>
                <p>
                  • <code className="text-cyan-400 font-mono">Makefile</code> & <code className="text-cyan-400 font-mono">build_and_run.bat</code> — Native build scripts for Windows, Linux, and macOS.
                </p>
                <p>
                  • <code className="text-cyan-400 font-mono">README.md</code> — Complete C++ documentation with game banner image and developer credits.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm">How to compile native C++ executable (.exe):</h3>
                <p className="text-slate-400">On your local Windows, Linux, or macOS machine with CMake & a C++17 compiler (MSVC or MinGW):</p>
                <pre className="bg-slate-900 p-2.5 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto">
{`cmake -S . -B build
cmake --build build --config Release
.\\build\\Release\\ZombieFrontier.exe`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'cmake' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(cmakeContent)}
                className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-mono flex items-center gap-1 border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto">
                {cmakeContent}
              </pre>
            </div>
          )}

          {activeTab === 'bat' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(batContent)}
                className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-mono flex items-center gap-1 border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-amber-300 border border-slate-800 overflow-x-auto">
                {batContent}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Author & Developer: <strong className="text-cyan-400">Niket Raj</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
