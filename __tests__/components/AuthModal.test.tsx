import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AuthModal', () => {
  const mockLogin = jest.fn();
  const mockRegister = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  });

  it('should render login form by default', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument();
  });

  it('should render registration form when toggled', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const toggleButton = screen.getByText('Registrarse');
    await userEvent.click(toggleButton);

    expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  it('should handle login form submission', async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle registration form submission', async () => {
    mockRegister.mockResolvedValue(undefined);

    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    // Switch to registration
    const toggleButton = screen.getByText('Registrarse');
    await userEvent.click(toggleButton);

    const nameInput = screen.getByLabelText('Nombre');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Registrarse' });

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should display error message when login fails', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should show loading state when submitting', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    // Mock login to take some time
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    await userEvent.click(submitButton);

    // Check for loading state
    expect(screen.getByText('Procesando...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should close when close button is clicked', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Cerrar');
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should clear form fields when toggling between login and register', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');

    const toggleButton = screen.getByText('Registrarse');
    await userEvent.click(toggleButton);

    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
  });

  it('should not render when isOpen is false', () => {
    render(<AuthModal isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByText('Iniciar Sesión')).not.toBeInTheDocument();
  });
});
