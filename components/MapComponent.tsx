'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Business, Coordinates } from '../types';
import { LIMA_CENTER } from '../constants';

// Fix for Leaflet default marker icons in React
if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

// Component to handle Map flying
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

// Component to handle Map background clicks
const MapClickHandler = ({ onMapClick }: { onMapClick: () => void }) => {
    useMapEvents({
        click: () => {
            onMapClick();
        },
    });
    return null;
};

interface MapComponentProps {
    center: Coordinates;
    businesses: Business[];
    onBusinessClick: (business: Business) => void;
    onMapBackgroundClick: () => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
    center,
    businesses,
    onBusinessClick,
    onMapBackgroundClick,
}) => {
    return (
        <MapContainer
            center={[LIMA_CENTER.lat, LIMA_CENTER.lng]}
            zoom={12}
            scrollWheelZoom={true}
            zoomControl={false}
            style={{ height: '100%', width: '100%', backgroundColor: '#f0f0f0' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                subdomains="abcd"
                maxZoom={20}
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
                            onBusinessClick(b);
                        }
                    }}
                />
            ))}
        </MapContainer>
    );
};

export default MapComponent;
