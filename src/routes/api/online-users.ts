import { createFileRoute } from '@tanstack/react-router'

// Almacenamiento en memoria de usuarios activos.
// Funciona porque Bun corre un proceso de larga duración (a diferencia de
// funciones serverless). Si escalaras a múltiples réplicas, mover a Redis.
const activeUsers = new Map<string, number>()

const EXPIRATION_TIME = 2 * 60 * 1000
const MAX_TRACKED = 50_000

function cleanupInactiveUsers() {
  const now = Date.now()
  for (const [userId, lastSeen] of activeUsers.entries()) {
    if (now - lastSeen > EXPIRATION_TIME) {
      activeUsers.delete(userId)
    }
  }
}

export const Route = createFileRoute('/api/online-users')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId =
          request.headers.get('x-user-id') ||
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          `anon-${Math.random().toString(36).slice(2, 11)}`

        // Cap defensivo: evita crecimiento ilimitado del Map con IDs falsificados
        if (activeUsers.size >= MAX_TRACKED && !activeUsers.has(userId)) {
          cleanupInactiveUsers()
          if (activeUsers.size >= MAX_TRACKED) {
            return Response.json({ success: true, onlineUsers: activeUsers.size })
          }
        }

        activeUsers.set(userId.slice(0, 128), Date.now())
        cleanupInactiveUsers()

        return Response.json({ success: true, onlineUsers: activeUsers.size })
      },

      GET: async () => {
        cleanupInactiveUsers()
        return Response.json({ onlineUsers: activeUsers.size })
      },
    },
  },
})
