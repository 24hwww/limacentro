/**
 * Script para probar el flujo de autenticación con Neon
 * 
 * Para ejecutar:
 * 1. Inicia el servidor: npm run dev
 * 2. En otra terminal: node scripts/test-auth-flow.js
 */

const fetch = require('node-fetch');

const API_URL = '***REMOVED***';

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
  name: 'Test User'
};

async function testAuthFlow() {
  console.log('🧪 Iniciando prueba de flujo de autenticación con Neon...\n');

  try {
    // 1. Test Registration
    console.log('1️⃣ Probando registro...');
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registro exitoso:', {
        token: registerData.token ? '✓' : '✗',
        user: registerData.user?.name || 'No user'
      });

      // 2. Test Login
      console.log('\n2️⃣ Probando login...');
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login exitoso:', {
          token: loginData.token ? '✓' : '✗',
          user: loginData.user?.name || 'No user'
        });

        // 3. Test Protected Route
        console.log('\n3️⃣ Probando ruta protegida...');
        const businessesResponse = await fetch(`${API_URL}/api/businesses`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (businessesResponse.ok) {
          console.log('✅ Acceso a ruta protegida exitoso');
        } else {
          console.log('✗ Error en ruta protegida:', businessesResponse.status);
        }

        // 4. Test Logout
        console.log('\n4️⃣ Probando logout...');
        const logoutResponse = await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (logoutResponse.ok) {
          console.log('✅ Logout exitoso');
        } else {
          console.log('✗ Error en logout:', logoutResponse.status);
        }

      } else {
        const error = await loginResponse.json();
        console.log('✗ Login fallido:', error);
      }
    } else {
      const error = await registerResponse.json();
      console.log('✗ Registro fallido:', error);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n🏁 Prueba completada');
  console.log('\n📝 Notas:');
  console.log('- Si ves errores, verifica que el servidor esté corriendo en ***REMOVED***');
  console.log('- Verifica que las variables de entorno estén configuradas correctamente');
  console.log('- Revisa la conexión a la base de datos Neon');
}

// Test de conexión a la base de datos
async function testDatabaseConnection() {
  console.log('🔍 Probando conexión a la base de datos...');
  
  try {
    const response = await fetch(`${API_URL}/api/businesses`);
    if (response.ok) {
      console.log('✅ Conexión a base de datos exitosa');
    } else {
      console.log('✗ Error en conexión a base de datos:', response.status);
    }
  } catch (error) {
    console.log('✗ No se pudo conectar al servidor:', error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  await testDatabaseConnection();
  console.log('\n');
  await testAuthFlow();
}

if (require.main === module) {
  runTests();
}

module.exports = { testAuthFlow, testDatabaseConnection };
