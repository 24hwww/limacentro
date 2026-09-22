import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza una URL de usuario a http(s). Añade https:// si falta el esquema
 * y devuelve null para esquemas peligrosos (javascript:, data:, etc.) o
 * entradas que no son URL válidas.
 */
export function safeHttpUrl(value?: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

/**
 * Serializa JSON para embeber dentro de <script type="application/ld+json">.
 * Escapa `<` para que `</script>` en datos de usuario no rompa el tag
 * (prevención de XSS almacenado).
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
