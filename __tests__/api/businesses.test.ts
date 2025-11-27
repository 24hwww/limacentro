/**
 * Businesses API Tests
 * 
 * Para ejecutar estos tests, necesitas:
 * 1. Base de datos Neon configurada
 * 2. Variables de entorno (.env.local)
 * 3. Servidor ejecutándose en http://localhost:3001
 * 4. Usuario autenticado
 */

describe('Businesses API Endpoints', () => {
  const API_URL = 'http://localhost:3001';
  let authToken: string;
  let businessId: number;

  const testBusiness = {
    name: 'Test Restaurant',
    category: 'Restaurante',
    district: 'Miraflores',
    address: 'Av. Larco 1234',
    description: 'Delicious food',
    phone: '+51 1 234 5678',
    website: 'https://test-restaurant.com',
    rating: 4.5,
    lat: -12.1123,
    lng: -77.0435,
    imageUrl: 'https://picsum.photos/400/300',
  };

  beforeAll(async () => {
    // Register and login to get token
    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
      }),
    });

    const data = await registerResponse.json();
    authToken = data.token;
  });

  describe('GET /api/businesses', () => {
    it('should get all businesses', async () => {
      const response = await fetch(`${API_URL}/api/businesses`);

      expect(response.status).toBe(200);
      const businesses = await response.json();
      expect(Array.isArray(businesses)).toBe(true);
    });
  });

  describe('POST /api/businesses', () => {
    it('should create a new business', async () => {
      const response = await fetch(`${API_URL}/api/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(testBusiness),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe(testBusiness.name);
      expect(data.category).toBe(testBusiness.category);
      expect(data.ownerId).toBeDefined();

      businessId = data.id;
    });

    it('should reject without authentication', async () => {
      const response = await fetch(`${API_URL}/api/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testBusiness),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('should reject missing required fields', async () => {
      const response = await fetch(`${API_URL}/api/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: 'Test' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
    });
  });

  describe('GET /api/businesses/me', () => {
    it('should get user businesses', async () => {
      const response = await fetch(`${API_URL}/api/businesses/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      const businesses = await response.json();
      expect(Array.isArray(businesses)).toBe(true);
      expect(businesses.length).toBeGreaterThan(0);
    });

    it('should reject without authentication', async () => {
      const response = await fetch(`${API_URL}/api/businesses/me`);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });
  });
});
