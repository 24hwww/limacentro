import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BusinessForm } from '@/components/BusinessForm';
import { Business } from '@/types';

// Mock the geocoding service
jest.mock('@/services/geocodingService', () => ({
  geocodeAddress: jest.fn().mockResolvedValue({ lat: -12.1123, lng: -77.0435 }),
}));

describe('BusinessForm Component', () => {
  const mockOnCancel = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(
      <BusinessForm onCancel={mockOnCancel} onSave={mockOnSave} />
    );

    expect(screen.getByLabelText(/Nombre del Negocio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Distrito/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sitio Web/i)).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <BusinessForm onCancel={mockOnCancel} onSave={mockOnSave} />
    );

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should update form fields on input change', async () => {
    const user = userEvent.setup();
    render(
      <BusinessForm onCancel={mockOnCancel} onSave={mockOnSave} />
    );

    const nameInput = screen.getByLabelText(/Nombre del Negocio/i) as HTMLInputElement;
    await user.type(nameInput, 'Test Business');

    expect(nameInput.value).toBe('Test Business');
  });

  it('should show error when trying to submit without location', async () => {
    const user = userEvent.setup();
    render(
      <BusinessForm onCancel={mockOnCancel} onSave={mockOnSave} />
    );

    const nameInput = screen.getByLabelText(/Nombre del Negocio/i);
    const descriptionInput = screen.getByLabelText(/Descripción/i);
    const phoneInput = screen.getByLabelText(/Teléfono/i);
    const websiteInput = screen.getByLabelText(/Sitio Web/i);

    await user.type(nameInput, 'Test Business');
    await user.type(descriptionInput, 'Test description');
    await user.type(phoneInput, '+51 1 234 5678');
    await user.type(websiteInput, 'https://test.com');

    const submitButton = screen.getByText('Guardar Negocio');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Debes validar la ubicación en el mapa/i)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should show error when required fields are empty', async () => {
    const user = userEvent.setup();
    render(
      <BusinessForm onCancel={mockOnCancel} onSave={mockOnSave} />
    );

    const submitButton = screen.getByText('Guardar Negocio');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Debes validar la ubicación en el mapa/i)).toBeInTheDocument();
    });
  });
});
