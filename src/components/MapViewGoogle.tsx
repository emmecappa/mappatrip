import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Place } from '../types';
import { useState, useRef, useCallback, useEffect } from 'react';

interface Props {
  places: Place[];
  onMapClick: (lat: number, lng: number) => void;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onAddFromSearch: (lat: number, lng: number, name: string) => void;
  apiKey: string;
}

interface Prediction {
  place_id?: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
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

export default function MapViewGoogle({ places, onMapClick, onSelectPlace, onAddFromSearch, apiKey }: Props) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedInfoPlace, setSelectedInfoPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  useEffect(() => {
    if (isLoaded && map && window.google?.maps?.places) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(map);
      } catch (err) {
        console.error('Errore inizializzazione servizi Places:', err);
      }
    }
  }, [isLoaded, map]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPredictions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
  }, [onMapClick]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (!autocompleteService.current) return;

      setIsLoading(true);
      autocompleteService.current.getPlacePredictions(
        { input: searchQuery },
        (results, status) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setShowPredictions(true);
          } else {
            setPredictions([]);
          }
        }
      );
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleSelectPrediction = (prediction: Prediction) => {
    if (!placesService.current || !prediction.place_id) return;

    setIsLoading(true);
    setShowPredictions(false);

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'geometry', 'formatted_address']
      },
      (place, status) => {
        setIsLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const name = place.name || prediction.structured_formatting?.main_text || 'Luogo';

          if (map) {
            map.panTo(place.geometry.location);
            map.setZoom(15);
          }

          onAddFromSearch(lat, lng, name);
          setSearchQuery('');
          setPredictions([]);
        }
      }
    );
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-xl border border-red-200">
        <div className="text-center p-6">
          <p className="text-red-600 font-medium">Errore caricamento Google Maps</p>
          <p className="text-red-500 text-sm mt-2">Verifica la API Key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-600 mt-4">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-slate-200 relative">
      <div ref={containerRef} className="absolute top-3 left-3 right-3 z-[1000]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca su Google Maps..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {showPredictions && predictions.length > 0 && (
          <div className="mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-80 overflow-y-auto">
            {predictions.map((prediction, idx) => (
              <button
                key={prediction.place_id || idx}
                onClick={() => handleSelectPrediction(prediction)}
                className="w-full p-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-b-0"
              >
                <p className="font-medium text-sm text-slate-900">
                  {prediction.structured_formatting?.main_text || prediction.description.split(',')[0]}
                </p>
                {prediction.structured_formatting?.secondary_text && (
                  <p className="text-xs text-slate-500 mt-1">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

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
              <button
                onClick={() => {
                  onSelectPlace(selectedInfoPlace);
                  setSelectedInfoPlace(null);
                }}
                className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600"
              >
                Vedi dettagli
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
