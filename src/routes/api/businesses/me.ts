import { createFileRoute } from '@tanstack/react-router'
import { getBusinessesByUserId } from '@/services/businessService'
import { getSessionUser } from '@/lib/session'

export const Route = createFileRoute('/api/businesses/me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request)
        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const businesses = await getBusinessesByUserId(user.id)
          return Response.json(businesses)
        } catch (error) {
          console.error('Get user businesses error:', error)
          return Response.json(
            { error: 'Failed to fetch businesses' },
            { status: 500 },
          )
        }
      },
    },
  },
})
