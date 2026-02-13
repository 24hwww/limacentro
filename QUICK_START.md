# Quick Start - Neon Database Setup

## 🚀 Pasos Rápidos para Comenzar

### Paso 1: Configurar Neon (5 minutos)

1. **Crear cuenta en Neon:**
   - Ve a https://neon.tech
   - Haz clic en "Sign Up"
   - Usa tu cuenta de GitHub o crea una nueva

2. **Crear proyecto:**
   - Haz clic en "New Project"
   - Elige un nombre (ej: "limacentro")
   - Selecciona región (ej: us-east-1)
   - Haz clic en "Create Project"

3. **Copiar conexión:**
   - En el dashboard, busca "Connection string"
   - Copia la URL que comienza con `postgresql://`

### Paso 2: Configurar Variables de Entorno (2 minutos)

Primero crea tu archivo local:

```bash
cp .env.example .env.local
```

Luego abre `.env.local` y agrega tus valores reales:

```env
# Neon Database Connection
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.neon.tech/neondb?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API URL (para desarrollo local)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Para generar NEXTAUTH_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 3: Inicializar Base de Datos (2 minutos)

```bash
# Instalar ts-node si no lo tienes
npm install -g ts-node

# Ejecutar script de inicialización
npx ts-node scripts/init-db.ts
```

**Resultado esperado:**
```
🚀 Initializing database schema...
✅ Database schema initialized successfully!
```

### Paso 4: Verificar en Neon Console (1 minuto)

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Ejecuta:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
5. Deberías ver las tablas `users` y `businesses`

### Paso 5: Probar autenticación y API (5 minutos)

1. Ejecuta `npm run dev`.
2. Abre `http://localhost:3000`.
3. Haz clic en `Ingresar con Google`.
4. Verifica que al volver a la app aparezca tu perfil en la barra lateral.
5. Prueba `GET /api/businesses` y `GET /api/businesses/me` desde el navegador o cliente HTTP con la misma sesión.

---

## ✅ Checklist de Verificación

- [ ] Cuenta creada en Neon.tech
- [ ] Proyecto creado en Neon
- [ ] DATABASE_URL copiada a `.env.local`
- [ ] NEXTAUTH_SECRET generado y agregado a `.env.local`
- [ ] GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET configurados
- [ ] Script de inicialización ejecutado
- [ ] Tablas creadas en Neon
- [ ] Login con Google funcionando
- [ ] Negocio creado exitosamente

---

## 🔧 Troubleshooting

### Error: "Cannot find module '@neondatabase/serverless'"
```bash
npm install @neondatabase/serverless postgres
```

### Error: "DATABASE_URL is not defined"
- Verifica que `.env.local` contiene `DATABASE_URL`
- Reinicia el servidor: `npm run dev`

### Error: "Connection refused"
- Verifica que la URL de Neon es correcta
- Asegúrate de que incluye `?sslmode=require`
- Prueba la conexión en Neon Console

### Error: "Relation 'users' does not exist"
- Ejecuta: `npx ts-node scripts/init-db.ts`
- Verifica que no hay errores en la salida

### Error: "OAuth callback error"
- Verifica `NEXTAUTH_URL`
- Revisa que el callback de Google coincida con `/api/auth/callback/google`
- Asegúrate de tener `NEXTAUTH_SECRET` y credenciales Google válidas

---

## 📚 Archivos Importantes

```
✅ services/db.ts                 - Conexión a Neon
✅ pages/api/auth/[...nextauth].ts - Configuración NextAuth + Google
✅ services/api.ts                - Cliente HTTP
✅ services/businessService.ts    - Gestión de negocios
✅ contexts/AuthContext.tsx       - Context de autenticación
✅ components/AuthModal.tsx       - Modal de login/registro
✅ pages/api/businesses/index.ts  - Endpoints de negocios
✅ pages/api/businesses/me.ts     - Negocios del usuario
✅ scripts/init-db.ts             - Script de inicialización
```

---

## 🎯 Próximos Pasos

1. ✅ Configurar Neon
2. ✅ Inicializar base de datos
3. ⏳ Actualizar componentes para usar API
4. ⏳ Migrar datos de LocalStorage
5. ⏳ Implementar protección de rutas
6. ⏳ Agregar validación de email
7. ⏳ Implementar recuperación de contraseña

---

## 📞 Soporte

- **Documentación Neon:** https://neon.tech/docs
- **Documentación PostgreSQL:** https://www.postgresql.org/docs
- **NextAuth:** https://next-auth.js.org

---

**Tiempo total estimado:** 15-20 minutos  
**Dificultad:** Fácil  
**Requisitos:** Cuenta de GitHub (opcional)

¡Listo para comenzar! 🚀
