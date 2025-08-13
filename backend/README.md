# Resi App Backend

Backend para la aplicación de gestión de pagos de colonia residencial.

## Tecnologías

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT para autenticación
- PDFKit para generación de documentos

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `env.example` a `.env` y configura las variables:

```bash
cp env.example .env
```

Variables necesarias:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `PORT`: Puerto del servidor (opcional, default: 5000)
- `NODE_ENV`: Entorno (development/production)

### 3. Configurar base de datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Crear tablas en la base de datos
npm run db:push

# O usar migraciones
npm run db:migrate
```

### 4. Crear directorio de uploads

```bash
mkdir uploads
```

### 5. Ejecutar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Estructura del proyecto

```
src/
├── index.js              # Servidor principal
├── lib/
│   └── prisma.js         # Configuración de Prisma
├── middleware/
│   └── auth.js           # Middleware de autenticación
└── routes/
    ├── auth.js           # Autenticación
    ├── users.js          # Gestión de usuarios
    ├── payments.js       # Gestión de pagos
    ├── documents.js      # Gestión de documentos
    ├── notifications.js  # Notificaciones
    └── admin.js          # Funciones de administrador
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de residente
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/change-password` - Cambiar contraseña

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/change-password` - Cambiar contraseña

### Pagos
- `GET /api/payments/my-payments` - Pagos del residente
- `GET /api/payments/my-summary` - Resumen de pagos
- `POST /api/payments` - Crear pago (admin)
- `PUT /api/payments/:id/mark-paid` - Marcar como pagado (admin)
- `GET /api/payments` - Todos los pagos (admin)
- `GET /api/payments/stats` - Estadísticas (admin)

### Documentos
- `GET /api/documents/my-documents` - Documentos del residente
- `POST /api/documents/generate-water-invoice` - Generar factura de agua (admin)
- `POST /api/documents/generate-maintenance-invoice` - Generar factura de mantenimiento (admin)
- `POST /api/documents/generate-receipt` - Generar recibo (admin)
- `GET /api/documents/download/:id` - Descargar documento
- `PUT /api/documents/:id/read` - Marcar como leído

### Notificaciones
- `GET /api/notifications` - Obtener notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída
- `PUT /api/notifications/read-all` - Marcar todas como leídas
- `GET /api/notifications/unread-count` - Contador de no leídas

### Administración
- `GET /api/admin/residents` - Listar residentes
- `GET /api/admin/stats` - Estadísticas generales
- `POST /api/admin/create-admin` - Crear administrador
- `PUT /api/admin/residents/:id/status` - Cambiar estado de residente
- `POST /api/admin/send-mass-notification` - Notificación masiva
- `GET /api/admin/payments-report` - Reporte de pagos

## Roles

- **ADMIN**: Acceso completo a todas las funcionalidades
- **RESIDENT**: Acceso limitado a sus propios datos y pagos

## Base de datos

El esquema incluye las siguientes entidades:

- **User**: Usuarios del sistema
- **Resident**: Información específica de residentes
- **Payment**: Registro de pagos
- **Document**: Documentos generados (facturas, recibos)
- **Notification**: Notificaciones del sistema

## Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación JWT
- Validación de datos con express-validator
- Middleware de autenticación para rutas protegidas
- CORS configurado
- Helmet para headers de seguridad 