import { useState, useRef, useCallback, useEffect } from 'react';
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

export default function GoogleMapView({ places, onMapClick, onSelectPlace, onSearchSelect, apiKey }: Props) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchResult, setSearchResult] = useState<google.maps.places.PlaceResult | null>(null);
  const [selectedInfoPlace, setSelectedInfoPlace] = useState<Place | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  const onLoad = useCallback((map: google.maps.Map) => {
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
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        setSearchResult(place);
        
        // Center map on selected place
        if (map) {
          map.panTo(place.geometry.location);
          map.setZoom(15);
        }
        
        // Call onSearchSelect with place details
        const name = place.name || place.formatted_address || 'Luogo';
        onSearchSelect(
          place.geometry.location.lat(),
          place.geometry.location.lng(),
          name
        );
      }
    }
  };

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-xl border border-red-200">
        <div className="text-center p-6">
          <p className="text-red-600 font-medium">Errore nel caricamento di Google Maps</p>
          <p className="text-red-500 text-sm mt-2">Verifica la tua API Key nelle impostazioni</p>
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
              placeholder="Cerca su Google Maps..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-slate-400"
            />
          </div>
        </Autocomplete>
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
          mapTypeControl: false,
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
