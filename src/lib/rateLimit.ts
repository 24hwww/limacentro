// Rate limiter en memoria (ventana fija). Correcto porque el servidor Bun es
// un proceso de larga duración. Si se escala a múltiples réplicas, mover a
// Redis o al proxy (nginx/Cloudflare).

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 10_000

function clientKey(request: Request, bucket: string): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local'
  return `${bucket}:${ip}`
}

export interface RateLimitOptions {
  /** Requests permitidos por ventana */
  limit: number
  /** Tamaño de la ventana en ms */
  windowMs: number
  /** Nombre del bucket (por defecto: método + ruta) */
  bucket?: string
}

/**
 * Devuelve null si la request está permitida, o un Response 429 si excede.
 */
export function rateLimit(
  request: Request,
  { limit, windowMs, bucket }: RateLimitOptions,
): Response | null {
  const now = Date.now()
  const key = clientKey(request, bucket ?? `${request.method}:${new URL(request.url).pathname}`)

  // Cap defensivo contra claves ilimitadas (IPs rotadas)
  if (buckets.size >= MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k)
    }
    if (buckets.size >= MAX_BUCKETS) return null // fail-open si el mapa está saturado
  }

  const b = buckets.get(key)
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  b.count += 1
  if (b.count <= limit) return null

  const retryAfter = Math.ceil((b.resetAt - now) / 1000)
  return Response.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )
}
