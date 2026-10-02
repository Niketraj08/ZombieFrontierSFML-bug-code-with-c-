@echo off
echo Building Zombie Frontier (C++17 + SFML 3.0.2)...
if not exist build mkdir build
cmake -S . -B build
cmake --build build --config Release
if %ERRORLEVEL% EQU 0 (
    echo Build succeeded! Launching ZombieFrontier.exe...
    if exist .\build\Release\ZombieFrontier.exe (
        .\build\Release\ZombieFrontier.exe
    ) else if exist .\build\ZombieFrontier.exe (
        .\build\ZombieFrontier.exe
    )
) else (
    echo Build failed. Please ensure CMake, Git, and a C++17 compiler (MSVC or MinGW) are installed.
)
pause
