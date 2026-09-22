import { PrismaClient } from '@/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaPg } from '@prisma/adapter-pg'
import { neonConfig } from '@neondatabase/serverless'

// Bun ya provee WebSocket nativo; Neon lo necesita para conexiones pooled.
if (typeof WebSocket !== 'undefined' && !neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = WebSocket as unknown as typeof neonConfig.webSocketConstructor
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

// Postgres local (dev/test) usa el adapter pg estándar; Neon serverless solo en prod.
const isLocalPg = /:\/\/[^@/]*@?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/.test(connectionString)
const adapter = isLocalPg ? new PrismaPg({ connectionString }) : new PrismaNeon({ connectionString })

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

export default db
