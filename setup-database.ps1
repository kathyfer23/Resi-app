# Script para configurar PostgreSQL automaticamente
Write-Host "Configurando base de datos PostgreSQL para Resi App..." -ForegroundColor Green

# Verificar si PostgreSQL esta instalado
try {
    $pgVersion = psql --version 2>$null
    if ($pgVersion) {
        Write-Host "PostgreSQL encontrado: $pgVersion" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL no encontrado. Instalando..." -ForegroundColor Yellow
        
        # Instalar PostgreSQL usando Chocolatey (si esta disponible)
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            Write-Host "Instalando PostgreSQL con Chocolatey..." -ForegroundColor Yellow
            choco install postgresql --yes
        } else {
            Write-Host "Chocolatey no encontrado. Por favor instala PostgreSQL manualmente:" -ForegroundColor Yellow
            Write-Host "   Descarga desde: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
            Write-Host "   O instala Chocolatey: https://chocolatey.org/install" -ForegroundColor Cyan
            exit 1
        }
    }
} catch {
    Write-Host "Error verificando PostgreSQL: $_" -ForegroundColor Red
    exit 1
}

# Crear base de datos y usuario
Write-Host "Configurando base de datos..." -ForegroundColor Yellow

# Intentar conectar y crear la base de datos
try {
    # Crear base de datos
    psql -U postgres -c "CREATE DATABASE resi_app;" 2>$null
    Write-Host "Base de datos 'resi_app' creada" -ForegroundColor Green
} catch {
    Write-Host "La base de datos ya existe o hay un error de conexion" -ForegroundColor Yellow
}

# Configurar Prisma
Write-Host "Configurando Prisma..." -ForegroundColor Yellow
cd backend
npm run db:generate
npm run db:push

# Poblar con datos de ejemplo
Write-Host "Poblando base de datos con datos de ejemplo..." -ForegroundColor Yellow
npm run db:seed

Write-Host "Base de datos configurada exitosamente!" -ForegroundColor Green
Write-Host "Ahora puedes ejecutar: npm run dev" -ForegroundColor Cyan
Write-Host "Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "   - Admin: admin@resi.com / admin123" -ForegroundColor White
Write-Host "   - Residente: residente@resi.com / residente123" -ForegroundColor White 