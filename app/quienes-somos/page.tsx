import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Heart, Users } from 'lucide-react';

export default function QuienesSomos() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
                    <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver al mapa
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Sobre LimaCentro</h1>
                    <p className="text-xl text-gray-600">Conectando la tradición y modernidad de nuestra ciudad.</p>
                </div>

                <div className="prose prose-lg mx-auto text-gray-700 space-y-12">
                    {/* Misión */}
                    <section className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                <MapPin className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Nuestra Misión</h2>
                            <p>
                                LimaCentro nace con el objetivo de redescubrir y potenciar los negocios locales de Lima.
                                Queremos facilitar a los ciudadanos y turistas el acceso a la rica oferta gastronómica,
                                cultural y de servicios que nuestra ciudad tiene para ofrecer.
                            </p>
                        </div>
                    </section>

                    {/* Comunidad */}
                    <section className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Para la Comunidad</h2>
                            <p>
                                Creemos en el poder de la comunidad. Nuestra plataforma permite a los usuarios compartir
                                sus experiencias a través de calificaciones honestas y ayuda a los dueños de negocios
                                a ganar visibilidad digital de manera sencilla y gratuita.
                            </p>
                        </div>
                    </section>

                    {/* Tecnología */}
                    <section className="bg-gray-50 p-8 rounded-2xl text-center">
                        <Heart className="w-12 h-12 text-red-500 fill-red-500 mx-auto mb-4 animate-pulse" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Hecho con Amor e IA</h2>
                        <p className="mb-0">
                            Este proyecto combina la pasión por nuestra ciudad con las últimas tecnologías de
                            Inteligencia Artificial para ofrecer descripciones únicas y una experiencia de usuario fluida.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
