# 🧟 Zombie Frontier — C++17 & SFML 3.0.2

![Zombie Frontier Game Banner](./public/banner.jpg)

> **A fast-paced, top-down 2D graphical survival shooter written in C++17 and SFML 3.0.2, featuring wave defense, tactical weapons, enemy AI, boss encounters, quests, particle effects, and full economy.**

---

## 👤 Developer & Project Info

- **Developer & Author**: **Niket Raj**
- **Email**: [niketrajkvs@gmail.com](mailto:niketrajkvs@gmail.com)
- **GitHub Repository**: [Niketraj08/ZombieFrontierSFML-bug-code-with-c-](https://github.com/Niketraj08/ZombieFrontierSFML-bug-code-with-c-)
- **Language & Graphics Engine**: **C++17** + **SFML 3.0.2** (`SFML::Graphics`, `SFML::Window`, `SFML::System`)
- **Build Systems**: CMake (`CMakeLists.txt`), GNU Make (`Makefile`), Windows Batch (`build_and_run.bat`)

---

## 📖 Game Overview & Lore

You awaken in the heart of a fallen quarantine zone (`3200 x 2200` world arena). Hordes of infected mutants roam the desolate streets. Armed initially with a standard sidearm and limited reserves, you must scavenge supplies, eliminate hostile zombie waves, fulfill survival quests, upgrade your gear at the armory, and prepare for the ultimate showdown against the terrifying **Necro Lord**.

---

## 🔄 Gameplay Process & Progression ("Proccess")

### Phase 1: Early Survival (Waves 1 – 2)
* **Kite and Aim**: Keep moving using `W A S D` while aiming with precision using the mouse cursor (`sf::Mouse::getPosition`).
* **Conserve Ammo**: Standard Pistol fires 12-round magazines. Press `R` to reload before getting cornered.
* **Collect Drops**: Fallen zombies drop **Gold Coins** (`$`), **Medkits** (`+`), and **Grenades** (`G`). Walk within `42px` of a pickup to collect it.

### Phase 2: Economy & Armory Upgrades (Waves 2 – 4)
* Open the **Armory** (`P` or `E`) to spend Gold on stronger firepower and survivability:

| Weapon | Damage | Fire Delay | Magazine | Max Reserve | Price | Special Trait |
|---|---|---|---|---|---|---|
| **Pistol** | `18` | `0.28s` | `12` | `120` | `0G` (Starter) | Balanced accuracy & reload |
| **Shotgun** | `36` | `0.70s` | `6` | `60` | `450G` | Fires 5-pellet spread (`±0.14 rad`) |
| **Assault Rifle** | `24` | `0.11s` | `30` | `240` | `900G` | High-speed automatic suppression |
| **Plasma Rifle** | `62` | `0.40s` | `10` | `80` | `1700G` | Heavy high-energy plasma bolts |

* **Consumables & Upgrades in Shop**:
  * **5. Ammo Pack (`80G`)**: Restores `+2x magazine` reserve ammo for your equipped weapon.
  * **6. Medkit (`70G`)**: Adds `+1 Medkit` (heals `50 HP` on pressing `H`).
  * **7. Armor +1 (`250G`)**: Permanently reduces incoming enemy attack damage.

### Phase 3: Combat Tactics & Enemy AI Archetypes
Each wave scales enemy health, damage, XP, and gold rewards by `1.0 + wave * 0.09`:

| Enemy Type | Base HP | Base DMG | Speed | XP / Gold | AI Behavior |
|---|---|---|---|---|---|
| **Walker** (Green) | `55` | `9` | `75` | `25 XP / 15G` | Standard relentless melee pursuer |
| **Runner** (Yellow) | `40` | `7` | `125` (`1.65x`) | `35 XP / 25G` | Fast sprinter that closes distance rapidly |
| **Spitter** (Blue) | `85` | `12` | `55` (`0.72x`) | `55 XP / 45G` | Fires ranged acid projectiles within `700px` |
| **Brute** (Red) | `150` | `20` | `48` (`0.62x`) | `90 XP / 80G` | Heavy tank firing 3-way spread shots within `520px` |
| **Necro Lord** (Boss) | `2200+` | `35+` | `45` (`0.55x`) | `1200 XP / 1500G` | Giant boss with dark aura & bonus melee damage |

### Phase 4: Quests & Leveling System
* Press `Q` to open the **Quest Log**:
  * **First Blood**: Kill 5 enemies → `+150 Gold`, `+100 XP`
  * **Zombie Hunter**: Kill 20 enemies → `+500 Gold`, `+350 XP`
  * **Survivor**: Reach Level 5 → `+750 Gold`, `+500 XP`
  * **Armed**: Own 3 weapons → `+900 Gold`, `+500 XP`
* **Level Up Bonuses**: Every level grants `+15 Max HP`, a full heal, `+1 Armor`, `+1000 Score`, and `+7% Weapon Damage Multiplier`.

### Phase 5: Boss Showdown (Level 5 & Wave 5+)
* Reaching **Level 5** unlocks the **Necro Lord**.
* Defeating the Necro Lord awards `+1,500 Gold`, `+1,500 XP`, `+10,000 Score`, and triggers the **Victory** screen!

---

## 🎮 Controls Reference

| Key / Input | Action |
|---|---|
| `W` `A` `S` `D` | Move Survivor (8-directional normalized vector movement) |
| `Mouse Cursor` | Aim Crosshair (`window.mapPixelToCoords`) |
| `Mouse Left` | Shoot Active Weapon (Hold for continuous fire) |
| `1` `2` `3` `4` | Equip Owned Weapons / Purchase in Armory |
| `R` | Reload Weapon Magazine |
| `G` | Throw Explosive Grenade (`155px` radius, `90` max damage) |
| `H` | Use Medkit (`+50 HP` instant heal) |
| `P` or `E` | Open / Close Armory Shop |
| `I` or `TAB` | Open / Close Inventory |
| `Q` | Open / Close Quest Log |
| `T` | Open / Close Player Statistics |
| `F5` | Save Game State (`zombie_frontier_save.dat`) |
| `F9` | Load Saved Game State |
| `ESC` | Pause Game / Close Active Panel / Return to Menu |

---

## 💻 Building & Running the C++ Project

### Project Structure
```text
├── CMakeLists.txt          # CMake configuration (auto-fetches SFML 3.0.2)
├── Makefile                # GNU Make build script for Linux / macOS
├── build_and_run.bat       # One-click Windows build & launch script
├── src/
│   └── main.cpp            # Complete C++17 + SFML 3.0.2 game source code
├── native/
│   └── main.cpp            # Standalone C++17 native source mirror
└── README.md               # Project documentation
```

### Option 1: Windows (CMake & Visual Studio / MinGW)
Double-click `build_and_run.bat` or run in PowerShell:
```powershell
cmake -S . -B build
cmake --build build --config Release
.\build\Release\ZombieFrontier.exe
```

### Option 2: Linux / macOS (CMake or Makefile)
Using **CMake** (automatically downloads and links SFML 3.0.2 via `FetchContent`):
```bash
cmake -S . -B build
cmake --build build -j4
./build/ZombieFrontier
```
Or using **Makefile** (with system SFML installed):
```bash
make
./ZombieFrontier
```

### Font Loading Order
The C++ binary automatically searches for a valid TrueType font in the following order:
1. `assets/DejaVuSans.ttf`
2. `assets/font.ttf`
3. `C:/Windows/Fonts/arial.ttf`
4. `C:/Windows/Fonts/segoeui.ttf`
5. `/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`

---

## 👨‍💻 Developer Footer

<div align="center">
  <h3>🧟 Zombie Frontier — C++17 & SFML 3.0.2</h3>
  <p><strong>Developed by Niket Raj</strong></p>
  <p>
    <a href="https://github.com/Niketraj08">GitHub (@Niketraj08)</a> •
    <a href="mailto:niketrajkvs@gmail.com">niketrajkvs@gmail.com</a>
  </p>
  <p><em>© 2026 Niket Raj. Built with C++17 & SFML.</em></p>
</div>
