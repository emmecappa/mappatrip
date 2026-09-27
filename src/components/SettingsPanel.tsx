import { TravelInfo } from '../types';
import { useState } from 'react';

interface Props {
  travelInfo: TravelInfo;
  onSave: (info: TravelInfo) => void;
}

export default function SettingsPanel({ travelInfo, onSave }: Props) {
  const [form, setForm] = useState<TravelInfo>({ ...travelInfo });
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);

  const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            ⚙️ Impostazioni Viaggio
          </h2>
          <p className="text-sm text-gray-600 mt-1">Configura i dettagli del tuo viaggio</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🌍 Destinazione</label>
            <input
              type="text"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              placeholder="Es: Tokyo, Giappone"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📅 Data arrivo</label>
              <input
                type="date"
                value={form.arrivalDate}
                onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📅 Data partenza</label>
              <input
                type="date"
                value={form.departureDate}
                onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🏨 Nome Hotel</label>
            <input
              type="text"
              value={form.hotelName}
              onChange={(e) => setForm({ ...form, hotelName: e.target.value })}
              placeholder="Es: Hotel Sakura"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🔗 Link Hotel</label>
            <input
              type="url"
              value={form.hotelLink}
              onChange={(e) => setForm({ ...form, hotelLink: e.target.value })}
              placeholder="https://booking.com/..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            💾 Salva impostazioni
          </button>
        </form>
      </div>

      {/* Google Maps API Key */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🗺️ Google Maps
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {envApiKey 
              ? '✅ Google Maps attivo (variabile d\'ambiente) - ricerca avanzata disponibile' 
              : form.googleMapsApiKey 
                ? '✅ Google Maps attivo - ricerca avanzata disponibile' 
                : 'Aggiungi la tua API key per usare Google Maps'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {envApiKey && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">✅ API Key configurata via variabile d'ambiente</p>
              <p className="text-xs text-green-700 mt-1">
                La chiave è impostata in <code className="bg-green-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code>
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🔑 API Key (alternativa)</label>
            <input
              type="text"
              value={form.googleMapsApiKey || ''}
              onChange={(e) => setForm({ ...form, googleMapsApiKey: e.target.value })}
              placeholder="AIzaSy..."
              disabled={!!envApiKey}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm ${
                envApiKey ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {envApiKey && (
              <p className="text-xs text-gray-500 mt-1">
                La chiave è già configurata via variabile d'ambiente
              </p>
            )}
          </div>

          <button
            onClick={() => {
              onSave({ ...form });
            }}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          >
            💾 Salva API Key
          </button>

          {form.googleMapsApiKey && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">✅ Google Maps attivo!</p>
              <p className="text-xs text-green-700 mt-1">
                La mappa ora usa Google Maps con ricerca avanzata. Ricarica la pagina per applicare le modifiche.
              </p>
            </div>
          )}

          <button
            onClick={() => setShowApiKeyHelp(!showApiKeyHelp)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showApiKeyHelp ? '▼ Nascondi istruzioni' : '▶ Come ottenere la API Key (gratis)'}
          </button>

          {showApiKeyHelp && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 space-y-3">
              <p className="font-semibold">📋 Come ottenere la API Key:</p>
              <ol className="list-decimal list-inside space-y-2 text-xs">
                <li>Vai su <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console</a></li>
                <li>Crea un nuovo progetto (o usa uno esistente)</li>
                <li>Vai su "API e servizi" → "Libreria"</li>
                <li>Cerca e abilita:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li><strong>Maps JavaScript API</strong></li>
                    <li><strong>Places API</strong></li>
                  </ul>
                </li>
                <li>Vai su "Credenziali" → "Crea credenziali" → "Chiave API"</li>
                <li>Copia la chiave e incollala qui sopra</li>
              </ol>
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                <p className="font-medium">💰 Costi:</p>
                <p className="mt-1">Google ti dà <strong>$200/mese gratis</strong> (circa 28.000 visualizzazioni mappa). Per uso personale è praticamente gratuito!</p>
              </div>
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                <p className="font-medium">⚠️ Sicurezza:</p>
                <p className="mt-1">Per sicurezza, limita la tua API key al tuo dominio nelle impostazioni di Google Cloud Console.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
