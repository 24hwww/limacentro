# Testing Documentation - Lima Centro

## Overview
Este proyecto incluye una suite completa de tests unitarios e integración usando Jest y React Testing Library.

## Setup

### Instalación de dependencias de testing
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

### Archivos de configuración
- `jest.config.js` - Configuración de Jest
- `jest.setup.js` - Setup inicial para los tests
- `tsconfig.json` - Incluye tipos de Jest

## Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Tests en modo watch (se ejecutan automáticamente al cambiar archivos)
```bash
npm run test:watch
```

### Cobertura de tests
```bash
npm run test:coverage
```

## Estructura de Tests

Los tests están organizados en la carpeta `__tests__/` siguiendo la estructura del proyecto:

```
__tests__/
├── services/
│   ├── mockDatabase.test.ts
│   └── geocodingService.test.ts
└── components/
    ├── BusinessCard.test.tsx
    └── BusinessForm.test.tsx
```

## Test Suites

### 1. Mock Database Service Tests (`__tests__/services/mockDatabase.test.ts`)
Prueba la gestión de datos en LocalStorage:
- ✅ Obtener negocios iniciales
- ✅ Guardar y recuperar negocios
- ✅ Gestión de usuarios (login/logout)
- ✅ Persistencia en LocalStorage

**Casos de prueba:**
- `getBusinesses()` - Retorna negocios iniciales si localStorage está vacío
- `getBusinesses()` - Retorna negocios almacenados
- `addBusiness()` - Agrega un nuevo negocio
- `getCurrentUser()` - Retorna null si no hay usuario
- `getCurrentUser()` - Retorna usuario almacenado
- `loginMock()` - Crea y almacena un usuario mock
- `logoutMock()` - Elimina el usuario de localStorage

### 2. Geocoding Service Tests (`__tests__/services/geocodingService.test.ts`)
Prueba la geocodificación de direcciones mediante Nominatim API:
- ✅ Geocodificación exitosa
- ✅ Manejo de direcciones inválidas
- ✅ Manejo de errores de API
- ✅ Construcción correcta de queries

**Casos de prueba:**
- `geocodeAddress()` - Retorna coordenadas para dirección válida
- `geocodeAddress()` - Retorna null para dirección inválida
- `geocodeAddress()` - Retorna null en error de API
- `geocodeAddress()` - Incluye Lima, Peru en la query

### 3. BusinessCard Component Tests (`__tests__/components/BusinessCard.test.tsx`)
Prueba el componente de tarjeta de negocio:
- ✅ Renderizado de información
- ✅ Manejo de clicks
- ✅ Estado activo
- ✅ Visualización de rating

**Casos de prueba:**
- Renderiza información del negocio
- Llama onClick handler al hacer click
- Muestra estilos de estado activo
- Muestra el rating

### 4. BusinessForm Component Tests (`__tests__/components/BusinessForm.test.tsx`)
Prueba el formulario de registro de negocios:
- ✅ Renderizado de campos
- ✅ Manejo de cancelación
- ✅ Actualización de campos
- ✅ Validación de ubicación
- ✅ Validación de campos obligatorios

**Casos de prueba:**
- Renderiza todos los campos del formulario
- Llama onCancel al hacer click en cancelar
- Actualiza campos al escribir
- Muestra error sin ubicación
- Muestra error sin campos obligatorios

## Resultados Actuales

```
Test Suites: 4 total
Tests:       21 total
  ✅ Passed: 19
  ⚠️  Failed: 2 (validación de errores en formulario)
```

## Cobertura de Código

Para ver la cobertura detallada:
```bash
npm run test:coverage
```

Esto generará un reporte en `coverage/` con:
- Cobertura de líneas
- Cobertura de funciones
- Cobertura de ramas
- Cobertura de sentencias

## Mejoras Futuras

1. **Aumentar cobertura de tests**
   - Tests para BusinessDetailView
   - Tests para MapBoard
   - Tests de integración completa

2. **Tests E2E**
   - Usar Playwright o Cypress
   - Pruebas de flujos completos de usuario

3. **Tests de rendimiento**
   - Medir tiempos de renderizado
   - Optimizar componentes lentos

4. **Mocking mejorado**
   - Mock de Leaflet para MapBoard
   - Mock de fetch para APIs externas

## Debugging Tests

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

## Buenas Prácticas

1. **Aislamiento:** Cada test debe ser independiente
2. **Claridad:** Los nombres de tests deben ser descriptivos
3. **Cobertura:** Cubrir casos positivos y negativos
4. **Mocking:** Mockear dependencias externas
5. **Cleanup:** Limpiar estado entre tests (beforeEach)

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
