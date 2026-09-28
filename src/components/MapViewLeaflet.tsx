import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Place, AppMode } from '../types';
import { useEffect, useState } from 'react';

interface Props {
  places: Place[];
  onMapClick: (lat: number, lng: number) => void;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onAddFromSearch: (lat: number, lng: number, name: string) => void;
  mode: AppMode;
}

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
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

function MapClickHandler({ onMapClick, mode }: { onMapClick: (lat: number, lng: number) => void; mode: AppMode }) {
  useMapEvents({
    click: (e) => {
      if (mode === 'planning') {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapViewLeaflet({ places, onMapClick, onSelectPlace, onAddFromSearch, mode }: Props) {
  const defaultCenter: [number, number] = [41.9028, 12.4964];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
  }, []);

  useEffect(() => {
    if (mode === 'visit') {
      setSearchQuery('');
      setSearchResults([]);
      setShowResults(false);
    }
  }, [mode]);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      } catch (err) {
        console.error('Errore ricerca:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSelectResult = (result: SearchResult) => {
    const name = result.display_name.split(',')[0];
    onAddFromSearch(parseFloat(result.lat), parseFloat(result.lon), name);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const categoryIcons: Record<string, string> = {
    restaurant: '🍽️',
    attraction: '🏛️',
    hotel: '🏨',
    activity: '🎯',
    other: '📍',
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-slate-200 relative">
      {/* Search bar - solo in modalità planning */}
      {mode === 'planning' && (
        <div className="absolute top-3 left-3 right-3 z-[1000]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca luoghi..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-80 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full p-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-b-0"
                >
                  <p className="font-medium text-sm text-slate-900">{result.display_name.split(',')[0]}</p>
                  <p className="text-xs text-slate-500 mt-1">{result.display_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={onMapClick} mode={mode} />
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
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{categoryIcons[place.category]}</span>
                  <div>
                    <h3 className="font-bold text-sm">{place.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{place.category}</p>
                  </div>
                </div>
                {place.impressions && (
                  <p className="text-xs text-slate-700 mb-2">{place.impressions.substring(0, 100)}...</p>
                )}
                {place.photos.length > 0 && (
                  <img src={place.photos[0]} alt="" className="w-full h-24 object-cover rounded mb-2" />
                )}
                <button
                  onClick={() => onSelectPlace(place)}
                  className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600"
                >
                  Vedi dettagli
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
