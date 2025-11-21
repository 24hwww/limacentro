import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="p-6 mt-4 border-t border-gray-100 bg-gray-50 text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-3">
                <span>Hecho con</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                <span>con IA</span>
            </div>

            <div className="flex justify-center gap-4 text-xs text-gray-500">
                <Link
                    href="/quienes-somos"
                    className="hover:text-blue-600 transition-colors hover:underline"
                >
                    Quiénes Somos
                </Link>
                <span>•</span>
                <Link
                    href="/politicas-de-privacidad"
                    className="hover:text-blue-600 transition-colors hover:underline"
                >
                    Políticas de Privacidad
                </Link>
            </div>

            <div className="mt-2 text-[10px] text-gray-400">
                &copy; {new Date().getFullYear()} LimaCentro
            </div>
        </footer>
    );
};
