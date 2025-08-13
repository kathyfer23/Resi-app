# 🚀 Instrucciones Rápidas - Resi App

## ¡Tu aplicación está lista para usar!

### 📋 Pasos para ejecutar la aplicación:

1. **Ejecutar el script de inicio automático (recomendado):**
   
   **Opción A - PowerShell:**
   ```bash
   .\start-app.ps1
   ```
   
   **Opción B - Batch (si PowerShell falla):**
   ```bash
   .\run-app.bat
   ```

   Estos scripts harán todo automáticamente:
   - ✅ Verificar Node.js
   - ✅ Instalar dependencias
   - ✅ Configurar la base de datos
   - ✅ Poblar con datos de ejemplo
   - ✅ Iniciar la aplicación

2. **O si prefieres hacerlo paso a paso:**
   ```bash
   # Instalar dependencias
   npm run install:all
   
   # Configurar base de datos
   .\setup-database.ps1
   
   # Iniciar aplicación
   npm run dev
   ```

### 🌐 URLs de la aplicación:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001

### 👤 Credenciales de prueba:

#### Administrador:
- **Email**: admin@resi.com
- **Contraseña**: admin123

#### Residente:
- **Email**: residente@resi.com
- **Contraseña**: residente123

#### Otros residentes de ejemplo:
- maria@resi.com / residente123
- carlos@resi.com / residente123
- ana@resi.com / residente123
- luis@resi.com / residente123

### 🎯 Funcionalidades disponibles:

#### Para Residentes:
- ✅ Ver dashboard con resumen de pagos
- ✅ Consultar historial de pagos
- ✅ Descargar documentos
- ✅ Ver notificaciones
- ✅ Actualizar perfil

#### Para Administradores:
- ✅ Panel de administración completo
- ✅ Gestión de residentes
- ✅ Registro de pagos
- ✅ Generación de documentos
- ✅ Reportes y estadísticas

### 🔧 Si tienes problemas:

1. **PostgreSQL no está instalado:**
   - Descarga desde: https://www.postgresql.org/download/windows/
   - O instala Chocolatey y ejecuta: `choco install postgresql`

2. **Error de conexión a la base de datos:**
   - Verifica que PostgreSQL esté corriendo
   - Revisa las credenciales en `backend/.env`

3. **Puertos ocupados:**
   - Cambia los puertos en `backend/.env` y `frontend/vite.config.ts`

### 📱 Características de la aplicación:

- **Gestión de pagos**: Mantenimiento, agua, garita
- **Documentos automáticos**: Facturas y recibos en PDF
- **Notificaciones**: Sistema de alertas
- **Panel administrativo**: Control completo
- **Interfaz responsive**: Funciona en móviles y desktop

### 🎉 ¡Disfruta usando tu aplicación!

La aplicación incluye datos de ejemplo para que puedas probar todas las funcionalidades inmediatamente.

---

**¿Necesitas ayuda?** Revisa el archivo `README.md` para documentación completa. 