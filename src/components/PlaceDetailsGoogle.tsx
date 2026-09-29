import { useState, useEffect } from 'react';
import { Place } from '../core/types';

interface Props {
  place: Place;
  apiKey: string;
}

interface GooglePlaceDetails {
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: google.maps.places.PlacePhoto[];
  opening_hours?: {
    weekday_text?: string[];
    open_now?: boolean;
  };
  website?: string;
  phone?: string;
  price_level?: number;
  types?: string[];
  url?: string;
}

export default function PlaceDetailsGoogle({ place, apiKey }: Props) {
  const [details, setDetails] = useState<GooglePlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!place.googlePlaceId || !window.google?.maps?.places) {
      return;
    }

    setLoading(true);
    setError(null);

    const map = document.createElement('div');
    const service = new window.google.maps.places.PlacesService(map);

    service.getDetails(
      {
        placeId: place.googlePlaceId,
        fields: [
          'name',
          'formatted_address',
          'rating',
          'user_ratings_total',
          'photos',
          'opening_hours',
          'website',
          'international_phone_number',
          'price_level',
          'types',
          'url',
        ],
      },
      (result, status) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
          setDetails(result as GooglePlaceDetails);
          
          // Carica le foto
          if (result.photos && result.photos.length > 0) {
            const urls = result.photos.slice(0, 4).map(photo => 
              photo.getUrl({ maxWidth: 400, maxHeight: 300 })
            );
            setPhotoUrls(urls);
          }
        } else {
          setError('Impossibile caricare i dettagli da Google Maps');
        }
      }
    );

    return () => {
      map.remove();
    };
  }, [place.googlePlaceId]);

  if (!place.googlePlaceId) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-sm text-slate-500 mt-2">Caricamento dettagli...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!details) {
    return null;
  }

  const priceLabels = ['', '€', '€€', '€€€', '€€€€'];

  return (
    <div className="w-full max-w-md">
      {/* Photos carousel */}
      {photoUrls.length > 0 && (
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          <img
            src={photoUrls[0]}
            alt={details.name}
            className="w-full h-full object-cover"
          />
          {photoUrls.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              📷 {photoUrls.length} foto
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name and rating */}
        <div>
          <h3 className="font-bold text-lg text-slate-900">{details.name}</h3>
          {details.rating && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-sm ${i < Math.round(details.rating!) ? 'text-yellow-400' : 'text-slate-300'}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm font-medium text-slate-700">{details.rating.toFixed(1)}</span>
              {details.user_ratings_total && (
                <span className="text-xs text-slate-500">({details.user_ratings_total.toLocaleString()} recensioni)</span>
              )}
            </div>
          )}
        </div>

        {/* Address */}
        {details.formatted_address && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <span className="text-base">📍</span>
            <span>{details.formatted_address}</span>
          </div>
        )}

        {/* Opening hours */}
        {details.opening_hours && (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-base">🕐</span>
            <div>
              {details.opening_hours.open_now !== undefined && (
                <span className={`font-medium ${details.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}`}>
                  {details.opening_hours.open_now ? 'Aperto ora' : 'Chiuso ora'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price level */}
        {details.price_level && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-base">💰</span>
            <span>{priceLabels[details.price_level]}</span>
          </div>
        )}

        {/* Phone */}
        {details.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-base">📞</span>
            <a href={`tel:${details.phone}`} className="text-blue-600 hover:underline">
              {details.phone}
            </a>
          </div>
        )}

        {/* Website */}
        {details.website && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-base">🌐</span>
            <a href={details.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
              Sito web
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          {details.url && (
            <a
              href={details.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 text-center"
            >
              Vedi su Google Maps
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
          >
            🗺️
          </a>
        </div>
      </div>
    </div>
  );
}
