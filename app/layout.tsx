import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import SessionProvider from '../components/SessionProvider';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'LimaCentro - Guía Comercial de Lima',
    description: 'Descubre los mejores negocios y servicios en Lima Centro',
    keywords: 'Lima, negocios, restaurantes, servicios, guía comercial',
    authors: [{ name: 'LimaCentro' }],
    openGraph: {
        title: 'LimaCentro - Guía Comercial de Lima',
        description: 'Descubre los mejores negocios y servicios en Lima Centro',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-YTBE1TCWQR"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-YTBE1TCWQR');
                    `}
                </Script>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
