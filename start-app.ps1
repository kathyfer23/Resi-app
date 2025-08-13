# Script de inicio rapido para Resi App
Write-Host "Iniciando Resi App..." -ForegroundColor Green

# Verificar si Node.js esta instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js no encontrado. Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar si PostgreSQL esta instalado
try {
    $pgVersion = psql --version 2>$null
    if ($pgVersion) {
        Write-Host "PostgreSQL encontrado" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL no encontrado. Intentando configurar..." -ForegroundColor Yellow
        
        # Intentar instalar PostgreSQL con Chocolatey
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            Write-Host "Instalando PostgreSQL..." -ForegroundColor Yellow
            choco install postgresql --yes
            Write-Host "PostgreSQL instalado. Por favor reinicia tu terminal y ejecuta este script nuevamente." -ForegroundColor Green
            exit 0
        } else {
            Write-Host "PostgreSQL no encontrado y Chocolatey no disponible." -ForegroundColor Red
            Write-Host "   Por favor instala PostgreSQL manualmente desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
            Write-Host "   O instala Chocolatey: https://chocolatey.org/install" -ForegroundColor Yellow
            exit 1
        }
    }
} catch {
    Write-Host "Error verificando PostgreSQL: $_" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si no estan instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm run install:all
}

# Configurar base de datos
Write-Host "Configurando base de datos..." -ForegroundColor Yellow
cd backend

# Intentar crear la base de datos
try {
    psql -U postgres -c "CREATE DATABASE resi_app;" 2>$null
    Write-Host "Base de datos creada" -ForegroundColor Green
} catch {
    Write-Host "La base de datos ya existe o hay un error de conexion" -ForegroundColor Yellow
}

# Configurar Prisma
npm run db:generate
npm run db:push

# Poblar con datos de ejemplo
Write-Host "Poblando con datos de ejemplo..." -ForegroundColor Yellow
npm run db:seed

cd ..

# Iniciar la aplicacion
Write-Host "Iniciando la aplicacion..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "   - Admin: admin@resi.com / admin123" -ForegroundColor White
Write-Host "   - Residente: residente@resi.com / residente123" -ForegroundColor White
Write-Host ""
Write-Host "Presiona Ctrl+C para detener la aplicacion" -ForegroundColor Gray

# Ejecutar la aplicacion
npm run dev 