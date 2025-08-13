@echo off
echo ========================================
echo    RESI APP - INICIO RAPIDO
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
echo Configurando base de datos...
cd backend

echo Generando cliente Prisma...
call npm run db:generate

echo Sincronizando base de datos...
call npm run db:push

echo Poblando con datos de ejemplo...
call npm run db:seed

cd ..

echo.
echo ========================================
echo    APLICACION LISTA PARA USAR
echo ========================================
echo.
echo URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5001
echo.
echo Credenciales de prueba:
echo   Admin:     admin@resi.com / admin123
echo   Residente: residente@resi.com / residente123
echo.
echo Presiona Ctrl+C para detener la aplicacion
echo.

call npm run dev 