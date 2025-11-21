import React from 'react';
import { Business } from '../types';
import { X, Phone, Globe, MapPin, Navigation } from 'lucide-react';
import { RATING_OPTIONS } from '../constants';

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
            <div className="fixed inset-0 z-[2000] flex items-end justify-center pointer-events-none md:pointer-events-auto md:items-center md:bg-black/40 backdrop-blur-[1px] md:backdrop-blur-sm transition-all">

                {/* Backdrop click to close (Desktop only) */}
                <div className="absolute inset-0 hidden md:block" onClick={onClose}></div>

                {/* Card Container */}
                <div className="
          pointer-events-auto
          w-full bg-white 
          rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)] 
          md:rounded-2xl md:shadow-2xl md:w-[500px] md:max-h-[85vh] md:m-4
          flex flex-col
          animate-in slide-in-from-bottom duration-300
          max-h-[60vh] md:h-auto
          border-t border-gray-200 md:border-none
        ">
                    {/* Image Header */}
                    <div className="relative h-40 md:h-56 flex-shrink-0 bg-gray-200">
                        <img
                            src={business.imageUrl || "https://picsum.photos/500/300"}
                            alt={business.name}
                            className="w-full h-full object-cover rounded-t-2xl"
                        />
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-gray-700" />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 rounded text-xs font-bold uppercase text-blue-800 tracking-wide shadow-sm backdrop-blur-sm">
                            {business.category}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 overflow-y-auto custom-scrollbar bg-white">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{business.name}</h2>
                            <div className="flex gap-1 flex-shrink-0 ml-2" title="Calificación">
                                {RATING_OPTIONS.map((option) => (
                                    <span
                                        key={option.value}
                                        className={`text-2xl transition-all ${business.rating === option.value
                                                ? 'opacity-100'
                                                : 'opacity-30 grayscale'
                                            }`}
                                    >
                                        {option.emoji}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center text-gray-600 mb-4">
                            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-blue-600" />
                            <span className="text-sm font-medium">{business.address}, {business.district}, Lima</span>
                        </div>

                        <p className="text-gray-700 text-sm leading-relaxed mb-6">
                            {business.description}
                        </p>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            {business.phone && (
                                <a
                                    href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-lg font-medium hover:bg-green-100 transition-colors border border-green-200"
                                >
                                    <Phone className="w-4 h-4" />
                                    WhatsApp
                                </a>
                            )}
                            {business.website && (
                                <a
                                    href={business.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2.5 rounded-lg font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                                >
                                    <Globe className="w-4 h-4" />
                                    Sitio Web
                                </a>
                            )}
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="col-span-2 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md mt-1"
                            >
                                <Navigation className="w-4 h-4" />
                                Cómo llegar
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};