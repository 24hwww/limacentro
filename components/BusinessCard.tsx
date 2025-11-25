import React from 'react';
import { Business } from '../types';
import { MapPin, Phone, Globe, Star } from 'lucide-react';

interface BusinessCardProps {
  business: Business;
  onClick: (b: Business) => void;
  isActive: boolean;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onClick, isActive }) => {
  return (
    <div 
      onClick={() => onClick(business)}
      className={`
        flex gap-4 p-5 border-b border-gray-200 cursor-pointer transition-all duration-200
        hover:bg-slate-50
        ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-700' : 'bg-white'}
      `}
      role="button"
      aria-label={`Ver detalles de ${business.name}`}
    >
      <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
        <img 
          src={business.imageUrl || "https://picsum.photos/200"} 
          alt={`Foto de ${business.name}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-sm font-bold uppercase tracking-wide text-blue-700">
              {business.category}
            </span>
            <h3 className="text-lg font-bold text-gray-900 truncate mt-0.5">{business.name}</h3>
          </div>
          <div className="flex items-center bg-yellow-100 px-2 py-1 rounded border border-yellow-200" aria-label={`Calificación: ${business.rating} estrellas`}>
            <Star className="w-4 h-4 text-yellow-700 fill-yellow-700 mr-1" />
            <span className="text-sm font-bold text-yellow-900">{business.rating}</span>
          </div>
        </div>

        <div className="flex items-center mt-1.5 text-gray-700 text-base">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-600" />
          <span className="truncate">{business.district}</span>
        </div>

        <p className="text-base text-gray-700 mt-2 line-clamp-2 leading-relaxed">
          {business.description}
        </p>

        <div className="flex gap-4 mt-3">
          {business.phone && (
            <a 
              href={`tel:${business.phone}`} 
              className="flex items-center text-gray-600 hover:text-green-700 transition-colors p-1 -ml-1" 
              title="Llamar"
              aria-label={`Llamar a ${business.name}`}
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
          {business.website && (
            <a 
              href={business.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-gray-600 hover:text-blue-700 transition-colors p-1" 
              title="Visitar sitio web"
              aria-label={`Visitar sitio web de ${business.name}`}
            >
              <Globe className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};