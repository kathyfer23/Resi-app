@echo off
echo ========================================
echo    RESI APP - SOLO FRONTEND
echo ========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no encontrado
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js encontrado ✓

echo.
echo Instalando dependencias del frontend...
cd frontend
call npm install

echo.
echo ========================================
echo    INICIANDO SOLO FRONTEND
echo ========================================
echo.
echo URL: http://localhost:3000
echo.
echo NOTA: El backend no esta corriendo
echo       pero puedes ver la interfaz
echo.
echo Presiona Ctrl+C para detener
echo.

call npm run dev 