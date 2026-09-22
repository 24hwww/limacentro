import { describe, expect, it } from 'vitest';
import { businessInputSchema } from '@/lib/validation';

const valid = {
  name: 'Cevichería El Muelle',
  category: 'Restaurante',
  district: 'Miraflores',
  address: 'Av. La Mar 1234',
  lat: -12.1123,
  lng: -77.0435,
};

describe('businessInputSchema', () => {
  it('acepta un payload mínimo válido', () => {
    const r = businessInputSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it('rechaza campos requeridos ausentes', () => {
    expect(businessInputSchema.safeParse({}).success).toBe(false);
    expect(
      businessInputSchema.safeParse({ ...valid, name: '' }).success,
    ).toBe(false);
    expect(
      businessInputSchema.safeParse({ ...valid, address: '' }).success,
    ).toBe(false);
  });

  it('rechaza coordenadas fuera de rango', () => {
    expect(
      businessInputSchema.safeParse({ ...valid, lat: 91 }).success,
    ).toBe(false);
    expect(
      businessInputSchema.safeParse({ ...valid, lng: -181 }).success,
    ).toBe(false);
  });

  it('rechaza rating fuera de 1-5', () => {
    expect(
      businessInputSchema.safeParse({ ...valid, rating: 0 }).success,
    ).toBe(false);
    expect(
      businessInputSchema.safeParse({ ...valid, rating: 6 }).success,
    ).toBe(false);
  });

  it('normaliza website añadiendo https://', () => {
    const r = businessInputSchema.safeParse({ ...valid, website: 'mipagina.pe' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.website).toBe('https://mipagina.pe/');
  });

  it('rechaza website con esquema javascript:', () => {
    const r = businessInputSchema.safeParse({
      ...valid,
      website: 'javascript:alert(1)',
    });
    expect(r.success).toBe(false);
  });

  it('acepta campos opcionales ausentes', () => {
    const r = businessInputSchema.safeParse({
      ...valid,
      phone: undefined,
      website: undefined,
      description: undefined,
    });
    expect(r.success).toBe(true);
  });
});
