# Test Flow Script - Lima Centro (PowerShell)
# Este script prueba el flujo completo de la aplicación

$API_URL = "http://localhost:3001"
$TIMESTAMP = Get-Date -UFormat %s
$TEST_EMAIL = "test-$TIMESTAMP@example.com"
$TEST_PASSWORD = "password123"
$TEST_NAME = "Test User $TIMESTAMP"

Write-Host "🚀 Iniciando pruebas de flujo..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Función para imprimir resultados
function Print-Result {
    param(
        [bool]$Success,
        [string]$Message
    )
    if ($Success) {
        Write-Host "✓ $Message" -ForegroundColor Green
    } else {
        Write-Host "✗ $Message" -ForegroundColor Red
    }
}

# Test 1: Registrar usuario
Write-Host "`n1. Registrando usuario..." -ForegroundColor Yellow

$registerBody = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
    name = $TEST_NAME
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$API_URL/api/auth/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $registerBody `
        -ErrorAction Stop

    $registerData = $registerResponse.Content | ConvertFrom-Json
    $AUTH_TOKEN = $registerData.token
    $USER_ID = $registerData.user.id

    Print-Result $true "Usuario registrado: $TEST_EMAIL"
    Write-Host "  Token: $($AUTH_TOKEN.Substring(0, 20))..."
    Write-Host "  User ID: $USER_ID"
} catch {
    Print-Result $false "Error al registrar usuario"
    Write-Host "  Error: $($_.Exception.Message)"
    exit 1
}

# Test 2: Login
Write-Host "`n2. Iniciando sesión..." -ForegroundColor Yellow

$loginBody = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$API_URL/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginBody `
        -ErrorAction Stop

    $loginData = $loginResponse.Content | ConvertFrom-Json
    $AUTH_TOKEN = $loginData.token

    Print-Result $true "Login exitoso"
} catch {
    Print-Result $false "Error al iniciar sesión"
    Write-Host "  Error: $($_.Exception.Message)"
}

# Test 3: Obtener todos los negocios
Write-Host "`n3. Obteniendo todos los negocios..." -ForegroundColor Yellow

try {
    $businessesResponse = Invoke-WebRequest -Uri "$API_URL/api/businesses" `
        -Method GET `
        -Headers @{"Content-Type"="application/json"} `
        -ErrorAction Stop

    $businesses = $businessesResponse.Content | ConvertFrom-Json
    $businessCount = $businesses.Count

    Print-Result $true "Negocios obtenidos: $businessCount"
} catch {
    Print-Result $false "Error al obtener negocios"
    Write-Host "  Error: $($_.Exception.Message)"
}

# Test 4: Crear negocio
Write-Host "`n4. Creando nuevo negocio..." -ForegroundColor Yellow

$createBusinessBody = @{
    name = "Test Restaurant $TIMESTAMP"
    category = "Restaurante"
    district = "Miraflores"
    address = "Av. Larco 1234"
    description = "Delicious food"
    phone = "+51 1 234 5678"
    website = "https://test-restaurant.com"
    rating = 4.5
    lat = -12.1123
    lng = -77.0435
    imageUrl = "https://picsum.photos/400/300"
} | ConvertTo-Json

try {
    $createBusinessResponse = Invoke-WebRequest -Uri "$API_URL/api/businesses" `
        -Method POST `
        -Headers @{
            "Content-Type"="application/json"
            "Authorization"="Bearer $AUTH_TOKEN"
        } `
        -Body $createBusinessBody `
        -ErrorAction Stop

    $businessData = $createBusinessResponse.Content | ConvertFrom-Json
    $BUSINESS_ID = $businessData.id

    Print-Result $true "Negocio creado: ID $BUSINESS_ID"
} catch {
    Print-Result $false "Error al crear negocio"
    Write-Host "  Error: $($_.Exception.Message)"
}

# Test 5: Obtener negocios del usuario
Write-Host "`n5. Obteniendo negocios del usuario..." -ForegroundColor Yellow

try {
    $userBusinessesResponse = Invoke-WebRequest -Uri "$API_URL/api/businesses/me" `
        -Method GET `
        -Headers @{
            "Authorization"="Bearer $AUTH_TOKEN"
        } `
        -ErrorAction Stop

    $userBusinesses = $userBusinessesResponse.Content | ConvertFrom-Json
    $userBusinessCount = $userBusinesses.Count

    Print-Result $true "Negocios del usuario: $userBusinessCount"
} catch {
    Print-Result $false "Error al obtener negocios del usuario"
    Write-Host "  Error: $($_.Exception.Message)"
}

# Test 6: Logout
Write-Host "`n6. Cerrando sesión..." -ForegroundColor Yellow

try {
    $logoutResponse = Invoke-WebRequest -Uri "$API_URL/api/auth/logout" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -ErrorAction Stop

    Print-Result $true "Logout exitoso"
} catch {
    Print-Result $false "Error al cerrar sesión"
    Write-Host "  Error: $($_.Exception.Message)"
}

# Resumen
Write-Host "`n================================" -ForegroundColor Green
Write-Host "✓ Pruebas completadas exitosamente" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resumen:"
Write-Host "  - Usuario registrado: $TEST_EMAIL"
Write-Host "  - Usuario ID: $USER_ID"
Write-Host "  - Negocio creado: ID $BUSINESS_ID"
Write-Host "  - Negocios del usuario: $userBusinessCount"
Write-Host ""
