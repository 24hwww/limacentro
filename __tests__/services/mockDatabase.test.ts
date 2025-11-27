import { getBusinesses, addBusiness, getCurrentUser, loginMock, logoutMock } from '@/services/mockDatabase';
import { Business, User } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('mockDatabase Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getBusinesses', () => {
    it('should return initial businesses if localStorage is empty', () => {
      const businesses = getBusinesses();
      expect(businesses).toBeDefined();
      expect(Array.isArray(businesses)).toBe(true);
      expect(businesses.length).toBeGreaterThan(0);
    });

    it('should return stored businesses from localStorage', () => {
      const mockBusiness: Business = {
        id: 'test-1',
        name: 'Test Business',
        category: 'Restaurante',
        district: 'Miraflores',
        address: 'Av. Test 123',
        description: 'Test description',
        phone: '+51 1 234 5678',
        website: 'https://test.com',
        rating: 4.5,
        lat: -12.1123,
        lng: -77.0435,
      };

      const businesses = [mockBusiness];
      localStorage.setItem('limacentro_businesses', JSON.stringify(businesses));

      const result = getBusinesses();
      expect(result).toEqual(businesses);
    });
  });

  describe('addBusiness', () => {
    it('should add a new business to localStorage', () => {
      const newBusiness: Business = {
        id: 'test-2',
        name: 'New Business',
        category: 'Hotel',
        district: 'Lima',
        address: 'Jr. Test 456',
        description: 'New business description',
        phone: '+51 1 987 6543',
        website: 'https://newbusiness.com',
        rating: 4.8,
        lat: -12.0450,
        lng: -77.0310,
      };

      const result = addBusiness(newBusiness);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(newBusiness);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null if no user is logged in', () => {
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return stored user from localStorage', () => {
      const mockUser: User = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      localStorage.setItem('limacentro_user', JSON.stringify(mockUser));
      const result = getCurrentUser();
      expect(result).toEqual(mockUser);
    });
  });

  describe('loginMock', () => {
    it('should create and store a mock user', () => {
      const user = loginMock();
      expect(user).toBeDefined();
      expect(user.id).toBe('user_123');
      expect(user.name).toBe('Usuario Demo');
      expect(user.email).toBe('usuario@limacentro.com');
    });

    it('should persist user to localStorage', () => {
      loginMock();
      const storedUser = getCurrentUser();
      expect(storedUser).toBeDefined();
      expect(storedUser?.id).toBe('user_123');
    });
  });

  describe('logoutMock', () => {
    it('should remove user from localStorage', () => {
      loginMock();
      expect(getCurrentUser()).not.toBeNull();

      logoutMock();
      expect(getCurrentUser()).toBeNull();
    });
  });
});
