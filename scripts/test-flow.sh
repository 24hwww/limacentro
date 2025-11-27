#!/bin/bash

# Test Flow Script - Lima Centro
# Este script prueba el flujo completo de la aplicación

API_URL="http://localhost:3001"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@example.com"
TEST_PASSWORD="password123"
TEST_NAME="Test User ${TIMESTAMP}"

echo "🚀 Iniciando pruebas de flujo..."
echo "================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir resultados
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ $2${NC}"
  else
    echo -e "${RED}✗ $2${NC}"
  fi
}

# Test 1: Registrar usuario
echo -e "\n${YELLOW}1. Registrando usuario...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"$TEST_NAME\"
  }")

AUTH_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$AUTH_TOKEN" ]; then
  print_result 0 "Usuario registrado: $TEST_EMAIL"
  echo "  Token: ${AUTH_TOKEN:0:20}..."
  echo "  User ID: $USER_ID"
else
  print_result 1 "Error al registrar usuario"
  echo "  Respuesta: $REGISTER_RESPONSE"
  exit 1
fi

# Test 2: Login
echo -e "\n${YELLOW}2. Iniciando sesión...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$LOGIN_TOKEN" ]; then
  print_result 0 "Login exitoso"
  AUTH_TOKEN=$LOGIN_TOKEN
else
  print_result 1 "Error al iniciar sesión"
  echo "  Respuesta: $LOGIN_RESPONSE"
fi

# Test 3: Obtener todos los negocios
echo -e "\n${YELLOW}3. Obteniendo todos los negocios...${NC}"
BUSINESSES_RESPONSE=$(curl -s -X GET "$API_URL/api/businesses" \
  -H "Content-Type: application/json")

BUSINESS_COUNT=$(echo $BUSINESSES_RESPONSE | grep -o '"id"' | wc -l)

if [ $BUSINESS_COUNT -ge 0 ]; then
  print_result 0 "Negocios obtenidos: $BUSINESS_COUNT"
else
  print_result 1 "Error al obtener negocios"
fi

# Test 4: Crear negocio
echo -e "\n${YELLOW}4. Creando nuevo negocio...${NC}"
CREATE_BUSINESS_RESPONSE=$(curl -s -X POST "$API_URL/api/businesses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"name\": \"Test Restaurant ${TIMESTAMP}\",
    \"category\": \"Restaurante\",
    \"district\": \"Miraflores\",
    \"address\": \"Av. Larco 1234\",
    \"description\": \"Delicious food\",
    \"phone\": \"+51 1 234 5678\",
    \"website\": \"https://test-restaurant.com\",
    \"rating\": 4.5,
    \"lat\": -12.1123,
    \"lng\": -77.0435,
    \"imageUrl\": \"https://picsum.photos/400/300\"
  }")

BUSINESS_ID=$(echo $CREATE_BUSINESS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$BUSINESS_ID" ]; then
  print_result 0 "Negocio creado: ID $BUSINESS_ID"
else
  print_result 1 "Error al crear negocio"
  echo "  Respuesta: $CREATE_BUSINESS_RESPONSE"
fi

# Test 5: Obtener negocios del usuario
echo -e "\n${YELLOW}5. Obteniendo negocios del usuario...${NC}"
USER_BUSINESSES_RESPONSE=$(curl -s -X GET "$API_URL/api/businesses/me" \
  -H "Authorization: Bearer $AUTH_TOKEN")

USER_BUSINESS_COUNT=$(echo $USER_BUSINESSES_RESPONSE | grep -o '"id"' | wc -l)

if [ $USER_BUSINESS_COUNT -gt 0 ]; then
  print_result 0 "Negocios del usuario: $USER_BUSINESS_COUNT"
else
  print_result 1 "Error al obtener negocios del usuario"
fi

# Test 6: Logout
echo -e "\n${YELLOW}6. Cerrando sesión...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/logout" \
  -H "Content-Type: application/json")

if echo $LOGOUT_RESPONSE | grep -q "successfully"; then
  print_result 0 "Logout exitoso"
else
  print_result 1 "Error al cerrar sesión"
fi

# Resumen
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ Pruebas completadas exitosamente${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Resumen:"
echo "  - Usuario registrado: $TEST_EMAIL"
echo "  - Usuario ID: $USER_ID"
echo "  - Negocio creado: ID $BUSINESS_ID"
echo "  - Negocios del usuario: $USER_BUSINESS_COUNT"
echo ""
