import { Place, DiaryEntry, TravelInfo, AppMode, TabType } from '../types';

/**
 * Storage Keys - Costanti per localStorage
 */
export const STORAGE_KEYS = {
  PLACES: 'travel_places',
  DIARY: 'travel_diary',
  TRAVEL_INFO: 'travel_info',
  APP_MODE: 'travel_mode',
  ACTIVE_TAB: 'travel_active_tab',
} as const;

/**
 * Default values
 */
export const DEFAULT_TRAVEL_INFO: TravelInfo = {
  destination: '',
  arrivalDate: new Date().toISOString().split('T')[0],
  departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  hotelName: '',
  hotelLink: '',
};

/**
 * Generic storage utilities
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.warn(`Error loading ${key} from storage:`, error);
  }
  return defaultValue;
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving ${key} to storage:`, error);
  }
}

/**
 * State interface
 */
export interface AppState {
  places: Place[];
  diaryEntries: DiaryEntry[];
  travelInfo: TravelInfo;
  appMode: AppMode;
  activeTab: TabType;
  selectedPlace: Place | null;
  showPlaceModal: boolean;
  editingPlace: Place | null;
  pendingAddPlace: { lat: number; lng: number; name: string } | null;
}

/**
 * Initial state
 */
export function getInitialState(): AppState {
  return {
    places: loadFromStorage(STORAGE_KEYS.PLACES, []),
    diaryEntries: loadFromStorage(STORAGE_KEYS.DIARY, []),
    travelInfo: loadFromStorage(STORAGE_KEYS.TRAVEL_INFO, DEFAULT_TRAVEL_INFO),
    appMode: loadFromStorage(STORAGE_KEYS.APP_MODE, 'planning' as AppMode),
    activeTab: loadFromStorage(STORAGE_KEYS.ACTIVE_TAB, 'map' as TabType),
    selectedPlace: null,
    showPlaceModal: false,
    editingPlace: null,
    pendingAddPlace: null,
  };
}
