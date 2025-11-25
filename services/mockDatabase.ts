import { Business, User } from '../types';
import { INITIAL_BUSINESSES } from '../constants';

const BUSINESS_STORAGE_KEY = 'limacentro_businesses';
const USER_STORAGE_KEY = 'limacentro_user';

export const getBusinesses = (): Business[] => {
  const stored = localStorage.getItem(BUSINESS_STORAGE_KEY);
  if (!stored) {
    // Seed initial data
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
    return INITIAL_BUSINESSES;
  }
  return JSON.parse(stored);
};

export const addBusiness = (business: Business): Business[] => {
  const current = getBusinesses();
  const updated = [business, ...current];
  localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Simulate Auth
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const loginMock = (): User => {
  const mockUser: User = {
    id: 'user_123',
    name: 'Usuario Demo',
    email: 'usuario@limacentro.com',
    avatarUrl: 'https://picsum.photos/seed/user/100/100'
  };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
  return mockUser;
};

export const logoutMock = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
};
