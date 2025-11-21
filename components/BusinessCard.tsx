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
        flex gap-4 p-4 border-b border-gray-100 cursor-pointer transition-all duration-200
        hover:bg-slate-50
        ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'bg-white'}
      `}
    >
      <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
        <img 
          src={business.imageUrl || "https://picsum.photos/200"} 
          alt={business.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              {business.category}
            </span>
            <h3 className="font-bold text-gray-900 truncate">{business.name}</h3>
          </div>
          <div className="flex items-center bg-yellow-100 px-1.5 py-0.5 rounded">
            <Star className="w-3 h-3 text-yellow-600 fill-yellow-600 mr-1" />
            <span className="text-xs font-bold text-yellow-800">{business.rating}</span>
          </div>
        </div>

        <div className="flex items-center mt-1 text-gray-500 text-sm">
          <MapPin className="w-3.5 h-3.5 mr-1" />
          <span className="truncate">{business.district}</span>
        </div>

        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {business.description}
        </p>

        <div className="flex gap-3 mt-3">
          {business.phone && (
            <a href={`tel:${business.phone}`} className="text-gray-400 hover:text-green-600 transition-colors" title="Llamar">
              <Phone className="w-4 h-4" />
            </a>
          )}
          {business.website && (
            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Web">
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
