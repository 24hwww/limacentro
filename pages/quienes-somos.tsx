import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const QuienesSomos: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Quiénes Somos</h1>
          
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              LimaCentro es el directorio comercial más completo de Lima, Perú. Nuestra misión es 
              conectar a los negocios locales con los residentes y visitantes de la ciudad, 
              facilitando el encuentro de servicios y productos de confianza.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Nuestra Misión</h2>
            <p className="mb-4">
              Ser la plataforma digital de referencia para descubrir negocios en Lima, 
              promoviendo el comercio local y ayudando a las empresas a crecer en el entorno digital.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Nuestra Visión</h2>
            <p className="mb-4">
              Transformar la manera en que las personas encuentran y conectan con negocios 
              locales en Lima, utilizando tecnología innovadora para crear experiencias 
              significativas tanto para consumidores como para empresarios.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Valores</h2>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Compromiso con el comercio local</li>
              <li className="mb-2">Innovación tecnológica</li>
              <li className="mb-2">Confiabilidad y transparencia</li>
              <li className="mb-2">Excelencia en el servicio</li>
              <li className="mb-2">Colaboración y comunidad</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">¿Cómo Funciona?</h2>
            <p className="mb-4">
              LimaCentro permite a los usuarios explorar negocios por categoría, distrito 
              o mediante búsqueda directa. Cada negocio incluye información detallada como 
              dirección, teléfono, sitio web y ubicación en mapa interactivo.
            </p>
            <p className="mb-4">
              Los dueños de negocios pueden registrar sus establecimientos gratuitamente, 
              aumentando su visibilidad y alcanzando más clientes potenciales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuienesSomos;
