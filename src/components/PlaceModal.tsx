import { Place } from '../types';
import { useState, useEffect } from 'react';

interface Props {
  place?: Place | null;
  pendingAdd?: { lat: number; lng: number; name: string; googlePlaceId?: string } | null;
  onSave: (place: Place) => void;
  onClose: () => void;
}

export default function PlaceModal({ place, pendingAdd, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [instagram, setInstagram] = useState('');
  const [impressions, setImpressions] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [category, setCategory] = useState<Place['category']>('attraction');
  const [visited, setVisited] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newYoutubeLink, setNewYoutubeLink] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (place) {
      setName(place.name);
      setLat(place.lat.toString());
      setLng(place.lng.toString());
      setInstagram(place.instagram || '');
      setImpressions(place.impressions);
      setNotes(place.notes);
      setPhotos(place.photos);
      setYoutubeLinks(place.youtubeLinks);
      setCategory(place.category);
      setVisited(place.visited);
      setGooglePlaceId(place.googlePlaceId);
    } else if (pendingAdd) {
      setName(pendingAdd.name);
      setLat(pendingAdd.lat.toString());
      setLng(pendingAdd.lng.toString());
      setGooglePlaceId(pendingAdd.googlePlaceId);
    }
  }, [place, pendingAdd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lat || !lng) return;

    const newPlace: Place = {
      id: place?.id || Date.now().toString(),
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      instagram: instagram || undefined,
      impressions,
      photos,
      notes,
      youtubeLinks,
      category,
      visited,
      googlePlaceId,
    };
    onSave(newPlace);
  };

  const addPhoto = () => {
    if (newPhotoUrl.trim()) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const addYoutubeLink = () => {
    if (newYoutubeLink.trim()) {
      setYoutubeLinks([...youtubeLinks, newYoutubeLink.trim()]);
      setNewYoutubeLink('');
    }
  };

  const categories: { value: Place['category']; label: string; icon: string }[] = [
    { value: 'restaurant', label: 'Ristorante', icon: '🍽️' },
    { value: 'attraction', label: 'Attrazione', icon: '🏛️' },
    { value: 'hotel', label: 'Hotel', icon: '🏨' },
    { value: 'activity', label: 'Attività', icon: '🎯' },
    { value: 'other', label: 'Altro', icon: '📍' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {place ? '✏️ Modifica Luogo' : '📍 Aggiungi Luogo'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es: Colosseo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    category === cat.value
                      ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitudine *</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitudine *</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📸 Instagram (username)</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
              placeholder="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">💭 Impressioni</label>
            <textarea
              value={impressions}
              onChange={(e) => setImpressions(e.target.value)}
              placeholder="Le tue prime impressioni..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📝 Note personali</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note, consigli, orari, prezzi..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📷 Foto (URL)</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button type="button" onClick={addPhoto} className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                +
              </button>
            </div>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img src={photo} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🎬 Link YouTube</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newYoutubeLink}
                onChange={(e) => setNewYoutubeLink(e.target.value)}
                placeholder="https://youtube.com/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button type="button" onClick={addYoutubeLink} className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                +
              </button>
            </div>
            {youtubeLinks.length > 0 && (
              <div className="space-y-1 mt-2">
                {youtubeLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <span>▶️</span>
                    <span className="truncate flex-1">{link}</span>
                    <button
                      type="button"
                      onClick={() => setYoutubeLinks(youtubeLinks.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visited"
              checked={visited}
              onChange={(e) => setVisited(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="visited" className="text-sm text-gray-700">✓ Già visitato</label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            {place ? 'Salva modifiche' : 'Aggiungi luogo'}
          </button>
        </form>
      </div>
    </div>
  );
}
