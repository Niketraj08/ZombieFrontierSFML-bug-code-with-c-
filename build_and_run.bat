@echo off
echo ==========================================
echo Zombie Frontier - SFML Build
echo ==========================================
cmake -S . -B build
if errorlevel 1 goto fail
cmake --build build --config Release
if errorlevel 1 goto fail
if exist build\Release\ZombieFrontier.exe (
    build\Release\ZombieFrontier.exe
) else if exist build\ZombieFrontier.exe (
    build\ZombieFrontier.exe
) else (
    echo Executable not found.
)
goto end
:fail
echo Build failed.
pause
:end
