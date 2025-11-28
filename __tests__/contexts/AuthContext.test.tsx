import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/services/api';

// Mock the API functions
jest.mock('@/services/api', () => ({
  getAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const TestComponent = () => {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <button onClick={() => login('test@example.com', 'password123').catch(() => {})}>
        Login
      </button>
      <button onClick={() => register('test@example.com', 'password123', 'Test User').catch(() => {})}>
        Register
      </button>
      <button onClick={() => logout().catch(() => {})}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthToken as jest.Mock).mockReturnValue(null);
  });

  it('should initialize with no user and not authenticated', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('should load existing token from localStorage on mount', async () => {
    (getAuthToken as jest.Mock).mockReturnValue('existing-token');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getAuthToken).toHaveBeenCalled();
    });
  });

  it('should login successfully', async () => {
    const mockResponse = {
      token: 'test-token',
      user: { id: 1, email: 'test@example.com', name: 'Test User' }
    };
    
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(setAuthToken).toHaveBeenCalledWith('test-token');
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
  });

  it('should handle login error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    // Mock console.error to avoid error output in test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    expect(setAuthToken).not.toHaveBeenCalled();
    
    // Restore console
    consoleSpy.mockRestore();
  });

  it('should register successfully', async () => {
    const mockResponse = {
      token: 'test-token',
      user: { id: 1, email: 'test@example.com', name: 'Test User' }
    };
    
    // Clear previous mocks
    (fetch as jest.Mock).mockClear();
    
    // Setup the mock to return success for register
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const registerButton = screen.getByText('Register');
    
    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(setAuthToken).toHaveBeenCalledWith('test-token');
    expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test User' }),
    });
  });

  it('should logout successfully', async () => {
    // First login
    const mockResponse = {
      token: 'test-token',
      user: { id: 1, email: 'test@example.com', name: 'Test User' }
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    // Then logout
    const logoutButton = screen.getByText('Logout');
    
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    expect(clearAuthToken).toHaveBeenCalled();
  });
});
