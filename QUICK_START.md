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

Abre `.env.local` y agrega:

```env
# Neon Database Connection
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.neon.tech/neondb?sslmode=require

# JWT Secret (genera uno seguro)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# API URL (para desarrollo local)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Para generar JWT_SECRET seguro:**
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

### Paso 5: Probar API (5 minutos)

**Registrar usuario:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User",
    "avatarUrl": "https://api.dicebear.com/..."
  }
}
```

**Iniciar sesión:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Crear negocio:**
```bash
curl -X POST http://localhost:3001/api/businesses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Mi Restaurante",
    "category": "Restaurante",
    "district": "Miraflores",
    "address": "Av. Larco 1234",
    "description": "Comida deliciosa",
    "phone": "+51 1 234 5678",
    "website": "https://example.com",
    "rating": 5,
    "lat": -12.1123,
    "lng": -77.0435,
    "imageUrl": "https://picsum.photos/400/300"
  }'
```

---

## ✅ Checklist de Verificación

- [ ] Cuenta creada en Neon.tech
- [ ] Proyecto creado en Neon
- [ ] DATABASE_URL copiada a `.env.local`
- [ ] JWT_SECRET generado y agregado a `.env.local`
- [ ] Script de inicialización ejecutado
- [ ] Tablas creadas en Neon
- [ ] Usuario registrado exitosamente
- [ ] Usuario logueado exitosamente
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

### Error: "Invalid token"
- Asegúrate de que JWT_SECRET es correcto
- Verifica que el token no ha expirado (7 días)

---

## 📚 Archivos Importantes

```
✅ services/db.ts                 - Conexión a Neon
✅ services/auth.ts               - Autenticación
✅ services/api.ts                - Cliente HTTP
✅ services/businessService.ts    - Gestión de negocios
✅ contexts/AuthContext.tsx       - Context de autenticación
✅ components/AuthModal.tsx       - Modal de login/registro
✅ pages/api/auth/register.ts     - Endpoint de registro
✅ pages/api/auth/login.ts        - Endpoint de login
✅ pages/api/auth/logout.ts       - Endpoint de logout
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
- **JWT.io:** https://jwt.io

---

**Tiempo total estimado:** 15-20 minutos  
**Dificultad:** Fácil  
**Requisitos:** Cuenta de GitHub (opcional)

¡Listo para comenzar! 🚀
