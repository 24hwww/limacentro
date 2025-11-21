import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, FileText } from 'lucide-react';

export default function PoliticasPrivacidad() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                    <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver al mapa
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Políticas de Privacidad</h1>
                    <p className="text-gray-600">
                        Última actualización: {new Date().toLocaleDateString('es-PE')}
                    </p>
                </div>

                <div className="prose prose-blue max-w-none text-gray-700 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-blue-600" />
                            1. Introducción
                        </h2>
                        <p>
                            En cumplimiento de la <strong>Ley N° 29733, Ley de Protección de Datos Personales</strong>, y su Reglamento (Decreto Supremo N° 003-2013-JUS),
                            <strong> LimaCentro</strong> (en adelante, "nosotros") se compromete a proteger la privacidad y seguridad de los datos personales de nuestros usuarios.
                            Esta política describe cómo recopilamos, utilizamos y protegemos su información.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-blue-600" />
                            2. Información que Recopilamos
                        </h2>
                        <p>Recopilamos la siguiente información personal cuando interactúa con nuestra plataforma:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Datos de Identificación:</strong> Nombre, dirección de correo electrónico y foto de perfil (proporcionados a través de Google OAuth).</li>
                            <li><strong>Datos de Negocios:</strong> Información sobre los negocios que registra (nombre, dirección, teléfono, etc.).</li>
                            <li><strong>Datos de Navegación:</strong> Dirección IP, tipo de navegador y datos de ubicación (si otorga permiso).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Lock className="w-5 h-5 text-blue-600" />
                            3. Finalidad del Tratamiento
                        </h2>
                        <p>Sus datos personales serán utilizados para las siguientes finalidades:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Gestionar su cuenta de usuario y autenticación.</li>
                            <li>Permitirle registrar y gestionar negocios en la plataforma.</li>
                            <li>Mejorar la experiencia de usuario y personalizar el contenido.</li>
                            <li>Garantizar la seguridad de la plataforma y prevenir fraudes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Consentimiento</h2>
                        <p>
                            Al utilizar nuestra plataforma y registrarse a través de Google, usted otorga su consentimiento libre, previo, expreso e informado para el tratamiento de sus datos personales conforme a esta política.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Derechos ARCO</h2>
                        <p>
                            Como titular de sus datos personales, usted tiene derecho a acceder, rectificar, cancelar y oponerse (Derechos ARCO) al tratamiento de su información.
                            Para ejercer estos derechos, puede contactarnos a través de nuestro correo electrónico de soporte (soporte@limacentro.pe).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Seguridad de la Información</h2>
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos contra el acceso no autorizado, pérdida o alteración.
                            Utilizamos protocolos de encriptación y servicios de autenticación segura (Google OAuth).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. Cookies y Tecnologías Similares</h2>
                        <p>
                            Utilizamos cookies de sesión para mantener su autenticación activa. Puede configurar su navegador para rechazar estas cookies,
                            pero esto podría afectar la funcionalidad de la plataforma.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8">
                        <p className="text-sm text-gray-500 mb-0">
                            Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Cualquier cambio será notificado a través de la plataforma.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
