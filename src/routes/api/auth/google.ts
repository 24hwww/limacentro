import { createFileRoute } from '@tanstack/react-router'
import { randomBytes } from 'node:crypto'
import {
  buildSessionCookie,
  isSecureRequest,
  signSessionToken,
  verifyGoogleCredential,
} from '@/lib/auth'
import { db } from '@/lib/db'

export const Route = createFileRoute('/api/auth/google')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let credential: string | undefined
        try {
          const body = await request.json()
          credential = body?.credential
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
        }
        if (!credential || typeof credential !== 'string') {
          return Response.json({ error: 'Missing credential' }, { status: 400 })
        }

        const profile = await verifyGoogleCredential(credential)
        if (!profile) {
          return Response.json(
            { error: 'Invalid Google credential' },
            { status: 401 },
          )
        }

        const safeName = profile.name || profile.email.split('@')[0] || 'Usuario'
        const oauthPasswordPlaceholder = `oauth:${randomBytes(24).toString('hex')}`

        const user = await db.user.upsert({
          where: { email: profile.email },
          update: {
            name: safeName,
            avatarUrl: profile.image || undefined,
          },
          create: {
            email: profile.email,
            name: safeName,
            avatarUrl: profile.image || undefined,
            passwordHash: oauthPasswordPlaceholder,
          },
        })

        const token = await signSessionToken(user.id)

        return new Response(
          JSON.stringify({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              avatarUrl: user.avatarUrl,
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': buildSessionCookie(token, isSecureRequest(request)),
            },
          },
        )
      },
    },
  },
})
