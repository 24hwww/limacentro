import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/lib/db'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        try {
          await db.$queryRaw`SELECT 1`
          return Response.json({ ok: true, db: 'connected' })
        } catch {
          return Response.json(
            { ok: false, db: 'unreachable' },
            { status: 503 },
          )
        }
      },
    },
  },
})
