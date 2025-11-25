import React from 'react';
import { Business } from '../types';
import { MapPin, Phone, Globe } from 'lucide-react';
import { RATING_OPTIONS } from '../constants';

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
        flex gap-3 sm:gap-4 p-3 sm:p-5 border-b border-gray-200 cursor-pointer transition-all duration-200
        hover:bg-slate-50 active:bg-slate-100
        ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-700' : 'bg-white'}
      `}
      role="button"
      aria-label={`Ver detalles de ${business.name}`}
    >
      <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
        <img 
          src={business.imageUrl || "https://picsum.photos/200"} 
          alt={`Foto de ${business.name}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide text-blue-700 block truncate">
              {business.category}
            </span>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate mt-0.5">{business.name}</h3>
          </div>
          <div className="flex-shrink-0">
            {(() => {
              const roundedRating = Math.round(business.rating);
              const rating = RATING_OPTIONS.find(r => r.value === roundedRating);
              if (!rating) return null;
              return (
                <div className="flex items-center gap-1 bg-gray-100 px-1.5 sm:px-2 py-1 rounded-full" title={`Calificación: ${rating.label}`}>
                  <span className="text-sm sm:text-lg leading-none">{rating.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 hidden sm:block">{rating.label}</span>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex items-center mt-1 sm:mt-1.5 text-gray-700 text-sm sm:text-base">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0 text-gray-600" />
          <span className="truncate">{business.district}</span>
        </div>

        <p className="text-xs sm:text-base text-gray-700 mt-1.5 sm:mt-2 line-clamp-2 leading-relaxed">
          {business.description}
        </p>

        <div className="flex gap-3 sm:gap-4 mt-2 sm:mt-3">
          {business.phone && (
            <a 
              href={`tel:${business.phone}`} 
              className="flex items-center text-gray-600 hover:text-green-700 transition-colors p-1.5 sm:p-1 -ml-1.5 sm:-ml-1" 
              title="Llamar"
              aria-label={`Llamar a ${business.name}`}
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          )}
          {business.website && (
            <a 
              href={business.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-gray-600 hover:text-blue-700 transition-colors p-1.5 sm:p-1" 
              title="Visitar sitio web"
              aria-label={`Visitar sitio web de ${business.name}`}
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};