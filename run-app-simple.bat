@echo off
echo ========================================
echo    RESI APP - INICIO SIMPLIFICADO
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
echo Instalando dependencias...
call npm run install:all

echo.
echo ========================================
echo    INICIANDO APLICACION
echo ========================================
echo.
echo URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5001
echo.
echo NOTA: La base de datos no esta configurada
echo       pero puedes ver la interfaz funcionando
echo.
echo Presiona Ctrl+C para detener la aplicacion
echo.

call npm run dev 