/**
 * API Client Helper
 * Centraliza todas las llamadas HTTP a la API (mismo origen, cookies incluidas).
 */

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function apiCall(endpoint: string, options: ApiOptions = {}): Promise<any> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data;
}

/** Negocios */
export function getBusinesses() {
  return apiCall('/api/businesses', { method: 'GET' });
}

export function createBusiness(businessData: unknown) {
  return apiCall('/api/businesses', {
    method: 'POST',
    body: JSON.stringify(businessData),
  });
}

export function getMyBusinesses() {
  return apiCall('/api/businesses/me', { method: 'GET' });
}

export function updateBusiness(businessId: number | string, updates: unknown) {
  return apiCall(`/api/businesses/${businessId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export function deleteBusiness(businessId: number | string) {
  return apiCall(`/api/businesses/${businessId}`, { method: 'DELETE' });
}

/** Auth */
export function getSession() {
  return apiCall('/api/auth/me', { method: 'GET' });
}

export function logout() {
  return apiCall('/api/auth/logout', { method: 'POST' });
}
