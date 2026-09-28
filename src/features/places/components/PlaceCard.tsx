import { useState } from 'react';
import { Place } from '../../../core/types';
import { CATEGORY_ICONS, CATEGORY_LABELS, getGoogleMapsUrl, getInstagramUrl } from '../../../core/utils';

interface Props {
  place: Place;
  onEdit: (place: Place) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function PlaceCard({ place, onEdit, onDelete, onClose }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const categoryColors: Record<string, string> = {
    restaurant: 'bg-red-100 text-red-800',
    attraction: 'bg-purple-100 text-purple-800',
    hotel: 'bg-amber-100 text-amber-800',
    activity: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-md w-full">
      {/* Header */}
      <div className="relative p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
        >
          ✕
        </button>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{CATEGORY_ICONS[place.category]}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{place.name}</h2>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[place.category]}`}>
              {CATEGORY_LABELS[place.category]}
            </span>
          </div>
        </div>
        {place.visited && (
          <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            ✓ Visitato
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
        {/* Instagram */}
        {place.instagram && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <span className="text-xl">📸</span>
            <div>
              <p className="text-xs text-gray-500">Instagram</p>
              <a
                href={getInstagramUrl(place.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-purple-700 hover:text-purple-900"
              >
                @{place.instagram}
              </a>
            </div>
          </div>
        )}

        {/* Impressions */}
        {place.impressions && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">💭 Impressioni</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{place.impressions}</p>
          </div>
        )}

        {/* Notes */}
        {place.notes && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">📝 Note</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{place.notes}</p>
          </div>
        )}

        {/* Photos */}
        {place.photos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">📷 Foto</h3>
            <div className="grid grid-cols-2 gap-2">
              {place.photos.map((photo, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YouTube Links */}
        {place.youtubeLinks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">🎬 Video YouTube</h3>
            <div className="space-y-2">
              {place.youtubeLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <span className="text-red-600">▶️</span>
                  <span className="text-xs text-red-700 truncate">{link}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Coordinates */}
        <div className="text-xs text-gray-400">
          📍 {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(place)}
            className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            ✏️ Modifica
          </button>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              🗑️
            </button>
          ) : (
            <button
              onClick={() => onDelete(place.id)}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Conferma?
            </button>
          )}
        </div>
        <a
          href={getGoogleMapsUrl(place.lat, place.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          🗺️ Apri in Google Maps
        </a>
      </div>
    </div>
  );
}
