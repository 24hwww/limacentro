"use client";

import React, { useRef, useEffect } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup } from '@/components/ui/map';
import { Business, Coordinates } from '../types';
import { LIMA_CENTER } from '../constants';
import type MapLibreGL from 'maplibre-gl';

interface MapBoardProps {
  center: Coordinates;
  businesses: Business[];
  onMarkerClick: (b: Business) => void;
  onMapBackgroundClick: () => void;
}

const MapBoard: React.FC<MapBoardProps> = ({ center, businesses, onMarkerClick, onMapBackgroundClick }) => {
  const mapRef = useRef<MapLibreGL.Map | null>(null);

  // Fly to center when it changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo({
        center: [center.lng, center.lat],
        zoom: 14,
        duration: 1500,
      });
    }
  }, [center]);

  const handleMapClick = () => {
    onMapBackgroundClick();
  };

  return (
    <Map
      ref={mapRef}
      center={[LIMA_CENTER.lng, LIMA_CENTER.lat]}
      zoom={12}
      theme="dark"
      className="h-full w-full"
      onClick={handleMapClick}
    >
      {businesses.map((business) => (
        <MapMarker
          key={business.id}
          longitude={business.lng}
          latitude={business.lat}
          onClick={(e) => {
            e.stopPropagation();
            onMarkerClick(business);
          }}
        >
          <MarkerContent>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background transition-transform hover:scale-110">
              <MarkerIcon category={business.category} />
            </div>
          </MarkerContent>
          <MarkerPopup closeButton className="min-w-[200px]">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">{business.name}</h3>
              <p className="text-xs text-muted-foreground">{business.category}</p>
              <p className="text-xs text-muted-foreground">{business.district}</p>
              {business.rating > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-xs">{business.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </MarkerPopup>
        </MapMarker>
      ))}
    </Map>
  );
};

// Icon component based on category
const MarkerIcon = ({ category }: { category: string }) => {
  const iconMap: Record<string, string> = {
    'Restaurante': '🍽️',
    'Hotel': '🏨',
    'Tienda': '🛒',
    'Servicios': '🔧',
    'Salud': '🏥',
    'Educación': '📚',
    'Tecnología': '💻',
    'Turismo': '🗺️',
    'Otros': '📍',
  };
  
  return <span className="text-sm">{iconMap[category] || '📍'}</span>;
};

export default MapBoard;
