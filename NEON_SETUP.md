# Neon Database & Authentication Setup

## Overview
Este documento describe cómo configurar Neon PostgreSQL y el sistema de autenticación para Lima Centro.

---

## 1. Crear Cuenta en Neon

1. Ve a [https://neon.tech](https://neon.tech)
2. Crea una cuenta (puedes usar GitHub)
3. Crea un nuevo proyecto
4. Copia la cadena de conexión (DATABASE_URL)

---

## 2. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Neon Database
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.neon.tech/neondb?sslmode=require

# JWT Secret (genera una cadena aleatoria segura)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Opcional: API URL (para desarrollo local)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Generar JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Inicializar Base de Datos

Crea un script de inicialización en `scripts/init-db.ts`:

```typescript
import { initializeDatabase } from '@/services/db';

async function main() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main();
```

Ejecuta:
```bash
npx ts-node scripts/init-db.ts
```

---

## 4. Estructura de Base de Datos

### Tabla: users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: businesses
```sql
CREATE TABLE businesses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  website VARCHAR(255),
  rating DECIMAL(3, 2) DEFAULT 5.0,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. API Endpoints

### Autenticación

#### POST /api/auth/register
Registra un nuevo usuario.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://api.dicebear.com/..."
  }
}
```

#### POST /api/auth/login
Inicia sesión con un usuario existente.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://api.dicebear.com/..."
  }
}
```

#### POST /api/auth/logout
Cierra sesión del usuario.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Negocios

#### GET /api/businesses
Obtiene todos los negocios.

**Response:**
```json
[
  {
    "id": 1,
    "ownerId": 1,
    "name": "Restaurant Name",
    "category": "Restaurante",
    "district": "Miraflores",
    "address": "Av. Larco 1234",
    "description": "Great food",
    "phone": "+51 1 234 5678",
    "website": "https://example.com",
    "rating": 4.5,
    "lat": -12.1123,
    "lng": -77.0435,
    "imageUrl": "https://picsum.photos/400/300"
  }
]
```

#### POST /api/businesses
Crea un nuevo negocio (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "New Restaurant",
  "category": "Restaurante",
  "district": "Miraflores",
  "address": "Av. Larco 5678",
  "description": "Delicious food",
  "phone": "+51 1 987 6543",
  "website": "https://newrestaurant.com",
  "rating": 5,
  "lat": -12.1200,
  "lng": -77.0400,
  "imageUrl": "https://picsum.photos/400/300"
}
```

**Response:**
```json
{
  "id": 2,
  "ownerId": 1,
  "name": "New Restaurant",
  ...
}
```

---

## 6. Cliente HTTP Helper

Crea `services/api.ts` para facilitar las llamadas a la API:

```typescript
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API error');
  }

  return response.json();
}

export async function apiCallWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  return apiCall(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}
```

---

## 7. Seguridad

### Recomendaciones
1. **JWT_SECRET:** Usa una cadena aleatoria segura de al menos 32 caracteres
2. **HTTPS:** Siempre usa HTTPS en producción
3. **Cookies:** Los tokens se almacenan en cookies HttpOnly (seguras)
4. **Rate Limiting:** Implementa rate limiting en las rutas de autenticación
5. **Validación:** Valida siempre los datos de entrada

### Cambios de Contraseña
Para cambiar contraseñas, implementa:
```typescript
export async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string
) {
  const user = await getUserById(userId);
  const isValid = await comparePassword(oldPassword, user.password_hash);
  
  if (!isValid) throw new Error('Invalid password');
  
  const newHash = await hashPassword(newPassword);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);
}
```

---

## 8. Testing

Ejecuta los tests para verificar que todo funciona:

```bash
npm test
```

Crea tests para las nuevas rutas de API:

```typescript
describe('Auth API', () => {
  it('should register a new user', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
  });
});
```

---

## 9. Troubleshooting

### Error: "Cannot find module '@neondatabase/serverless'"
Solución: `npm install @neondatabase/serverless`

### Error: "DATABASE_URL is not defined"
Solución: Asegúrate de que `.env.local` contiene `DATABASE_URL`

### Error: "Connection refused"
Solución: Verifica que la cadena de conexión sea correcta y que Neon esté accesible

### Error: "Relation 'users' does not exist"
Solución: Ejecuta el script de inicialización de base de datos

---

## 10. Próximos Pasos

1. ✅ Configurar Neon
2. ✅ Crear tablas
3. ✅ Implementar autenticación
4. ⏳ Actualizar componentes para usar la nueva autenticación
5. ⏳ Migrar datos de LocalStorage a Neon
6. ⏳ Implementar protección de rutas
7. ⏳ Agregar validación de email
8. ⏳ Implementar recuperación de contraseña

---

## Recursos

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT.io](https://jwt.io)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

---

**Última actualización:** 25 de Noviembre, 2025
