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
  international_phone_number?: string;
  price_level?: number;
  types?: string[];
  url?: string;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
    relative_time_description?: string;
  }>;
}

export default function PlaceDetailsGoogle({ place, apiKey }: Props) {
  const [details, setDetails] = useState<GooglePlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllHours, setShowAllHours] = useState(false);

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
          'reviews',
        ],
      },
      (result, status) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
          setDetails(result as GooglePlaceDetails);
          
          // Carica le foto
          if (result.photos && result.photos.length > 0) {
            const urls = result.photos.map(photo => 
              photo.getUrl({ maxWidth: 800, maxHeight: 600 })
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
  const typeLabels: Record<string, string> = {
    restaurant: 'Ristorante',
    cafe: 'Caffè',
    bar: 'Bar',
    hotel: 'Hotel',
    museum: 'Museo',
    park: 'Parco',
    shopping_mall: 'Centro commerciale',
    tourist_attraction: 'Attrazione turistica',
    point_of_interest: 'Punto di interesse',
  };

  return (
    <div className="w-full -m-5">
      {/* Photos carousel */}
      {photoUrls.length > 0 && (
        <div className="relative">
          <div className="relative h-56 overflow-hidden bg-slate-100">
            <img
              src={photoUrls[selectedPhotoIndex]}
              alt={details.name}
              className="w-full h-full object-cover"
            />
            {photoUrls.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev - 1 + photoUrls.length) % photoUrls.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % photoUrls.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {photoUrls.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === selectedPhotoIndex ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            <button
              onClick={() => setShowAllPhotos(true)}
              className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition-colors"
            >
              📷 {photoUrls.length} foto
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Name and rating */}
        <div>
          <h3 className="font-bold text-lg text-slate-900">{details.name}</h3>
          {details.types && details.types.length > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              {details.types.slice(0, 3).map(t => typeLabels[t] || t.replace(/_/g, ' ')).join(' • ')}
            </p>
          )}
          {details.rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-sm ${i < Math.round(details.rating!) ? 'text-yellow-400' : 'text-slate-300'}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm font-medium text-slate-700">{details.rating.toFixed(1)}</span>
              {details.user_ratings_total && (
                <span className="text-xs text-slate-500">({details.user_ratings_total.toLocaleString()})</span>
              )}
            </div>
          )}
        </div>

        {/* Address */}
        {details.formatted_address && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <span className="text-base mt-0.5">📍</span>
            <span className="leading-relaxed">{details.formatted_address}</span>
          </div>
        )}

        {/* Opening hours */}
        {details.opening_hours && (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-base mt-0.5">🕐</span>
            <div className="flex-1">
              {details.opening_hours.open_now !== undefined && (
                <span className={`font-medium ${details.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}`}>
                  {details.opening_hours.open_now ? 'Aperto ora' : 'Chiuso ora'}
                </span>
              )}
              {details.opening_hours.weekday_text && details.opening_hours.weekday_text.length > 0 && (
                <div className="mt-1">
                  <button
                    onClick={() => setShowAllHours(!showAllHours)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {showAllHours ? 'Nascondi orari' : 'Mostra orari completi'}
                  </button>
                  {showAllHours && (
                    <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                      {details.opening_hours.weekday_text.map((day, idx) => (
                        <div key={idx} className="flex justify-between gap-2">
                          <span>{day.split(': ')[0]}</span>
                          <span className="text-right">{day.split(': ').slice(1).join(': ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
        {details.international_phone_number && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-base">📞</span>
            <a href={`tel:${details.international_phone_number}`} className="text-blue-600 hover:underline">
              {details.international_phone_number}
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

        {/* Reviews */}
        {details.reviews && details.reviews.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
              💬 Recensioni
            </h4>
            <div className="space-y-2">
              {details.reviews.slice(0, 2).map((review, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{review.author_name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-slate-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3">{review.text}</p>
                  {review.relative_time_description && (
                    <p className="text-xs text-slate-400 mt-1">{review.relative_time_description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          {details.url && (
            <a
              href={details.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 text-center transition-colors"
            >
              Vedi su Google Maps
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            🗺️
          </a>
        </div>
      </div>

      {/* All Photos Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4" onClick={() => setShowAllPhotos(false)}>
          <button
            onClick={() => setShowAllPhotos(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-xl"
          >
            ✕
          </button>
          <div className="max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {photoUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`${details.name} - Foto ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSelectedPhotoIndex(idx);
                    setShowAllPhotos(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
