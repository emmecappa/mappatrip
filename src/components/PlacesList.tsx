import { Place } from '../types';

interface Props {
  places: Place[];
  onSelect: (place: Place) => void;
  onAdd: () => void;
}

export default function PlacesList({ places, onSelect, onAdd }: Props) {
  const categoryIcons: Record<string, string> = {
    restaurant: '🍽️',
    attraction: '🏛️',
    hotel: '🏨',
    activity: '🎯',
    other: '📍',
  };

  const categoryColors: Record<string, string> = {
    restaurant: 'border-l-red-400',
    attraction: 'border-l-purple-400',
    hotel: 'border-l-amber-400',
    activity: 'border-l-green-400',
    other: 'border-l-gray-400',
  };

  const grouped = places.reduce((acc, place) => {
    if (!acc[place.category]) acc[place.category] = [];
    acc[place.category].push(place);
    return acc;
  }, {} as Record<string, Place[]>);

  const categoryOrder = ['attraction', 'restaurant', 'activity', 'hotel', 'other'];
  const categoryLabels: Record<string, string> = {
    attraction: '🏛️ Attrazioni',
    restaurant: '🍽️ Ristoranti',
    activity: '🎯 Attività',
    hotel: '🏨 Hotel',
    other: '📍 Altro',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📍 I tuoi luoghi</h2>
          <p className="text-sm text-gray-500">{places.length} luoghi salvati</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
        >
          + Aggiungi
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          ✓ Visitati: {places.filter(p => p.visited).length}
        </span>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
          📋 Da visitare: {places.filter(p => !p.visited).length}
        </span>
      </div>

      {/* Places grouped by category */}
      {categoryOrder.map(category => {
        const categoryPlaces = grouped[category];
        if (!categoryPlaces || categoryPlaces.length === 0) return null;
        
        return (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{categoryLabels[category]}</h3>
            <div className="space-y-2">
              {categoryPlaces.map(place => (
                <div
                  key={place.id}
                  onClick={() => onSelect(place)}
                  className={`bg-white rounded-lg p-3 border-l-4 ${categoryColors[place.category]} shadow-sm hover:shadow-md cursor-pointer transition-all hover:translate-x-1`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryIcons[place.category]}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{place.name}</h4>
                        {place.impressions && (
                          <p className="text-xs text-gray-500 truncate max-w-48">{place.impressions}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {place.instagram && <span className="text-xs">📸</span>}
                      {place.photos.length > 0 && <span className="text-xs">📷</span>}
                      {place.youtubeLinks.length > 0 && <span className="text-xs">🎬</span>}
                      {place.visited && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {places.length === 0 && (
        <div className="text-center py-12">
          <span className="text-5xl block mb-4">🗺️</span>
          <p className="text-gray-500 text-sm">Nessun luogo salvato</p>
          <p className="text-gray-400 text-xs mt-1">Clicca sulla mappa o usa il pulsante per aggiungere luoghi</p>
        </div>
      )}
    </div>
  );
}
