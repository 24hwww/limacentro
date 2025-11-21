import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import SessionProvider from '../components/SessionProvider';

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
        <html lang="es">
            <body className={inter.className}>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
