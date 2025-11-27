/**
 * API Client Helper
 * Centraliza todas las llamadas HTTP a la API
 */

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

const API_URL = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_URL || ''
  : process.env.API_URL || '';

/**
 * Realizar una llamada a la API
 */
export async function apiCall(
  endpoint: string,
  options: ApiOptions = {}
): Promise<any> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Realizar una llamada a la API con autenticación
 */
export async function apiCallWithAuth(
  endpoint: string,
  token: string,
  options: ApiOptions = {}
): Promise<any> {
  return apiCall(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

/**
 * Registrar un nuevo usuario
 */
export async function register(
  email: string,
  password: string,
  name: string
) {
  return apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

/**
 * Iniciar sesión
 */
export async function login(email: string, password: string) {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Cerrar sesión
 */
export async function logout() {
  return apiCall('/api/auth/logout', {
    method: 'POST',
  });
}

/**
 * Obtener todos los negocios
 */
export async function getBusinesses() {
  return apiCall('/api/businesses', {
    method: 'GET',
  });
}

/**
 * Crear un nuevo negocio
 */
export async function createBusiness(token: string, businessData: any) {
  return apiCallWithAuth('/api/businesses', token, {
    method: 'POST',
    body: JSON.stringify(businessData),
  });
}

/**
 * Obtener negocios de un usuario
 */
export async function getUserBusinesses(token: string) {
  return apiCallWithAuth('/api/businesses/me', token, {
    method: 'GET',
  });
}

/**
 * Actualizar un negocio
 */
export async function updateBusiness(
  token: string,
  businessId: number,
  updates: any
) {
  return apiCallWithAuth(`/api/businesses/${businessId}`, token, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Eliminar un negocio
 */
export async function deleteBusiness(token: string, businessId: number) {
  return apiCallWithAuth(`/api/businesses/${businessId}`, token, {
    method: 'DELETE',
  });
}

/**
 * Obtener token del localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Guardar token en localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

/**
 * Eliminar token del localStorage
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}
