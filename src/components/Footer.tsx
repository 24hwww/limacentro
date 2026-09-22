import React from 'react';
import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="p-4 border-t border-gray-100 bg-gray-50 text-center flex-shrink-0">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-2">
                <span>Hecho con</span>
                <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                <span>con IA</span>
            </div>

            <div className="flex justify-center gap-3 text-[10px] text-gray-500 flex-wrap">
                <Link
                    to="/quienes-somos"
                    className="hover:text-blue-600 transition-colors hover:underline"
                >
                    Quiénes Somos
                </Link>
                <span>•</span>
                <Link
                    to="/politicas-de-privacidad"
                    className="hover:text-blue-600 transition-colors hover:underline"
                >
                    Políticas
                </Link>
            </div>

            <div className="mt-1 text-[9px] text-gray-400">
                &copy; {new Date().getFullYear()} LimaCentro
            </div>

            <div className="mt-1 text-[8px] text-gray-400">
                <a
                    href="https://openfreemap.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                >
                    © OpenFreeMap
                </a>
                {' | '}
                <a
                    href="https://openmaptiles.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                >
                    © OpenMapTiles
                </a>
                {' | '}
                <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                >
                    © OpenStreetMap contributors
                </a>
            </div>
        </footer>
    );
};
