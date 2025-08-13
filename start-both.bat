@echo off
echo ========================================
echo    RESI APP - BACKEND + FRONTEND
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
echo Iniciando Backend...
start "Backend" cmd /k "cd backend && npm run dev"

echo Esperando 3 segundos para que el backend inicie...
timeout /t 3 /nobreak >nul

echo.
echo Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo    APLICACION INICIADA
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
echo Presiona cualquier tecla para cerrar esta ventana
echo.

pause >nul 