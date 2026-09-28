import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Place } from '../types';

interface Props {
  places: Place[];
  onMapClick?: (lat: number, lng: number) => void;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onSearchSelect: (lat: number, lng: number, name: string) => void;
  apiKey: string;
}

interface PredictionResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
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
  const [searchResult, setSearchResult] = useState<{ lat: number; lng: number; name: string; address: string } | null>(null);
  const [selectedInfoPlace, setSelectedInfoPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  // Inizializza i servizi quando la mappa è pronta
  useEffect(() => {
    if (isLoaded && map && window.google?.maps?.places) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(map);
        setStatus('✅ Servizi Google Places inizializzati');
        console.log('✅ AutocompleteService e PlacesService inizializzati');
      } catch (err) {
        console.error('❌ Errore inizializzazione servizi:', err);
        setStatus('❌ Errore inizializzazione servizi');
      }
    }
  }, [isLoaded, map]);

  // Chiudi dropdown cliccando fuori
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
    console.log('✅ Google Maps caricato');
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && onMapClick) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
  }, [onMapClick]);

  // Ricerca con debounce
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
      fetchPredictions(searchQuery);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const fetchPredictions = (query: string) => {
    if (!autocompleteService.current) {
      console.warn('⚠️ AutocompleteService non disponibile');
      setError('Servizio di ricerca non ancora pronto. Attendi un momento.');
      return;
    }

    setIsLoading(true);
    setError('');

    autocompleteService.current.getPlacePredictions(
      { 
        input: query,
        types: ['establishment', 'geocode'], // Cerca sia attività che luoghi
      },
      (predictions, status) => {
        setIsLoading(false);
        
        console.log('🔍 Predictions status:', status);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const results: PredictionResult[] = predictions.map(p => ({
            placeId: p.place_id || '',
            description: p.description || '',
            mainText: p.structured_formatting?.main_text?.toString() || p.description?.split(',')[0] || '',
            secondaryText: p.structured_formatting?.secondary_text?.toString() || '',
          }));
          setPredictions(results);
          setShowPredictions(true);
          console.log('✅ Predictions trovate:', results.length);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPredictions([]);
          setShowPredictions(true);
          console.log('⚠️ Nessun risultato');
        } else {
          setError(`Errore: ${status}`);
          console.error('❌ Errore predictions:', status);
        }
      }
    );
  };

  const selectPrediction = (prediction: PredictionResult) => {
    if (!placesService.current) {
      setError('PlacesService non disponibile');
      return;
    }

    setIsLoading(true);
    setError('');
    setShowPredictions(false);
    setSearchQuery(prediction.description);

    placesService.current.getDetails(
      {
        placeId: prediction.placeId,
        fields: ['name', 'geometry', 'formatted_address', 'types', 'rating', 'user_ratings_total'],
      },
      (place, status) => {
        setIsLoading(false);
        
        console.log('📍 Place details status:', status);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const name = place.name || prediction.mainText;
          const address = place.formatted_address || prediction.description;

          setSearchResult({ lat, lng, name, address });
          
          // Centra la mappa
          if (map) {
            map.panTo(place.geometry.location);
            map.setZoom(15);
          }

          setStatus(`✅ "${name}" trovato!`);
          console.log('✅ Luogo selezionato:', name, lat, lng);

          // Apri il modal per aggiungere il luogo
          onSearchSelect(lat, lng, name);
        } else {
          setError(`Errore nel recupero dettagli: ${status}`);
          console.error('❌ Errore details:', status, place);
        }
      }
    );
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
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-xl border border-red-200">
        <div className="text-center p-6 max-w-md">
          <span className="text-5xl block mb-4">❌</span>
          <p className="text-red-600 font-medium text-lg">Errore caricamento Google Maps</p>
          <p className="text-red-500 text-sm mt-2">
            Verifica che Maps JavaScript API e Places API siano abilitate
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
      {/* Search bar */}
      <div ref={containerRef} className="absolute top-3 left-3 right-3 z-[1000]">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => predictions.length > 0 && setShowPredictions(true)}
            placeholder="Cerca ristoranti, hotel, luoghi..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPredictions([]);
                setShowPredictions(false);
                setError('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Predictions dropdown */}
        {showPredictions && (
          <div className="mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-80 overflow-y-auto">
            {predictions.length > 0 ? (
              predictions.map((prediction, idx) => (
                <button
                  key={prediction.placeId || idx}
                  onClick={() => selectPrediction(prediction)}
                  className="w-full p-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-b-0 transition-colors flex items-start gap-3"
                >
                  <span className="text-xl mt-0.5">📍</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {prediction.mainText}
                    </p>
                    {prediction.secondaryText && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {prediction.secondaryText}
                      </p>
                    )}
                  </div>
                </button>
              ))
            ) : searchQuery.length >= 2 && !isLoading ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Nessun risultato trovato
              </div>
            ) : null}
          </div>
        )}

        {/* Error / Status messages */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}
        {status && !error && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
            {status}
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
        {searchResult && (
          <Marker
            position={{ lat: searchResult.lat, lng: searchResult.lng }}
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
                <p className="text-xs text-slate-500">{searchResult.address}</p>
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
