'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DropPoint } from '../lib/types';

// Fix for Leaflet default icons in Next.js
const fixLeafletIcon = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

// Component to handle map center updates
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, {
                duration: 1.5
            });
        }
    }, [center, map]);
    return null;
}

interface MapClientProps {
    dropPoints: DropPoint[];
    selectedPointId: number | null;
    onSelectPoint: (id: number) => void;
}

export default function MapClient({ dropPoints, selectedPointId, onSelectPoint }: MapClientProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        fixLeafletIcon();
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="w-full h-full flex items-center justify-center bg-gray-100">Memuat Peta...</div>;

    // Default center (Cilacap)
    const defaultCenter: [number, number] = [-7.7212, 109.0069];

    const selectedPoint = dropPoints.find(p => p.id === selectedPointId);

    // Determine center: Selected Point -> First Valid Filtered Point -> Default Cilacap
    let center: [number, number] = defaultCenter;
    if (selectedPoint && selectedPoint.latitude != null && selectedPoint.longitude != null) {
        center = [selectedPoint.latitude, selectedPoint.longitude];
    } else {
        const firstValid = dropPoints.find(p => p.latitude != null && p.longitude != null);
        if (firstValid && firstValid.latitude != null && firstValid.longitude != null) {
            center = [firstValid.latitude, firstValid.longitude];
        }
    }

    return (
        <MapContainer
            center={center}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={center} />

            {dropPoints.map((point) => {
                if (point.latitude == null || point.longitude == null) return null;
                return (
                    <Marker
                        key={point.id}
                        position={[point.latitude, point.longitude]}
                        eventHandlers={{
                            click: () => onSelectPoint(point.id),
                        }}
                    >
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-gray-900">{point.name}</h3>
                                <p className="text-sm text-gray-600">{point.address}</p>
                                <div className="mt-2">
                                    <span className={`px-2 py-0.5 rounded text-xs text-white ${point.status === 'Buka' ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {point.status}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
