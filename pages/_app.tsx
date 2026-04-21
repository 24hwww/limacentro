import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { SessionProvider } from 'next-auth/react'
import GoogleAnalytics from '@/components/GoogleAnalytics';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://limacentro.com';
  const canonicalUrl = `${baseUrl}${router.asPath === '/' ? '' : router.asPath}`;

  return (
    <SessionProvider session={session}>
      <Head>
        <title>LimaCentro - Guía Comercial</title>
        <meta name="description" content="Encuentra negocios, servicios y comercios en el centro de Lima, Perú." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:site_name" content="LimaCentro" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="LimaCentro - Guía Comercial del Centro de Lima" />
        <meta property="og:description" content="Directorio de negocios y servicios en el centro de Lima, Perú." />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <GoogleAnalytics />
      <Component {...pageProps} />
    </SessionProvider>
  )
}
