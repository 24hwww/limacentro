import { createFileRoute } from '@tanstack/react-router'
import { getSessionUser } from '@/lib/session'

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request)
        if (!user) {
          return Response.json({ user: null }, { status: 401 })
        }
        return Response.json({ user })
      },
    },
  },
})
