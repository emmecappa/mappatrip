import { useEffect } from 'react';
import { AppProvider, useAppContext, pluginManager } from './core';
import TravelInfoBar from './features/travel-info/components/TravelInfoBar';
import PlaceCard from './features/places/components/PlaceCard';
import MapView from './components/MapView';
import PlaceModal from './components/PlaceModal';
import PlacesList from './components/PlacesList';
import DailyDiary from './components/DailyDiary';
import SettingsPanel from './components/SettingsPanel';
import { Place, DiaryEntry, TabType } from './core/types';

function AppContent() {
  const { state, dispatch } = useAppContext();
  const { activeTab, appMode, places, travelInfo, selectedPlace, showPlaceModal, editingPlace, pendingAddPlace } = state;

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || travelInfo.googleMapsApiKey;

  // Initialize plugins
  useEffect(() => {
    console.log('🚀 Travel Planner initialized');
    console.log(`🔌 Plugins registrati: ${pluginManager.getAll().length}`);
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    if (appMode === 'visit') return;
    dispatch({ type: 'SET_PENDING_ADD_PLACE', payload: { lat, lng, name: '' } });
    dispatch({ type: 'SET_EDITING_PLACE', payload: null });
    dispatch({ type: 'SHOW_PLACE_MODAL', payload: true });
  };

  const handleAddFromSearch = (lat: number, lng: number, name: string) => {
    dispatch({ type: 'SET_PENDING_ADD_PLACE', payload: { lat, lng, name } });
    dispatch({ type: 'SET_EDITING_PLACE', payload: null });
    dispatch({ type: 'SHOW_PLACE_MODAL', payload: true });
  };

  const handleSavePlace = (place: Place) => {
    const exists = places.find(p => p.id === place.id);
    if (exists) {
      dispatch({ type: 'UPDATE_PLACE', payload: place });
    } else {
      dispatch({ type: 'ADD_PLACE', payload: place });
    }
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const handleDeletePlace = (id: string) => {
    dispatch({ type: 'DELETE_PLACE', payload: id });
    dispatch({ type: 'SELECT_PLACE', payload: null });
  };

  const handleEditPlace = (place: Place) => {
    dispatch({ type: 'SET_EDITING_PLACE', payload: place });
    dispatch({ type: 'SET_PENDING_ADD_PLACE', payload: null });
    dispatch({ type: 'SHOW_PLACE_MODAL', payload: true });
    dispatch({ type: 'SELECT_PLACE', payload: null });
  };

  const handleSaveDiary = (entry: DiaryEntry) => {
    const exists = state.diaryEntries.find(e => e.id === entry.id);
    if (exists) {
      dispatch({ type: 'UPDATE_DIARY_ENTRY', payload: entry });
    } else {
      dispatch({ type: 'ADD_DIARY_ENTRY', payload: entry });
    }
  };

  const handleDeleteDiary = (id: string) => {
    dispatch({ type: 'DELETE_DIARY_ENTRY', payload: id });
  };

  const handleCloseModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const setActiveTab = (tab: TabType) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  const setAppMode = (mode: 'planning' | 'visit') => {
    dispatch({ type: 'SET_APP_MODE', payload: mode });
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'map', label: 'Mappa', icon: '🗺️' },
    { id: 'places', label: 'Luoghi', icon: '📍' },
    { id: 'diary', label: 'Diario', icon: '📖' },
    { id: 'settings', label: 'Info', icon: '⚙️' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <TravelInfoBar />

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

      {/* Plugin components - header */}
      {pluginManager.getComponentsByPosition('header').map(({ name, component: Component }) => (
        <Component key={name} />
      ))}

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`flex-1 relative ${activeTab !== 'map' ? 'hidden lg:block' : ''}`}>
          <div className="absolute inset-3">
            <MapView
              places={places}
              onMapClick={handleMapClick}
              selectedPlace={selectedPlace}
              onSelectPlace={(place) => dispatch({ type: 'SELECT_PLACE', payload: place })}
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
                onClose={() => dispatch({ type: 'SELECT_PLACE', payload: null })}
              />
            </div>
          )}

          {/* Plugin components - map-overlay */}
          {pluginManager.getComponentsByPosition('map-overlay').map(({ name, component: Component }) => (
            <Component key={name} />
          ))}
        </div>

        <div className={`w-full lg:w-96 xl:w-[420px] bg-slate-50 border-l border-slate-200 overflow-y-auto ${activeTab === 'map' ? 'hidden lg:block' : ''}`}>
          <div className="p-4 pb-20 lg:pb-4">
            {activeTab === 'places' && (
              <PlacesList
                places={places}
                onSelect={(place) => {
                  dispatch({ type: 'SELECT_PLACE', payload: place });
                  setActiveTab('map');
                }}
                onAdd={() => {
                  dispatch({ type: 'SET_PENDING_ADD_PLACE', payload: null });
                  dispatch({ type: 'SET_EDITING_PLACE', payload: null });
                  dispatch({ type: 'SHOW_PLACE_MODAL', payload: true });
                }}
              />
            )}
            {activeTab === 'diary' && (
              <DailyDiary
                entries={state.diaryEntries}
                onSave={handleSaveDiary}
                onDelete={handleDeleteDiary}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel
                travelInfo={travelInfo}
                onSave={(info) => dispatch({ type: 'SET_TRAVEL_INFO', payload: info })}
              />
            )}

            {/* Plugin components - sidebar */}
            {pluginManager.getComponentsByPosition('sidebar').map(({ name, component: Component }) => (
              <Component key={name} />
            ))}
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

      {showPlaceModal && (
        <PlaceModal
          place={editingPlace}
          pendingAdd={pendingAddPlace}
          onSave={handleSavePlace}
          onClose={handleCloseModal}
        />
      )}

      {/* Plugin components - footer */}
      {pluginManager.getComponentsByPosition('footer').map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
