import React from 'react';
import { Business } from '../types';
import { MapPin } from 'lucide-react';
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
          <div className="flex gap-0.5" title="Calificación">
            {RATING_OPTIONS.map((option) => (
              <span
                key={option.value}
                className={`text-lg transition-all ${business.rating === option.value
                    ? 'opacity-100'
                    : 'opacity-30 grayscale'
                  }`}
              >
                {option.emoji}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center mt-1 text-gray-500 text-sm">
          <MapPin className="w-3.5 h-3.5 mr-1" />
          <span className="truncate">{business.district}</span>
        </div>

        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {business.description}
        </p>
      </div>
    </div>
  );
};
