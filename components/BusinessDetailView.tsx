import React from 'react';
import { Business } from '../types';
import { X, Phone, Globe, MapPin, Star, Navigation } from 'lucide-react';

interface BusinessDetailViewProps {
  business: Business;
  onClose: () => void;
}

export const BusinessDetailView: React.FC<BusinessDetailViewProps> = ({ business, onClose }) => {
  return (
    <>
      {/* 
        Wrapper:
        - Mobile: Pointer events none (allows clicking map behind), items-end (bottom sheet).
        - Desktop: Pointer events auto (modal), items-center (centered), dimmed background.
      */}
      <div className="fixed inset-0 z-[2000] flex items-end justify-center pointer-events-none md:pointer-events-auto md:items-center md:bg-black/60 backdrop-blur-[2px] md:backdrop-blur-sm transition-all">
        
        {/* Backdrop click to close (Desktop only) */}
        <div className="absolute inset-0 hidden md:block" onClick={onClose} aria-hidden="true"></div>

        {/* Card Container */}
        <div 
          className="
            pointer-events-auto
            w-full bg-white 
            rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.4)] 
            md:rounded-2xl md:shadow-2xl md:w-[600px] md:max-h-[90vh] md:m-4
            flex flex-col
            animate-in slide-in-from-bottom duration-300
            max-h-[75vh] md:h-auto
            border-t border-gray-300 md:border-none
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="business-title"
        >
            {/* Image Header */}
            <div className="relative h-48 md:h-64 flex-shrink-0 bg-gray-300">
                <img 
                    src={business.imageUrl || "https://picsum.photos/500/300"} 
                    alt={`Imagen principal de ${business.name}`}
                    className="w-full h-full object-cover rounded-t-2xl"
                />
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    aria-label="Cerrar detalles"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-md text-sm font-bold uppercase text-blue-800 tracking-wide shadow-md">
                    {business.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar bg-white text-gray-900">
                <div className="flex justify-between items-start mb-3">
                    <h2 id="business-title" className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">{business.name}</h2>
                    <div className="flex items-center bg-yellow-100 px-3 py-1.5 rounded-lg flex-shrink-0 ml-4 border border-yellow-200" aria-label={`Calificación ${business.rating} de 5`}>
                        <Star className="w-5 h-5 text-yellow-700 fill-yellow-700 mr-1.5" />
                        <span className="text-lg font-bold text-yellow-900">{business.rating}</span>
                    </div>
                </div>

                <div className="flex items-start text-gray-800 mb-5">
                    <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-700" aria-hidden="true" />
                    <span className="text-lg font-medium">{business.address}, {business.district}, Lima</span>
                </div>

                <p className="text-gray-800 text-lg leading-relaxed mb-8">
                    {business.description}
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {business.phone && (
                        <a 
                            href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-green-50 text-green-800 py-3.5 rounded-xl font-bold text-base hover:bg-green-100 transition-colors border border-green-300 focus:ring-2 focus:ring-green-600 focus:outline-none"
                        >
                            <Phone className="w-5 h-5" />
                            WhatsApp
                        </a>
                    )}
                    {business.website && (
                        <a 
                            href={business.website} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-blue-50 text-blue-800 py-3.5 rounded-xl font-bold text-base hover:bg-blue-100 transition-colors border border-blue-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                            <Globe className="w-5 h-5" />
                            Sitio Web
                        </a>
                    )}
                    <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="md:col-span-2 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-bold text-base hover:bg-gray-800 transition-colors shadow-lg mt-2 focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 focus:outline-none"
                    >
                        <Navigation className="w-5 h-5" />
                        Cómo llegar
                    </a>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};