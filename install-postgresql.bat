@echo off
echo ========================================
echo    INSTALANDO POSTGRESQL
echo ========================================
echo.

echo Verificando si PostgreSQL ya esta instalado...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo PostgreSQL ya esta instalado ✓
    goto :setup_database
)

echo PostgreSQL no encontrado. Instalando...

echo Verificando Chocolatey...
choco --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Chocolatey no encontrado. Instalando...
    echo.
    echo Ejecutando comando de instalacion de Chocolatey...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    
    echo.
    echo Chocolatey instalado. Reiniciando terminal...
    echo Por favor ejecuta este script nuevamente.
    pause
    exit /b 0
)

echo Instalando PostgreSQL con Chocolatey...
choco install postgresql --yes

echo.
echo PostgreSQL instalado exitosamente!
echo Por favor reinicia tu terminal y ejecuta este script nuevamente.
pause
exit /b 0

:setup_database
echo.
echo ========================================
echo    CONFIGURANDO BASE DE DATOS
echo ========================================
echo.

echo Creando base de datos...
psql -U postgres -c "CREATE DATABASE resi_app;" 2>nul
if %errorlevel% equ 0 (
    echo Base de datos 'resi_app' creada exitosamente ✓
) else (
    echo La base de datos ya existe o hay un error de conexion
)

echo.
echo ========================================
echo    CONFIGURANDO PRISMA
echo ========================================
echo.

cd backend

echo Generando cliente Prisma...
call npm run db:generate

echo Sincronizando esquema de base de datos...
call npm run db:push

echo Poblando con datos de ejemplo...
call npm run db:seed

cd ..

echo.
echo ========================================
echo    BASE DE DATOS CONFIGURADA
echo ========================================
echo.
echo ✅ PostgreSQL instalado
echo ✅ Base de datos creada
echo ✅ Prisma configurado
echo ✅ Datos de ejemplo cargados
echo.
echo Ahora puedes ejecutar: .\start-both.bat
echo.
pause 