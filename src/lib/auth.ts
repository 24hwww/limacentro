import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose'

export const SESSION_COOKIE = 'lc_session'
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 días

const DEV_SECRET = 'dev-only-insecure-secret-change-me'

function sessionSecret(): Uint8Array {
  const s =
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET must be set in production')
    }
    return new TextEncoder().encode(DEV_SECRET)
  }
  return new TextEncoder().encode(s)
}

// Google publica sus claves de firma en este JWKS; jose las cachea y rota solo.
const googleJWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
)

export interface GoogleProfile {
  email: string
  name: string | null
  image: string | null
}

/**
 * Verifica un ID token emitido por Google Identity Services.
 * Devuelve null si la firma, audiencia o issuer no son válidos.
 */
export async function verifyGoogleCredential(
  credential: string,
): Promise<GoogleProfile | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not set')

  try {
    const { payload } = await jwtVerify(credential, googleJWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
    })
    if (typeof payload.email !== 'string' || !payload.email) return null
    if (payload.email_verified === false) return null
    return {
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : null,
      image: typeof payload.picture === 'string' ? payload.picture : null,
    }
  } catch {
    return null
  }
}

export async function signSessionToken(userId: number): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionSecret())
}

export async function verifySessionToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret())
    const id = Number(payload.sub)
    return Number.isInteger(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

export function buildSessionCookie(token: string, secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function buildClearCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export function getSessionUserIdFromCookieHeader(
  cookieHeader: string | null,
): Promise<number | null> {
  if (!cookieHeader) return Promise.resolve(null)
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`),
  )
  if (!match) return Promise.resolve(null)
  return verifySessionToken(decodeURIComponent(match[1]))
}

export function getSessionUserId(request: Request): Promise<number | null> {
  return getSessionUserIdFromCookieHeader(request.headers.get('cookie'))
}

export function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === 'https:'
}
