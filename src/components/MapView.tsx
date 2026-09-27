import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Place } from '../types';
import { useEffect } from 'react';

interface Props {
  places: Place[];
  onMapClick?: (lat: number, lng: number) => void;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
}

function createMarkerIcon(category: string) {
  const colors: Record<string, string> = {
    restaurant: '#ef4444',
    attraction: '#8b5cf6',
    hotel: '#f59e0b',
    activity: '#10b981',
    other: '#6b7280',
  };
  const color = colors[category] || '#2563eb';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
      <div style="width:18px;height:18px;border-radius:50%;background:white;"></div>
    </div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapView({ places, onMapClick, onSelectPlace }: Props) {
  const defaultCenter: [number, number] = [41.9028, 12.4964]; // Roma

  useEffect(() => {
    // Fix default marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
  }, []);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-slate-200 relative">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={onMapClick} />
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={createMarkerIcon(place.category)}
            eventHandlers={{
              click: () => onSelectPlace(place),
            }}
          >
            <Popup>
              <div className="p-1 min-w-[150px]">
                <h3 className="font-bold text-sm text-slate-900">{place.name}</h3>
                <p className="text-xs text-slate-500 capitalize">{place.category}</p>
                {place.impressions && (
                  <p className="text-xs mt-1 text-slate-700">{place.impressions.substring(0, 80)}...</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
