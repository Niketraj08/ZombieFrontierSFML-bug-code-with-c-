# Zombie Frontier - SFML

C++17 + SFML 3.0.2 graphical top-down survival shooter.

## Features

- Real graphical window
- WASD movement
- Mouse aiming
- Shooting
- Reload
- Pistol
- Shotgun
- Assault Rifle
- Plasma Rifle
- Grenades
- Medkits
- XP and level system
- Gold and score
- Enemy AI
- Walker
- Runner
- Spitter
- Brute
- Necro Lord boss
- Waves
- Pickups
- Particle effects
- Camera
- Shop
- Inventory
- Quests
- Statistics
- Save/load
- Pause
- Game over
- Victory

## Font

The program tries:

1. assets/DejaVuSans.ttf
2. assets/font.ttf
3. C:/Windows/Fonts/arial.ttf
4. C:/Windows/Fonts/segoeui.ttf

So on Windows it should normally work without a bundled font. For portable
distribution, put a TTF file in assets/DejaVuSans.ttf.

## Build

Install a C++17 compiler, CMake and Git.

From the project folder:

```powershell
cmake -S . -B build
cmake --build build --config Release
```

Run:

```powershell
.\build\Release\ZombieFrontier.exe
```

If using a MinGW generator, the executable may be:

```powershell
.\build\ZombieFrontier.exe
```

The first CMake configure downloads SFML 3.0.2 from the official SFML
repository, so internet access is required on the first build.

## Controls

W A S D = Move
Mouse Left = Shoot
R = Reload
G = Grenade
H = Medkit
P / E = Shop
I / TAB = Inventory
Q = Quests
T = Statistics
F5 = Save
F9 = Load
ESC = Pause / Close panel

## Goal

Reach level 5 and defeat the Necro Lord.
