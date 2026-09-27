import { useState, useEffect } from 'react';
import { Place, DiaryEntry, TravelInfo, TabType } from './types';
import TravelInfoBar from './components/TravelInfoBar';
import MapView from './components/MapView';
import GoogleMapView from './components/GoogleMapView';
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
  const [places, setPlaces] = useState<Place[]>(() => loadFromStorage('travel_places', []));
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => loadFromStorage('travel_diary', []));
  const [travelInfo, setTravelInfo] = useState<TravelInfo>(() => loadFromStorage('travel_info', defaultTravelInfo));
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [mapClickCoords, setMapClickCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Leggi API key da variabile d'ambiente o da localStorage
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

  const handleMapClick = (lat: number, lng: number) => {
    setMapClickCoords({ lat, lng });
    setEditingPlace(null);
    setShowPlaceModal(true);
  };

  const handleSearchSelect = (lat: number, lng: number, name: string) => {
    setMapClickCoords({ lat, lng });
    setEditingPlace({
      id: '',
      name,
      lat,
      lng,
      impressions: '',
      photos: [],
      notes: '',
      youtubeLinks: [],
      category: 'attraction',
      visited: false,
    });
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
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Travel Info Bar */}
      <TravelInfoBar travelInfo={travelInfo} />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map area */}
        <div className={`flex-1 relative ${activeTab !== 'map' ? 'hidden lg:block' : ''}`}>
          <div className="absolute inset-3">
            {googleMapsApiKey ? (
              <GoogleMapView
                places={places}
                onMapClick={handleMapClick}
                selectedPlace={selectedPlace}
                onSelectPlace={setSelectedPlace}
                onSearchSelect={handleSearchSelect}
                apiKey={googleMapsApiKey}
              />
            ) : (
              <MapView
                places={places}
                onMapClick={handleMapClick}
                selectedPlace={selectedPlace}
                onSelectPlace={setSelectedPlace}
                onSearchSelect={handleSearchSelect}
              />
            )}
          </div>

          {/* Place Card overlay */}
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

          {/* FAB */}
          <button
            onClick={() => {
              setEditingPlace(null);
              setMapClickCoords(null);
              setShowPlaceModal(true);
            }}
            className="absolute bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110"
            title="Aggiungi luogo"
          >
            +
          </button>
        </div>

        {/* Side panel */}
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

      {/* Bottom nav - mobile */}
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

      {/* Desktop sidebar nav */}
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
