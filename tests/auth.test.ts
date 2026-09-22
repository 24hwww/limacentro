// @vitest-environment node — jose verifica Uint8Array por realm; jsdom rompe instanceof
import { describe, expect, it } from 'vitest';
import {
  buildClearCookie,
  buildSessionCookie,
  getSessionUserIdFromCookieHeader,
  SESSION_COOKIE,
  signSessionToken,
  verifySessionToken,
} from '@/lib/auth';

describe('session tokens', () => {
  it('firma y verifica un token de sesión', async () => {
    const token = await signSessionToken(42);
    expect(typeof token).toBe('string');
    expect(await verifySessionToken(token)).toBe(42);
  });

  it('rechaza tokens inválidos', async () => {
    expect(await verifySessionToken('token-falso')).toBeNull();
    expect(await verifySessionToken('')).toBeNull();
  });

  it('rechaza tokens firmados con otro secreto', async () => {
    const { SignJWT } = await import('jose');
    const other = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('1')
      .sign(new TextEncoder().encode('otro-secreto'));
    expect(await verifySessionToken(other)).toBeNull();
  });
});

describe('cookies de sesión', () => {
  it('construye cookie httpOnly con SameSite=Lax', () => {
    const cookie = buildSessionCookie('abc', false);
    expect(cookie).toContain(`${SESSION_COOKIE}=abc`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).not.toContain('Secure');
  });

  it('añade Secure cuando el request es https', () => {
    expect(buildSessionCookie('abc', true)).toContain('Secure');
  });

  it('clear cookie expira la sesión', () => {
    expect(buildClearCookie()).toContain('Max-Age=0');
  });

  it('extrae userId desde el header Cookie', async () => {
    const token = await signSessionToken(7);
    const header = `otra=1; ${SESSION_COOKIE}=${token}`;
    expect(await getSessionUserIdFromCookieHeader(header)).toBe(7);
  });

  it('devuelve null sin cookie de sesión', async () => {
    expect(await getSessionUserIdFromCookieHeader('otra=1')).toBeNull();
    expect(await getSessionUserIdFromCookieHeader(null)).toBeNull();
  });
});
