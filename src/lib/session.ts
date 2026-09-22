import { db } from './db'
import { getSessionUserId } from './auth'

export interface SessionUser {
  id: number
  email: string
  name: string
  avatarUrl: string | null
}

/**
 * Resuelve el usuario autenticado a partir de la cookie de sesión
 * del request. Uso exclusivo en handlers del servidor.
 */
export async function getSessionUser(
  request: Request,
): Promise<SessionUser | null> {
  const userId = await getSessionUserId(request)
  if (!userId) return null

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatarUrl: true },
  })
  return user
}
