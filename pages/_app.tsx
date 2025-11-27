import type { AppProps } from 'next/app'
import Head from 'next/head'
import { StackProvider } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { OnlineUsersCounter } from '@/components/OnlineUsersCounter';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StackProvider app={stackServerApp}>
      <Head>
        <title>LimaCentro - Guía Comercial</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <GoogleAnalytics />
      <Component {...pageProps} />
      <OnlineUsersCounter />
    </StackProvider>
  )
}