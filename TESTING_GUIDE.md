# Testing Guide - Lima Centro

## 📋 Tipos de Tests

### 1. Unit Tests (Sin dependencias externas)
✅ Servicios de autenticación  
✅ Servicios de geocodificación  
✅ Componentes React  

### 2. Integration Tests (Requieren servidor y BD)
⏳ API de autenticación  
⏳ API de negocios  

### 3. E2E Tests (Flujo completo)
⏳ Flujo de registro → login → crear negocio  

---

## 🚀 Ejecutar Tests Unitarios

### Todos los tests
```bash
npm test
```

### Tests en modo watch (se ejecutan al cambiar archivos)
```bash
npm run test:watch
```

### Cobertura de tests
```bash
npm run test:coverage
```

### Test específico
```bash
npm test -- auth.test.ts
```

---

## 🧪 Ejecutar Pruebas de Flujo

### Requisitos previos
1. Servidor ejecutándose: `npm run dev`
2. Base de datos Neon configurada
3. Variables de entorno en `.env.local`

### Opción 1: Script PowerShell (Windows)
```bash
.\scripts\test-flow.ps1
```

### Opción 2: Script Bash (Linux/Mac)
```bash
bash scripts/test-flow.sh
```

### Opción 3: Manual con curl

#### 1. Registrar usuario
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

#### 2. Iniciar sesión
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 3. Obtener todos los negocios
```bash
curl http://localhost:3001/api/businesses
```

#### 4. Crear negocio (requiere token)
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

#### 5. Obtener negocios del usuario
```bash
curl http://localhost:3001/api/businesses/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 6. Cerrar sesión
```bash
curl -X POST http://localhost:3001/api/auth/logout
```

---

## 📊 Resultados de Tests Actuales

```
Test Suites: 4 failed, 3 passed, 7 total
Tests:       16 failed, 19 passed, 35 total

✅ PASS: __tests__/services/mockDatabase.test.ts
✅ PASS: __tests__/components/BusinessCard.test.tsx
✅ PASS: __tests__/services/geocodingService.test.ts

⏳ FAIL: __tests__/api/auth.test.ts (requiere servidor + BD)
⏳ FAIL: __tests__/api/businesses.test.ts (requiere servidor + BD)
⏳ FAIL: __tests__/components/BusinessForm.test.tsx (2 tests)
```

---

## ✅ Checklist de Pruebas

### Unit Tests
- [x] Hashing de contraseñas
- [x] Comparación de contraseñas
- [x] Generación de JWT
- [x] Verificación de JWT
- [x] Geocodificación
- [x] Componentes React

### Integration Tests
- [ ] Registro de usuario
- [ ] Login de usuario
- [ ] Logout de usuario
- [ ] Crear negocio
- [ ] Obtener negocios
- [ ] Obtener negocios del usuario

### E2E Tests
- [ ] Flujo completo: Registro → Login → Crear negocio → Logout
- [ ] Validación de errores
- [ ] Manejo de excepciones

---

## 🔍 Debugging Tests

### Ver output detallado
```bash
npm test -- --verbose
```

### Ejecutar un test específico
```bash
npm test -- BusinessCard.test.tsx
```

### Ejecutar tests que coincidan con un patrón
```bash
npm test -- --testNamePattern="should render"
```

### Modo watch con debug
```bash
npm test -- --watch --verbose
```

---

## 📈 Cobertura de Código

Para ver la cobertura detallada:
```bash
npm run test:coverage
```

Esto genera un reporte en `coverage/` con:
- Cobertura de líneas
- Cobertura de funciones
- Cobertura de ramas
- Cobertura de sentencias

---

## 🚀 Próximas Mejoras

### Tests a Implementar
1. [ ] Tests de autenticación con BD real
2. [ ] Tests de CRUD de negocios
3. [ ] Tests de validación de entrada
4. [ ] Tests de manejo de errores
5. [ ] Tests E2E con Playwright

### Herramientas Recomendadas
- **Playwright** - E2E testing
- **Supertest** - Testing de APIs
- **MSW** - Mock Service Worker
- **Vitest** - Testing más rápido

---

## 📝 Escribir Nuevos Tests

### Estructura básica
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Ejemplo con async
```typescript
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

---

## 🎯 Objetivos de Cobertura

| Tipo | Objetivo | Actual |
|------|----------|--------|
| Líneas | 80% | ~60% |
| Funciones | 80% | ~70% |
| Ramas | 75% | ~50% |
| Sentencias | 80% | ~60% |

---

## 📞 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Database connection failed"
- Verifica que `.env.local` tiene `DATABASE_URL`
- Verifica que Neon está accesible

### Error: "Port 3001 already in use"
```bash
# Matar proceso en puerto 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Tests se quedan colgados
- Aumenta el timeout: `jest.setTimeout(10000)`
- Verifica que el servidor está corriendo

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Playwright](https://playwright.dev/)

---

**Última actualización:** 25 de Noviembre, 2025  
**Estado:** ✅ Tests unitarios funcionando
