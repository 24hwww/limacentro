import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { db } from '@/services/db';

type BusinessPageData = {
  id: number;
  name: string;
  category: string;
  district: string;
  address: string;
  description: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  lat: number;
  lng: number;
  imageUrl: string | null;
  updatedAt: string;
};

const DEFAULT_IMAGE = 'https://picsum.photos/seed/limacentro/1200/630';

export const getServerSideProps: GetServerSideProps<{
  business: BusinessPageData | null;
}> = async ({ params }) => {
  const id = Number(params?.id);
  if (!Number.isFinite(id)) {
    return { notFound: true };
  }

  const business = await db.business.findUnique({
    where: { id },
  });

  if (!business) {
    return { notFound: true };
  }

  return {
    props: {
      business: {
        id: business.id,
        name: business.name,
        category: business.category,
        district: business.district,
        address: business.address,
        description: business.description || 'Negocio registrado en LimaCentro.',
        phone: business.phone,
        website: business.website,
        rating: business.rating ? Number(business.rating) : null,
        lat: Number(business.lat),
        lng: Number(business.lng),
        imageUrl: business.imageUrl || null,
        updatedAt: business.updatedAt.toISOString(),
      },
    },
  };
};

export default function BusinessSeoPage({
  business,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!business) return null;

  const baseUrl = process.env.NEXTAUTH_URL || 'https://limacentro.com';
  const canonicalUrl = `${baseUrl}/negocio/${business.id}`;
  const imageUrl = business.imageUrl || DEFAULT_IMAGE;
  const title = `${business.name} en ${business.district}, Lima | LimaCentro`;
  const description = `${business.name}. ${business.category} en ${business.district}. ${business.description}`.slice(0, 155);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    image: imageUrl,
    url: canonicalUrl,
    telephone: business.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.district,
      addressRegion: 'Lima',
      addressCountry: 'PE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.lat,
      longitude: business.lng,
    },
    aggregateRating: business.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: business.rating,
          bestRating: 5,
          worstRating: 1,
          ratingCount: 1,
        }
      : undefined,
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="min-h-screen bg-gray-100">
        <section className="mx-auto max-w-3xl p-6 md:p-10">
          <Link href="/" className="text-sm text-blue-700 hover:underline">
            Volver a LimaCentro
          </Link>
          <article className="mt-4 rounded-xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
            <p className="mt-2 text-sm uppercase tracking-wide text-blue-700">{business.category}</p>
            <p className="mt-4 text-gray-800">{business.description}</p>
            <p className="mt-4 text-gray-700">
              {business.address}, {business.district}, Lima
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="text-green-700 hover:underline">
                  {business.phone}
                </a>
              )}
              {business.website && (
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
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
    </>
  );
}
