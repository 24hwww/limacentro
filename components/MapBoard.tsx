import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Business, Coordinates } from '../types';
import { LIMA_CENTER } from '../constants';

// Configuración de iconos de Leaflet
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

// Componentes auxiliares del mapa
const MapController = ({ center }: { center: Coordinates }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 13, {
      animate: true,
      duration: 1.5
    });
  }, [center, map]);
  return null;
};

const MapClickHandler = ({ onMapClick }: { onMapClick: () => void }) => {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
};

interface MapBoardProps {
  center: Coordinates;
  businesses: Business[];
  onMarkerClick: (b: Business) => void;
  onMapBackgroundClick: () => void;
}

const MapBoard: React.FC<MapBoardProps> = ({ center, businesses, onMarkerClick, onMapBackgroundClick }) => {

  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer
      center={[LIMA_CENTER.lat, LIMA_CENTER.lng]}
      zoom={12}
      scrollWheelZoom={true}
      zoomControl={false}
      style={{ height: '100%', width: '100%', background: '#262626' }}
    >
      <TileLayer
        attribution=''
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      />
      <MapController center={center} />
      <MapClickHandler onMapClick={onMapBackgroundClick} />

      {businesses.map(b => (
        <Marker
          key={b.id}
          position={[b.lat, b.lng]}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e.originalEvent);
              onMarkerClick(b);
            }
          }}
        />
      ))}
    </MapContainer>
  );
};

export default MapBoard;