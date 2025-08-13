#!/bin/bash

echo "🚀 Configurando Resi App..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL no está instalado. Asegúrate de tener PostgreSQL configurado."
fi

echo "📦 Instalando dependencias..."

# Instalar dependencias del root
npm install

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

# Crear directorio de uploads
mkdir -p uploads

# Copiar archivo de configuración
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Archivo .env creado. Por favor configura las variables de entorno."
fi

cd ..

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

echo "✅ Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura la base de datos PostgreSQL"
echo "2. Edita backend/.env con tus credenciales"
echo "3. Ejecuta: cd backend && npm run db:generate && npm run db:push"
echo "4. Ejecuta: npm run dev"
echo ""
echo "🌐 La aplicación estará disponible en:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000" 