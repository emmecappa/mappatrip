import { useState, useEffect } from 'react';
import { Place, DiaryEntry, TravelInfo, TabType, AppMode } from './types';
import TravelInfoBar from './components/TravelInfoBar';
import MapView from './components/MapView';
import PlaceCard from './components/PlaceCard';
import PlaceModal from './components/PlaceModal';
import PlacesList from './components/PlacesList';
import DailyDiary from './components/DailyDiary';
import SettingsPanel from './components/SettingsPanel';

const defaultTravelInfo: TravelInfo = {
  destination: '',
  arrivalDate: new Date().toISOString().split('T')[0],
  departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  hotelName: '',
  hotelLink: '',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return defaultValue;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [appMode, setAppMode] = useState<AppMode>(() => loadFromStorage('travel_mode', 'planning'));
  const [places, setPlaces] = useState<Place[]>(() => loadFromStorage('travel_places', []));
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => loadFromStorage('travel_diary', []));
  const [travelInfo, setTravelInfo] = useState<TravelInfo>(() => loadFromStorage('travel_info', defaultTravelInfo));
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [pendingAddPlace, setPendingAddPlace] = useState<{ lat: number; lng: number; name: string } | null>(null);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || travelInfo.googleMapsApiKey;

  useEffect(() => {
    localStorage.setItem('travel_places', JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    localStorage.setItem('travel_diary', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem('travel_info', JSON.stringify(travelInfo));
  }, [travelInfo]);

  useEffect(() => {
    localStorage.setItem('travel_mode', JSON.stringify(appMode));
  }, [appMode]);

  const handleMapClick = (lat: number, lng: number) => {
    // In modalità visita, il click sulla mappa non apre il modal
    if (appMode === 'visit') return;
    
    setPendingAddPlace({ lat, lng, name: '' });
    setEditingPlace(null);
    setShowPlaceModal(true);
  };

  const handleAddFromSearch = (lat: number, lng: number, name: string) => {
    setPendingAddPlace({ lat, lng, name });
    setEditingPlace(null);
    setShowPlaceModal(true);
  };

  const handleSavePlace = (place: Place) => {
    const existingIndex = places.findIndex(p => p.id === place.id);
    if (existingIndex >= 0) {
      const updated = [...places];
      updated[existingIndex] = place;
      setPlaces(updated);
    } else {
      setPlaces([...places, place]);
    }
    setShowPlaceModal(false);
    setEditingPlace(null);
    setPendingAddPlace(null);
  };

  const handleDeletePlace = (id: string) => {
    setPlaces(places.filter(p => p.id !== id));
    setSelectedPlace(null);
  };

  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setPendingAddPlace(null);
    setShowPlaceModal(true);
    setSelectedPlace(null);
  };

  const handleSaveDiary = (entry: DiaryEntry) => {
    const existingIndex = diaryEntries.findIndex(e => e.id === entry.id);
    if (existingIndex >= 0) {
      const updated = [...diaryEntries];
      updated[existingIndex] = entry;
      setDiaryEntries(updated);
    } else {
      setDiaryEntries([...diaryEntries, entry]);
    }
  };

  const handleDeleteDiary = (id: string) => {
    setDiaryEntries(diaryEntries.filter(e => e.id !== id));
  };

  const handleCloseModal = () => {
    setShowPlaceModal(false);
    setEditingPlace(null);
    setPendingAddPlace(null);
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'map', label: 'Mappa', icon: '🗺️' },
    { id: 'places', label: 'Luoghi', icon: '📍' },
    { id: 'diary', label: 'Diario', icon: '📖' },
    { id: 'settings', label: 'Info', icon: '⚙️' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <TravelInfoBar travelInfo={travelInfo} />

      {/* Mode Toggle */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center gap-2">
        <button
          onClick={() => setAppMode('planning')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            appMode === 'planning'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📋 Planning
        </button>
        <button
          onClick={() => setAppMode('visit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            appMode === 'visit'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🚶 Visita
        </button>
        <span className="text-xs text-slate-500 ml-2">
          {appMode === 'planning' ? 'Organizza il viaggio' : 'Usa la mappa'}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`flex-1 relative ${activeTab !== 'map' ? 'hidden lg:block' : ''}`}>
          <div className="absolute inset-3">
            <MapView
              places={places}
              onMapClick={handleMapClick}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              onAddFromSearch={handleAddFromSearch}
              apiKey={googleMapsApiKey || ''}
              mode={appMode}
            />
          </div>

          {selectedPlace && (
            <div className="absolute top-4 right-4 z-50 max-h-[80vh] overflow-y-auto">
              <PlaceCard
                place={selectedPlace}
                onEdit={handleEditPlace}
                onDelete={handleDeletePlace}
                onClose={() => setSelectedPlace(null)}
              />
            </div>
          )}
        </div>

        <div className={`w-full lg:w-96 xl:w-[420px] bg-slate-50 border-l border-slate-200 overflow-y-auto ${activeTab === 'map' ? 'hidden lg:block' : ''}`}>
          <div className="p-4 pb-20 lg:pb-4">
            {activeTab === 'places' && (
              <PlacesList
                places={places}
                onSelect={(place) => {
                  setSelectedPlace(place);
                  setActiveTab('map');
                }}
                onAdd={() => {
                  setPendingAddPlace(null);
                  setEditingPlace(null);
                  setShowPlaceModal(true);
                }}
              />
            )}
            {activeTab === 'diary' && (
              <DailyDiary
                entries={diaryEntries}
                onSave={handleSaveDiary}
                onDelete={handleDeleteDiary}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel
                travelInfo={travelInfo}
                onSave={setTravelInfo}
              />
            )}
          </div>
        </div>
      </div>

      <nav className="bg-white border-t border-slate-200 shadow-sm lg:hidden shrink-0">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-[2000] flex-col gap-1 bg-white/95 backdrop-blur-sm rounded-r-xl shadow-lg border border-slate-200 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title={tab.label}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden xl:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {showPlaceModal && (
        <PlaceModal
          place={editingPlace}
          pendingAdd={pendingAddPlace}
          onSave={handleSavePlace}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
