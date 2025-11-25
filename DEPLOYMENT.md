# Deployment Guide - Lima Centro

## 🚀 Despliegue en Netlify

### Opción 1: Despliegue Manual con Netlify CLI (Recomendado)

#### Paso 1: Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

#### Paso 2: Autenticarse con Netlify
```bash
netlify login
```
Esto abrirá tu navegador para que inicies sesión con tu cuenta de Netlify.

#### Paso 3: Construir la aplicación
```bash
npm run build
```

#### Paso 4: Desplegar
```bash
netlify deploy --prod
```

**Respuesta esperada:**
```
✓ Linked to limacentro site
✓ Uploaded 45 files
✓ Site deployed at https://limacentro.netlify.app
```

---

### Opción 2: Despliegue desde GitHub (Recomendado para CI/CD)

#### Paso 1: Crear repositorio en GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/limacentro.git
git push -u origin main
```

#### Paso 2: Conectar con Netlify
1. Ve a https://app.netlify.com
2. Haz clic en "New site from Git"
3. Selecciona GitHub
4. Selecciona tu repositorio
5. Configura:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18

#### Paso 3: Agregar variables de entorno
En Netlify Dashboard:
1. Ve a "Site settings" → "Build & deploy" → "Environment"
2. Agrega las variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   NEXT_PUBLIC_API_URL=https://limacentro.netlify.app
   ```

#### Paso 4: Desplegar
Netlify desplegará automáticamente cada vez que hagas push a main.

---

### Opción 3: Despliegue en Vercel (Alternativa)

#### Paso 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

#### Paso 2: Desplegar
```bash
vercel
```

#### Paso 3: Configurar variables de entorno
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

---

## 🔐 Variables de Entorno en Producción

Asegúrate de configurar estas variables en tu plataforma de despliegue:

```env
# Neon Database
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.neon.tech/neondb?sslmode=require

# JWT Secret (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API URL
NEXT_PUBLIC_API_URL=https://limacentro.netlify.app
```

---

## ✅ Checklist de Despliegue

- [ ] Build exitoso (`npm run build`)
- [ ] Variables de entorno configuradas
- [ ] Base de datos Neon accesible
- [ ] Cuenta de Netlify/Vercel creada
- [ ] Repositorio de GitHub creado (opcional)
- [ ] Sitio desplegado
- [ ] Pruebas de API funcionando
- [ ] SSL/HTTPS habilitado

---

## 🧪 Pruebas Post-Despliegue

### 1. Verificar que el sitio está en línea
```bash
curl https://limacentro.netlify.app
```

### 2. Probar registro de usuario
```bash
curl -X POST https://limacentro.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 3. Probar obtener negocios
```bash
curl https://limacentro.netlify.app/api/businesses
```

### 4. Probar en el navegador
Ve a https://limacentro.netlify.app y verifica que:
- [ ] La página carga correctamente
- [ ] El mapa se muestra
- [ ] Los negocios se cargan
- [ ] El login/registro funciona
- [ ] Puedes crear un negocio

---

## 🚨 Troubleshooting

### Error: "DATABASE_URL is not defined"
**Solución:** Agrega `DATABASE_URL` a las variables de entorno en Netlify

### Error: "Cannot find module"
**Solución:** Ejecuta `npm install` en el servidor de despliegue
```bash
netlify deploy --prod --build
```

### Error: "Connection refused"
**Solución:** Verifica que Neon está accesible desde Netlify
- Comprueba que la URL de conexión es correcta
- Verifica que incluye `?sslmode=require`

### Error: "Build failed"
**Solución:** Revisa los logs de build en Netlify Dashboard
```bash
netlify logs
```

---

## 📊 Monitoreo Post-Despliegue

### Logs en Netlify
```bash
netlify logs
```

### Logs de funciones
```bash
netlify functions:invoke auth/register
```

### Estadísticas de despliegue
Ve a https://app.netlify.com → Tu sitio → Analytics

---

## 🔄 Despliegues Futuros

Después del despliegue inicial, cada push a main desplegará automáticamente:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Netlify desplegará automáticamente
```

---

## 📈 Optimizaciones para Producción

### 1. Habilitar compresión
Ya está habilitada en Next.js

### 2. Cacheo de assets
Configurado en `netlify.toml`

### 3. Headers de seguridad
Configurados en `netlify.toml`

### 4. Rate limiting
Implementar en API routes:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana
});
```

---

## 🎯 Dominio Personalizado

1. Ve a Netlify Dashboard → Tu sitio → Domain settings
2. Haz clic en "Add custom domain"
3. Ingresa tu dominio (ej: limacentro.com)
4. Sigue las instrucciones para configurar DNS

---

## 📞 Soporte

- **Netlify Docs:** https://docs.netlify.com
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

**Última actualización:** 25 de Noviembre, 2025  
**Estado:** ✅ Listo para despliegue
