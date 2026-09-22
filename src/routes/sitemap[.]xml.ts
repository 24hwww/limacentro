import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/lib/db'

const DEFAULT_BASE_URL = 'https://limacentro.com'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = process.env.SITE_URL || DEFAULT_BASE_URL

        const staticUrls = ['/', '/quienes-somos', '/politicas-de-privacidad']

        const businesses = await db.business.findMany({
          select: { id: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 5000,
        })

        const urls = [
          ...staticUrls.map((path) => ({
            loc: `${baseUrl}${path}`,
            lastmod: new Date().toISOString(),
            changefreq: path === '/' ? 'daily' : 'monthly',
            priority: path === '/' ? '1.0' : '0.6',
          })),
          ...businesses.map((business) => ({
            loc: `${baseUrl}/negocio/${business.id}`,
            lastmod: business.updatedAt.toISOString(),
            changefreq: 'weekly',
            priority: '0.8',
          })),
        ]

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url>
  <loc>${url.loc}</loc>
  <lastmod>${url.lastmod}</lastmod>
  <changefreq>${url.changefreq}</changefreq>
  <priority>${url.priority}</priority>
</url>`,
  )
  .join('\n')}
</urlset>`

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
