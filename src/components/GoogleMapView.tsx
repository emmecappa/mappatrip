import { useState, useRef, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Place } from '../types';

interface Props {
  places: Place[];
  onMapClick?: (lat: number, lng: number) => void;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onSearchSelect: (lat: number, lng: number, name: string) => void;
  apiKey: string;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 41.9028,
  lng: 12.4964
};

const categoryIcons: Record<string, string> = {
  restaurant: '🍽️',
  attraction: '🏛️',
  hotel: '🏨',
  activity: '🎯',
  other: '📍',
};

export default function GoogleMapView({ places, onMapClick, onSelectPlace, onSearchSelect, apiKey }: Props) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchResult, setSearchResult] = useState<google.maps.places.PlaceResult | null>(null);
  const [selectedInfoPlace, setSelectedInfoPlace] = useState<Place | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  console.log('🔑 Google Maps API Key:', apiKey ? 'Presente' : 'Mancante');
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('✅ Google Maps caricato con successo');
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && onMapClick) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
  }, [onMapClick]);

  const onPlacesChanged = () => {
    console.log('🔍 onPlacesChanged chiamato');
    
    if (!autocompleteRef.current) {
      console.error('❌ autocompleteRef.current è null');
      setSearchError('Autocomplete non inizializzato');
      return;
    }

    try {
      const place = autocompleteRef.current.getPlace();
      console.log('📍 Place ottenuto:', place);

      if (!place.geometry) {
        console.error('❌ Place non ha geometria:', place);
        setSearchError('Luogo non trovato. Prova a selezionare un risultato dai suggerimenti.');
        return;
      }

      if (!place.geometry.location) {
        console.error('❌ Place non ha location:', place);
        setSearchError('Coordinate non disponibili per questo luogo');
        return;
      }

      setSearchError('');
      setSearchResult(place);
      
      // Center map on selected place
      if (map) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
      }
      
      // Call onSearchSelect with place details
      const name = place.name || place.formatted_address || 'Luogo';
      console.log('✅ Chiamata onSearchSelect con:', name, place.geometry.location.lat(), place.geometry.location.lng());
      
      onSearchSelect(
        place.geometry.location.lat(),
        place.geometry.location.lng(),
        name
      );
    } catch (error) {
      console.error('❌ Errore in onPlacesChanged:', error);
      setSearchError('Errore nella ricerca. Riprova.');
    }
  };

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    console.log('✅ Autocomplete caricato');
    autocompleteRef.current = autocomplete;
  };

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="text-center p-6 max-w-md">
          <span className="text-5xl block mb-4">🔑</span>
          <p className="text-yellow-800 font-medium text-lg">API Key mancante</p>
          <p className="text-yellow-700 text-sm mt-2">
            Per usare Google Maps, inserisci la tua API Key nelle impostazioni
          </p>
          <p className="text-yellow-600 text-xs mt-3">
            Vai in ⚙️ Info → sezione 🗺️ Google Maps
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    console.error('❌ Errore caricamento Google Maps:', loadError);
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-xl border border-red-200">
        <div className="text-center p-6 max-w-md">
          <span className="text-5xl block mb-4">❌</span>
          <p className="text-red-600 font-medium text-lg">Errore nel caricamento di Google Maps</p>
          <p className="text-red-500 text-sm mt-2">
            Verifica che la tua API Key sia valida e che le seguenti API siano abilitate:
          </p>
          <ul className="text-red-500 text-xs mt-2 text-left list-disc list-inside">
            <li>Maps JavaScript API</li>
            <li>Places API</li>
          </ul>
          <p className="text-red-400 text-xs mt-3">
            Controlla anche la console del browser per maggiori dettagli
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-600 mt-4">Caricamento Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-slate-200 relative">
      {/* Search bar with Autocomplete */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlacesChanged}
          options={{
            fields: ['geometry', 'name', 'formatted_address', 'place_id', 'types'],
          }}
        >
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cerca su Google Maps (es: ristoranti Roma)..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-slate-400"
            />
          </div>
        </Autocomplete>

        {/* Error message */}
        {searchError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠️ {searchError}
          </div>
        )}

        {/* Success message */}
        {searchResult && !searchError && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✅ <strong>{searchResult.name}</strong> trovato! Il modal si aprirà automaticamente.
          </div>
        )}
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false,
        }}
      >
        {/* Search result marker */}
        {searchResult?.geometry?.location && (
          <Marker
            position={{
              lat: searchResult.geometry.location.lat(),
              lng: searchResult.geometry.location.lng()
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#2563eb',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
          >
            <InfoWindow>
              <div className="p-1 min-w-[150px]">
                <h3 className="font-bold text-sm">{searchResult.name}</h3>
                <p className="text-xs text-slate-500">{searchResult.formatted_address}</p>
              </div>
            </InfoWindow>
          </Marker>
        )}

        {/* Saved places markers */}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            onClick={() => setSelectedInfoPlace(place)}
            label={{
              text: categoryIcons[place.category],
              fontSize: '20px',
            }}
          />
        ))}

        {/* Info window for selected place */}
        {selectedInfoPlace && (
          <InfoWindow
            position={{ lat: selectedInfoPlace.lat, lng: selectedInfoPlace.lng }}
            onCloseClick={() => setSelectedInfoPlace(null)}
          >
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{categoryIcons[selectedInfoPlace.category]}</span>
                <div>
                  <h3 className="font-bold text-sm">{selectedInfoPlace.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{selectedInfoPlace.category}</p>
                </div>
              </div>
              {selectedInfoPlace.impressions && (
                <p className="text-xs text-slate-700 mb-2">{selectedInfoPlace.impressions.substring(0, 100)}...</p>
              )}
              <button
                onClick={() => {
                  onSelectPlace(selectedInfoPlace);
                  setSelectedInfoPlace(null);
                }}
                className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
              >
                Vedi dettagli
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

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
