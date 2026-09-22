import { createFileRoute } from '@tanstack/react-router'
import {
  createBusiness,
  getAllBusinesses,
} from '@/services/businessService'
import { getSessionUser } from '@/lib/session'
import { rateLimit } from '@/lib/rateLimit'
import { businessInputSchema } from '@/lib/validation'

export const Route = createFileRoute('/api/businesses/')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const businesses = await getAllBusinesses()
          return Response.json(businesses)
        } catch (error) {
          console.error('Get businesses error:', error)
          return Response.json(
            { error: 'Failed to fetch businesses' },
            { status: 500 },
          )
        }
      },

      POST: async ({ request }) => {
        const limited = rateLimit(request, { limit: 30, windowMs: 60_000 })
        if (limited) return limited

        const user = await getSessionUser(request)
        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        const parsed = businessInputSchema.safeParse(body)
        if (!parsed.success) {
          return Response.json(
            {
              error: 'Validation failed',
              details: parsed.error.issues.map((i) => ({
                path: i.path.join('.'),
                message: i.message,
              })),
            },
            { status: 400 },
          )
        }

        try {
          const business = await createBusiness(user.id, parsed.data)
          return Response.json(business, { status: 201 })
        } catch (error) {
          console.error('Create business error:', error)
          return Response.json(
            { error: 'Failed to create business' },
            { status: 500 },
          )
        }
      },
    },
  },
})
