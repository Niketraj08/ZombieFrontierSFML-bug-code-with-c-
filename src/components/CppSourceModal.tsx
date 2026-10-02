import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, Cpu } from 'lucide-react';

interface CppSourceModalProps {
  onClose: () => void;
}

export const CppSourceModal: React.FC<CppSourceModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'cmake' | 'bat'>('info');

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

add_executable(ZombieFrontier native/main.cpp)
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
              <span>C++17 + SFML Native Architecture</span>
              <span className="text-xs bg-cyan-950 border border-cyan-700 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                native/main.cpp
              </span>
            </h2>
            <p className="text-xs text-slate-400">Created by developer Niket Raj</p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" /> Native C++ Guide
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
          {activeTab === 'info' && (
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-cyan-300 text-sm">Why C++ & Web Work Together Here:</h3>
                <p>
                  • <strong>Web Browsers & Cloud AI Studio</strong> run inside isolated sandboxes on port 3000. Web browsers cannot directly open native OS desktop windows (Win32/X11) that SFML's <code className="text-amber-300">sf::RenderWindow</code> creates.
                </p>
                <p>
                  • <strong>Full C++ Code Preserved</strong>: Your complete C++17 + SFML 3.0.2 codebase is saved at <code className="text-cyan-400 font-bold font-mono">native/main.cpp</code>, along with <code className="text-cyan-400 font-mono">CMakeLists.txt</code> and <code className="text-cyan-400 font-mono">build_and_run.bat</code>.
                </p>
                <p>
                  • <strong>Web Execution</strong>: The browser runs a 1:1 replica of your C++ game loop, math, weapons, enemies, wave progression, and shop so anyone on the web can play immediately without needing to install C++ compilers.
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
