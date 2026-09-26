import { TravelInfo } from '../types';
import { useState } from 'react';

interface Props {
  travelInfo: TravelInfo;
  onSave: (info: TravelInfo) => void;
}

export default function SettingsPanel({ travelInfo, onSave }: Props) {
  const [form, setForm] = useState<TravelInfo>({ ...travelInfo });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="max-w-lg mx-auto">
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
    </div>
  );
}
