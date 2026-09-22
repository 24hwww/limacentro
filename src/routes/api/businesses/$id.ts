import { createFileRoute } from '@tanstack/react-router'
import { deleteBusiness, updateBusiness } from '@/services/businessService'
import { getSessionUser } from '@/lib/session'
import { rateLimit } from '@/lib/rateLimit'
import { businessInputSchema } from '@/lib/validation'

function parseId(raw: string | undefined): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export const Route = createFileRoute('/api/businesses/$id')({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        const limited = rateLimit(request, { limit: 30, windowMs: 60_000 })
        if (limited) return limited

        const user = await getSessionUser(request)
        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = parseId(params.id)
        if (!id) {
          return Response.json({ error: 'Invalid business id' }, { status: 400 })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        const parsed = businessInputSchema.partial().safeParse(body)
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
          const business = await updateBusiness(id, user.id, parsed.data)
          return Response.json(business)
        } catch (error: any) {
          if (error?.message === 'Unauthorized') {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
          }
          console.error('Update business error:', error)
          return Response.json(
            { error: 'Failed to update business' },
            { status: 500 },
          )
        }
      },

      DELETE: async ({ request, params }) => {
        const limited = rateLimit(request, { limit: 30, windowMs: 60_000 })
        if (limited) return limited

        const user = await getSessionUser(request)
        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = parseId(params.id)
        if (!id) {
          return Response.json({ error: 'Invalid business id' }, { status: 400 })
        }

        try {
          await deleteBusiness(id, user.id)
          return Response.json({ success: true })
        } catch (error: any) {
          if (error?.message === 'Unauthorized') {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
          }
          console.error('Delete business error:', error)
          return Response.json(
            { error: 'Failed to delete business' },
            { status: 500 },
          )
        }
      },
    },
  },
})
