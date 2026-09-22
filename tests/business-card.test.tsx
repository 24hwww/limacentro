import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BusinessCard } from '@/components/BusinessCard';
import type { Business } from '@/types';

const business: Business = {
  id: 1,
  name: 'Cevichería El Muelle',
  category: 'Restaurante',
  district: 'Miraflores',
  address: 'Av. La Mar 1234',
  description: 'El mejor ceviche',
  phone: '+51 999 888 777',
  website: 'https://elmuelle.pe',
  rating: 4.8,
  lat: -12.11,
  lng: -77.04,
};

describe('BusinessCard', () => {
  it('muestra nombre, categoría y distrito', () => {
    render(<BusinessCard business={business} onClick={vi.fn()} isActive={false} />);
    expect(screen.getByText('Cevichería El Muelle')).toBeInTheDocument();
    expect(screen.getByText('Restaurante')).toBeInTheDocument();
    expect(screen.getByText('Miraflores')).toBeInTheDocument();
  });

  it('llama onClick al hacer click', () => {
    const onClick = vi.fn();
    render(<BusinessCard business={business} onClick={onClick} isActive={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Ver detalles/i }));
    expect(onClick).toHaveBeenCalledWith(business);
  });

  it('no renderiza enlace de website peligroso', () => {
    const malicious = { ...business, website: 'javascript:alert(1)' };
    render(<BusinessCard business={malicious} onClick={vi.fn()} isActive={false} />);
    expect(screen.queryByTitle('Visitar sitio web')).not.toBeInTheDocument();
  });
});
