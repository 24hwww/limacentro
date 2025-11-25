import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BusinessCard } from '@/components/BusinessCard';
import { Business } from '@/types';

const mockBusiness: Business = {
  id: '1',
  name: 'Test Restaurant',
  category: 'Restaurante',
  district: 'Miraflores',
  address: 'Av. Test 123',
  description: 'A great restaurant',
  phone: '+51 1 234 5678',
  website: 'https://test.com',
  rating: 4.5,
  lat: -12.1123,
  lng: -77.0435,
  imageUrl: 'https://picsum.photos/400/300',
};

describe('BusinessCard Component', () => {
  it('should render business information', () => {
    render(
      <BusinessCard
        business={mockBusiness}
        onClick={jest.fn()}
        isActive={false}
      />
    );

    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Restaurante')).toBeInTheDocument();
    expect(screen.getByText('Miraflores')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(
      <BusinessCard
        business={mockBusiness}
        onClick={handleClick}
        isActive={false}
      />
    );

    const card = screen.getByText('Test Restaurant').closest('div');
    if (card) {
      fireEvent.click(card);
    }

    expect(handleClick).toHaveBeenCalledWith(mockBusiness);
  });

  it('should display active state styling', () => {
    const { container } = render(
      <BusinessCard
        business={mockBusiness}
        onClick={jest.fn()}
        isActive={true}
      />
    );

    const card = container.querySelector('[class*="border"]');
    expect(card).toBeInTheDocument();
  });

  it('should display rating', () => {
    render(
      <BusinessCard
        business={mockBusiness}
        onClick={jest.fn()}
        isActive={false}
      />
    );

    expect(screen.getByText(/4.5/)).toBeInTheDocument();
  });
});
