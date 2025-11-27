import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const PoliticasPrivacidad: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Políticas de Privacidad</h1>
          
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              <strong>Fecha de entrada en vigor:</strong> 21 de noviembre de 2025
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Información que Recopilamos</h2>
            <p className="mb-4">
              LimaCentro recopila información para proporcionar y mejorar nuestros servicios:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Información de cuenta (nombre, email, foto de perfil)</li>
              <li className="mb-2">Información de negocios (nombre, dirección, teléfono, sitio web)</li>
              <li className="mb-2">Datos de uso y navegación</li>
              <li className="mb-2">Información de geolocalización</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Uso de la Información</h2>
            <p className="mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Proporcionar y mantener nuestro servicio</li>
              <li className="mb-2">Mejorar la experiencia del usuario</li>
              <li className="mb-2">Analizar el uso del servicio</li>
              <li className="mb-2">Comunicar novedades y actualizaciones</li>
              <li className="mb-2">Prevenir actividades fraudulentas</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Compartir Información</h2>
            <p className="mb-4">
              No vendemos, intercambiamos ni transferimos su información personal a terceros, 
              excepto en los siguientes casos:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Con su consentimiento explícito</li>
              <li className="mb-2">Para cumplir con obligaciones legales</li>
              <li className="mb-2">Para proteger nuestros derechos y propiedad</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Seguridad de los Datos</h2>
            <p className="mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger 
              su información contra acceso no autorizado, alteración, divulgación o destrucción.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies</h2>
            <p className="mb-4">
              Utilizamos cookies para mejorar la experiencia del usuario. Puede configurar 
              su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad 
              del sitio.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Derechos del Usuario</h2>
            <p className="mb-4">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Acceder a su información personal</li>
              <li className="mb-2">Corregir información inexacta</li>
              <li className="mb-2">Solicitar eliminación de su información</li>
              <li className="mb-2">Oponerse al procesamiento de sus datos</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Cambios a las Políticas</h2>
            <p className="mb-4">
              Nos reservamos el derecho de actualizar estas políticas. Notificaremos cualquier 
              cambio significativo a través de nuestro sitio web o por correo electrónico.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Contacto</h2>
            <p className="mb-4">
              Para preguntas sobre estas políticas de privacidad, contáctenos en:
            </p>
            <p className="mb-4">
              Email: privacy@limacentro.pe<br />
              Teléfono: +51 1 234 5678
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliticasPrivacidad;
