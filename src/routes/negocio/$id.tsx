import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { safeHttpUrl, safeJsonLd } from '@/lib/utils'

// VITE_* se inyecta en build y funciona tanto en SSR como en el cliente
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://limacentro.com'
const DEFAULT_IMAGE = 'https://picsum.photos/seed/limacentro/1200/630'

const getBusiness = createServerFn({ method: 'GET' })
  .validator((id: unknown) => {
    const n = Number(id)
    if (!Number.isInteger(n) || n <= 0) throw notFound()
    return n
  })
  .handler(async ({ data: id }) => {
    const b = await db.business.findUnique({ where: { id } })
    if (!b) return null
    return {
      id: b.id,
      name: b.name,
      category: b.category,
      district: b.district,
      address: b.address,
      description: b.description || 'Negocio registrado en LimaCentro.',
      phone: b.phone,
      website: safeHttpUrl(b.website),
      rating: b.rating ? Number(b.rating) : null,
      lat: Number(b.lat),
      lng: Number(b.lng),
      imageUrl: safeHttpUrl(b.imageUrl),
      updatedAt: b.updatedAt.toISOString(),
    }
  })

type BusinessData = NonNullable<Awaited<ReturnType<typeof getBusiness>>>

export const Route = createFileRoute('/negocio/$id')({
  loader: async ({ params }) => {
    const business = await getBusiness({ data: params.id })
    if (!business) throw notFound()
    return business
  },
  head: ({ loaderData: b }) => {
    if (!b) return {}
    const canonicalUrl = `${SITE_URL}/negocio/${b.id}`
    const title = `${b.name} en ${b.district}, Lima | LimaCentro`
    const description =
      `${b.name}. ${b.category} en ${b.district}. ${b.description}`.slice(0, 155)
    const imageUrl = b.imageUrl || DEFAULT_IMAGE

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: b.name,
      description: b.description,
      image: imageUrl,
      url: canonicalUrl,
      telephone: b.phone || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: b.address,
        addressLocality: b.district,
        addressRegion: 'Lima',
        addressCountry: 'PE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: b.lat,
        longitude: b.lng,
      },
      aggregateRating: b.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: b.rating,
            bestRating: 5,
            worstRating: 1,
            ratingCount: 1,
          }
        : undefined,
    }

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:image', content: imageUrl },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
        {
          type: 'application/ld+json',
          // safeJsonLd escapa "<" para evitar XSS vía datos de negocio
          children: safeJsonLd(jsonLd),
        },
      ],
    }
  },
  notFoundComponent: () => (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl p-8 shadow-sm text-center">
        <h1 className="text-xl font-bold text-gray-900">
          Negocio no encontrado
        </h1>
        <Link
          to="/"
          className="mt-4 inline-block text-sm text-blue-700 hover:underline"
        >
          Volver a LimaCentro
        </Link>
      </div>
    </main>
  ),
  component: BusinessSeoPage,
})

function BusinessSeoPage() {
  const business = Route.useLoaderData() as BusinessData
  const website = safeHttpUrl(business.website)

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="mx-auto max-w-3xl p-6 md:p-10">
        <Link to="/" className="text-sm text-blue-700 hover:underline">
          Volver a LimaCentro
        </Link>
        <article className="mt-4 rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
          <p className="mt-2 text-sm uppercase tracking-wide text-blue-700">
            {business.category}
          </p>
          <p className="mt-4 text-gray-800">{business.description}</p>
          <p className="mt-4 text-gray-700">
            {business.address}, {business.district}, Lima
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            {business.phone && (
              <a
                href={`tel:${business.phone.replace(/[^0-9+]/g, '')}`}
                className="text-green-700 hover:underline"
              >
                {business.phone}
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline"
              >
                Sitio web
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:underline"
            >
              Cómo llegar
            </a>
          </div>
        </article>
      </section>
    </main>
  )
}
