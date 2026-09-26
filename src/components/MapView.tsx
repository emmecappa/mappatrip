import { Place } from '../types';
import { useState } from 'react';

interface Props {
  places: Place[];
  onMapClick?: (lat: number, lng: number) => void;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
}

export default function MapView({ places, onMapClick, onSelectPlace }: Props) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [clickLat, setClickLat] = useState('');
  const [clickLng, setClickLng] = useState('');

  const defaultCenter = { lat: 41.9028, lng: 12.4964 };
  const defaultZoom = 6;

  const handleAddClick = () => {
    if (clickLat && clickLng && onMapClick) {
      onMapClick(parseFloat(clickLat), parseFloat(clickLng));
      setShowAddDialog(false);
      setClickLat('');
      setClickLng('');
    }
  };

  const categoryColors: Record<string, string> = {
    restaurant: '#ef4444',
    attraction: '#8b5cf6',
    hotel: '#f59e0b',
    activity: '#10b981',
    other: '#6b7280',
  };

  const categoryIcons: Record<string, string> = {
    restaurant: '🍽️',
    attraction: '🏛️',
    hotel: '🏨',
    activity: '🎯',
    other: '📍',
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-slate-200 relative bg-white">
      {/* Map iframe */}
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${defaultCenter.lng - 15},${defaultCenter.lat - 10},${defaultCenter.lng + 15},${defaultCenter.lat + 10}&layer=mapnik`}
        className="w-full h-full border-0"
        title="Mappa"
        style={{ minHeight: '400px' }}
      />

      {/* Place markers overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap gap-2">
        {places.map((place) => (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all text-sm font-medium border border-slate-200 hover:scale-105"
            style={{ borderLeftColor: categoryColors[place.category], borderLeftWidth: '3px' }}
          >
            <span>{categoryIcons[place.category]}</span>
            <span className="text-slate-700">{place.name}</span>
            {place.visited && <span className="text-green-500 text-xs">✓</span>}
          </button>
        ))}
      </div>

      {/* Add place button */}
      <button
        onClick={() => setShowAddDialog(!showAddDialog)}
        className="absolute bottom-4 left-4 z-10 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium text-blue-600 hover:text-blue-700 border border-slate-200"
      >
        + Aggiungi con coordinate
      </button>

      {/* Add dialog */}
      {showAddDialog && (
        <div className="absolute bottom-16 left-4 z-20 bg-white rounded-lg shadow-xl p-4 border border-slate-200 w-72">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">📍 Inserisci coordinate</h3>
          <div className="space-y-2">
            <input
              type="number"
              step="any"
              placeholder="Latitudine (es: 41.9028)"
              value={clickLat}
              onChange={(e) => setClickLat(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitudine (es: 12.4964)"
              value={clickLng}
              onChange={(e) => setClickLng(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddClick}
                disabled={!clickLat || !clickLng}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Aggiungi
              </button>
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-2 border border-slate-200">
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-slate-600">Ristorante</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-slate-600">Attrazione</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-slate-600">Hotel</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-slate-600">Attività</span>
          </div>
        </div>
      </div>
    </div>
  );
}
