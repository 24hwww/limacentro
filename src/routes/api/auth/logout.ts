import { createFileRoute } from '@tanstack/react-router'
import { buildClearCookie } from '@/lib/auth'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async () => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': buildClearCookie(),
          },
        })
      },
    },
  },
})
