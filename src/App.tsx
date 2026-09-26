import { useState, useEffect } from 'react';
import { Place, DiaryEntry, TravelInfo, TabType } from './types';
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
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [places, setPlaces] = useState<Place[]>(() => loadFromStorage('travel_places', []));
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => loadFromStorage('travel_diary', []));
  const [travelInfo, setTravelInfo] = useState<TravelInfo>(() => loadFromStorage('travel_info', defaultTravelInfo));
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [mapClickCoords, setMapClickCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('travel_places', JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    localStorage.setItem('travel_diary', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem('travel_info', JSON.stringify(travelInfo));
  }, [travelInfo]);

  const handleMapClick = (lat: number, lng: number) => {
    setMapClickCoords({ lat, lng });
    setEditingPlace(null);
    setShowPlaceModal(true);
  };

  const handleSavePlace = (place: Place) => {
    const exists = places.find(p => p.id === place.id);
    if (exists) {
      setPlaces(places.map(p => p.id === place.id ? place : p));
    } else {
      setPlaces([...places, place]);
    }
    setShowPlaceModal(false);
    setEditingPlace(null);
    setMapClickCoords(null);
  };

  const handleDeletePlace = (id: string) => {
    setPlaces(places.filter(p => p.id !== id));
    setSelectedPlace(null);
  };

  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setShowPlaceModal(true);
    setSelectedPlace(null);
  };

  const handleSaveDiary = (entry: DiaryEntry) => {
    const exists = diaryEntries.find(e => e.id === entry.id);
    if (exists) {
      setDiaryEntries(diaryEntries.map(e => e.id === entry.id ? entry : e));
    } else {
      setDiaryEntries([...diaryEntries, entry]);
    }
  };

  const handleDeleteDiary = (id: string) => {
    setDiaryEntries(diaryEntries.filter(e => e.id !== id));
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'map', label: 'Mappa', icon: '🗺️' },
    { id: 'places', label: 'Luoghi', icon: '📍' },
    { id: 'diary', label: 'Diario', icon: '📖' },
    { id: 'settings', label: 'Info', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Travel Info Bar - always visible */}
      <TravelInfoBar travelInfo={travelInfo} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Map section - always visible on desktop, hidden on mobile when not on map tab */}
        <div className={`${activeTab === 'map' ? 'block' : 'hidden'} lg:block lg:flex-1 relative`}>
          <div className="absolute inset-0 p-3">
            <MapView
              places={places}
              onMapClick={handleMapClick}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
            />
          </div>

          {/* Place Card overlay */}
          {selectedPlace && (
            <div className="absolute top-4 right-4 z-10 max-h-[80vh] overflow-y-auto">
              <PlaceCard
                place={selectedPlace}
                onEdit={handleEditPlace}
                onDelete={handleDeletePlace}
                onClose={() => setSelectedPlace(null)}
              />
            </div>
          )}

          {/* Add place button on map */}
          <button
            onClick={() => {
              setEditingPlace(null);
              setMapClickCoords(null);
              setShowPlaceModal(true);
            }}
            className="absolute bottom-6 right-6 z-10 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110"
            title="Aggiungi luogo"
          >
            +
          </button>
        </div>

        {/* Side panel for other tabs */}
        <div className={`${activeTab !== 'map' ? 'block' : 'hidden'} lg:block lg:w-96 xl:w-[420px] bg-gray-50 border-l border-gray-200 overflow-y-auto scrollbar-thin`}>
          <div className="p-4">
            {activeTab === 'places' && (
              <PlacesList
                places={places}
                onSelect={(place) => {
                  setSelectedPlace(place);
                  setActiveTab('map');
                }}
                onAdd={() => {
                  setEditingPlace(null);
                  setMapClickCoords(null);
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

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-200 shadow-lg lg:hidden">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar navigation */}
      <div className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-20 flex-col gap-1 bg-white/90 backdrop-blur-sm rounded-r-xl shadow-lg border border-gray-200 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={tab.label}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden xl:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Place Modal */}
      {showPlaceModal && (
        <PlaceModal
          place={editingPlace}
          defaultLat={mapClickCoords?.lat}
          defaultLng={mapClickCoords?.lng}
          onSave={handleSavePlace}
          onClose={() => {
            setShowPlaceModal(false);
            setEditingPlace(null);
            setMapClickCoords(null);
          }}
        />
      )}
    </div>
  );
}
