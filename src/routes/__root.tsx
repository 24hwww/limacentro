import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { AuthProvider } from '@/contexts/AuthContext'
import { GaPageTracker } from '@/components/GoogleAnalytics'

import appCss from '../styles.css?url'

const GA_ID = import.meta.env.VITE_GA_ID || ''

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://accounts.google.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://tiles.openfreemap.org https://nominatim.openstreetmap.org https://accounts.google.com https://oauth2.googleapis.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
  "worker-src 'self' blob:",
  "frame-src https://accounts.google.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
].join('; ')

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'LimaCentro - Guía Comercial' },
      {
        name: 'description',
        content:
          'Encuentra negocios, servicios y comercios en el centro de Lima, Perú.',
      },
      { property: 'og:site_name', content: 'LimaCentro' },
      { property: 'og:type', content: 'website' },
      {
        property: 'og:title',
        content: 'LimaCentro - Guía Comercial del Centro de Lima',
      },
      {
        property: 'og:description',
        content:
          'Directorio de negocios y servicios en el centro de Lima, Perú.',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
    scripts: GA_ID
      ? [
          {
            src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
            async: true,
          },
          {
            children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`,
          },
        ]
      : [],
  }),
  headers: () => ({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': CSP,
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <GaPageTracker gaId={GA_ID} />
        <Scripts />
      </body>
    </html>
  )
}
