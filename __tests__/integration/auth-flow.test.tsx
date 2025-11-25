import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import HomePage from '@/pages/index';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/services/api';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock API functions
jest.mock('@/services/api', () => ({
  getAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock the mockDatabase service
jest.mock('@/services/mockDatabase', () => ({
  getBusinesses: jest.fn(() => []),
  addBusiness: jest.fn(),
  getCurrentUser: jest.fn(() => null),
  logoutMock: jest.fn(),
}));

// Mock dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => () => <div>Map Component</div>,
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthToken as jest.Mock).mockReturnValue(null);
    mockUseRouter.mockReturnValue({
      push: mockPush,
      pathname: '/',
      query: {},
      asPath: '/',
      isLocaleDomain: false,
      isReady: true,
      route: '/',
      basePath: '',
      isFallback: false,
      isPreview: false,
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      beforePopState: jest.fn(),
      prefetch: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    });
  });

  it('should show login button when user is not authenticated', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Ingresar con Google')).toBeInTheDocument();
    });
  });

  it('should show user info and logout button when authenticated', async () => {
    (getAuthToken as jest.Mock).mockReturnValue('test-token');
    
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    // Mock the getCurrentUser to return authenticated user
    jest.doMock('@/services/mockDatabase', () => ({
      getBusinesses: jest.fn(() => []),
      addBusiness: jest.fn(),
      getCurrentUser: jest.fn(() => mockUser),
      logoutMock: jest.fn(),
    }));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByLabelText('Cerrar sesión')).toBeInTheDocument();
    });
  });

  it('should handle Google sign-in button click', async () => {
    render(<HomePage />);

    const googleButton = screen.getByText('Ingresar con Google');
    await userEvent.click(googleButton);

    // The button should trigger signIn('google') from next-auth
    // This is tested in the GoogleSignInButton component tests
  });

  it('should show registration prompt when user is not logged in', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Ingresar con Google')).toBeInTheDocument();
    });
  });

  it('should show business registration button when user is logged in', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    jest.doMock('@/services/mockDatabase', () => ({
      getBusinesses: jest.fn(() => []),
      addBusiness: jest.fn(),
      getCurrentUser: jest.fn(() => mockUser),
      logoutMock: jest.fn(),
    }));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('¿Tienes un negocio?')).toBeInTheDocument();
      expect(screen.getByText('Registrar Gratis')).toBeInTheDocument();
    });
  });

  it('should handle logout correctly', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    const mockLogout = jest.fn();

    jest.doMock('@/services/mockDatabase', () => ({
      getBusinesses: jest.fn(() => []),
      addBusiness: jest.fn(),
      getCurrentUser: jest.fn(() => mockUser),
      logoutMock: mockLogout,
    }));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const logoutButton = screen.getByLabelText('Cerrar sesión');
    await userEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should persist authentication state across page reloads', async () => {
    // Simulate existing token in localStorage
    (getAuthToken as jest.Mock).mockReturnValue('existing-token');

    render(<HomePage />);

    // The app should check for existing token on mount
    expect(getAuthToken).toHaveBeenCalled();
  });

  it('should clear authentication data on logout', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    const mockLogout = jest.fn();

    jest.doMock('@/services/mockDatabase', () => ({
      getBusinesses: jest.fn(() => []),
      addBusiness: jest.fn(),
      getCurrentUser: jest.fn(() => mockUser),
      logoutMock: mockLogout,
    }));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const logoutButton = screen.getByLabelText('Cerrar sesión');
    await userEvent.click(logoutButton);

    // After logout, the app should show login button again
    await waitFor(() => {
      expect(screen.getByText('Ingresar con Google')).toBeInTheDocument();
    });
  });
});
