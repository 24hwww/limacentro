// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { rateLimit } from '@/lib/rateLimit';

const req = (ip = '1.2.3.4') =>
  new Request('http://localhost/api/x', {
    headers: { 'x-forwarded-for': ip },
  });

describe('rateLimit', () => {
  it('permite hasta el límite y luego devuelve 429', () => {
    const ip = `10.0.${Date.now() % 255}.1`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(req(ip), { limit: 5, windowMs: 60_000 })).toBeNull();
    }
    const blocked = rateLimit(req(ip), { limit: 5, windowMs: 60_000 });
    expect(blocked?.status).toBe(429);
  });

  it('aisla contadores por IP', () => {
    const ip = `10.1.${Date.now() % 255}.2`;
    rateLimit(req(ip), { limit: 1, windowMs: 60_000 });
    expect(rateLimit(req(ip), { limit: 1, windowMs: 60_000 })?.status).toBe(429);
    expect(rateLimit(req('9.9.9.9'), { limit: 1, windowMs: 60_000 })).toBeNull();
  });

  it('expira la ventana', async () => {
    const ip = `10.2.${Date.now() % 255}.3`;
    rateLimit(req(ip), { limit: 1, windowMs: 5 });
    await new Promise((r) => setTimeout(r, 10));
    expect(rateLimit(req(ip), { limit: 1, windowMs: 5 })).toBeNull();
  });
});
