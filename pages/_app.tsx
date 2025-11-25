import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AuthProvider } from '@/contexts/AuthContext'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>LimaCentro - Guía Comercial</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <GoogleAnalytics />
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  )
}