# 🏠 Resi App - Gestión de Pagos Residencial

Una aplicación completa para gestionar pagos de mantenimiento, agua y garita en colonias residenciales.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js (versión 16 o superior)
- PostgreSQL
- npm o yarn

### Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd Resi-app
   ```

2. **Instalar dependencias**
   ```bash
   npm run install:all
   ```

3. **Configurar PostgreSQL**
   
   **Opción A: Automático (recomendado)**
   ```bash
   # Ejecutar el script de configuración
   .\setup-database.ps1
   ```
   
   **Opción B: Manual**
   - Instalar PostgreSQL desde: https://www.postgresql.org/download/windows/
   - Crear base de datos: `CREATE DATABASE resi_app;`
   - Configurar Prisma:
     ```bash
     cd backend
     npm run db:generate
     npm run db:push
     ```

4. **Configurar variables de entorno**
   
   El archivo `.env` ya está configurado con valores de ejemplo:
   ```env
   DATABASE_URL="postgresql://postgres:password123@localhost:5432/resi_app"
   JWT_SECRET="resi-app-super-secret-jwt-key-2024-change-this-in-production"
   PORT=5000
   NODE_ENV=development
   UPLOAD_PATH=./uploads
   ```

5. **Ejecutar la aplicación**
   ```bash
   npm run dev
   ```

   Esto iniciará:
   - Backend en: http://localhost:5000
   - Frontend en: http://localhost:3000

## 📱 Funcionalidades

### 👤 Residentes
- Registro e inicio de sesión
- Ver pagos pendientes y realizados
- Descargar documentos (facturas, recibos)
- Ver notificaciones
- Actualizar perfil

### 👨‍💼 Administradores
- Panel de administración completo
- Gestión de residentes
- **Crear pagos individuales y masivos**
- **Asignar pagos de mantenimiento, agua y garita**
- **Marcar pagos como pagados**
- Generación de documentos
- Reportes y estadísticas
- Envío de notificaciones masivas
- **Notificaciones automáticas al crear pagos**

## 💰 Gestión de Pagos - Panel de Administrador

### ✨ Nueva Funcionalidad Implementada

El administrador ahora puede gestionar completamente los pagos de los residentes:

#### 🔹 Crear Pagos Individuales
- Seleccionar residente específico
- Asignar tipo de pago (Mantenimiento, Agua, Garita)
- Establecer monto y fecha de vencimiento
- Agregar descripción opcional

#### 🔹 Crear Pagos Masivos
- Asignar el mismo pago a todos los residentes activos
- Ideal para pagos mensuales de mantenimiento
- Proceso automatizado y eficiente

#### 🔹 Gestión de Pagos
- Ver todos los pagos en tabla organizada
- Marcar pagos como pagados
- Ver detalles de cada pago
- Filtros por estado y tipo

#### 🔔 Notificaciones Automáticas
- Al crear un pago, el residente recibe notificación automática
- Incluye detalles del pago (tipo, monto, fecha de vencimiento)
- Sistema de alertas integrado

### 🎯 Casos de Uso

**Mensual:**
- Mantenimiento: Pagos masivos para todos los residentes
- Agua: Pagos individuales según consumo

**Especiales:**
- Garita: Servicios adicionales de seguridad
- Pagos específicos para servicios especiales

> 📖 **Ver documentación completa:** [FUNCIONALIDAD-PAGOS-ADMIN.md](FUNCIONALIDAD-PAGOS-ADMIN.md)

## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **PDFKit** - Generación de PDFs
- **Multer** - Manejo de archivos

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Framework de CSS
- **React Router** - Navegación
- **React Hook Form** - Manejo de formularios
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificaciones

## 📁 Estructura del Proyecto

```
Resi-app/
├── backend/                 # Servidor Node.js
│   ├── src/
│   │   ├── routes/         # Rutas de la API
│   │   ├── middleware/     # Middlewares
│   │   └── lib/           # Utilidades
│   ├── prisma/            # Esquema de base de datos
│   └── uploads/           # Archivos subidos
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── contexts/     # Contextos de React
│   │   └── lib/          # Utilidades
│   └── public/           # Archivos estáticos
└── package.json          # Scripts del proyecto
```

## 🔧 Comandos Útiles

```bash
# Instalar todas las dependencias
npm run install:all

# Ejecutar en desarrollo (backend + frontend)
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend

# Generar cliente de Prisma
cd backend && npm run db:generate

# Sincronizar base de datos
cd backend && npm run db:push

# Abrir Prisma Studio
cd backend && npm run db:studio
```

## 🔐 Credenciales de Prueba

### Usuario Administrador
- **Email**: admin@resi.com
- **Contraseña**: admin123

### Usuario Residente
- **Email**: residente@resi.com
- **Contraseña**: residente123

> ⚠️ **Nota**: Estas son credenciales de prueba. Cámbialas en producción.

## 📊 Base de Datos

La aplicación incluye las siguientes entidades:

- **Users**: Usuarios del sistema
- **Residents**: Información de residentes
- **Payments**: Pagos (mantenimiento, agua, garita)
- **Documents**: Documentos generados
- **Notifications**: Notificaciones del sistema

## 🚀 Despliegue

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Servir archivos estáticos
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas:

1. Verifica que PostgreSQL esté corriendo
2. Revisa los logs del backend
3. Asegúrate de que las variables de entorno estén configuradas
4. Ejecuta `npm run db:push` para sincronizar la base de datos

---

¡Disfruta usando Resi App! 🎉 