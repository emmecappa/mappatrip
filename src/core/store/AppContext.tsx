import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Place, DiaryEntry, TravelInfo, AppMode, TabType } from '../types';
import { AppState, getInitialState, STORAGE_KEYS, saveToStorage } from './storage';

/**
 * Action types
 */
type Action =
  | { type: 'SET_PLACES'; payload: Place[] }
  | { type: 'ADD_PLACE'; payload: Place }
  | { type: 'UPDATE_PLACE'; payload: Place }
  | { type: 'DELETE_PLACE'; payload: string }
  | { type: 'SET_DIARY_ENTRIES'; payload: DiaryEntry[] }
  | { type: 'ADD_DIARY_ENTRY'; payload: DiaryEntry }
  | { type: 'UPDATE_DIARY_ENTRY'; payload: DiaryEntry }
  | { type: 'DELETE_DIARY_ENTRY'; payload: string }
  | { type: 'SET_TRAVEL_INFO'; payload: TravelInfo }
  | { type: 'SET_APP_MODE'; payload: AppMode }
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'SELECT_PLACE'; payload: Place | null }
  | { type: 'SHOW_PLACE_MODAL'; payload: boolean }
  | { type: 'SET_EDITING_PLACE'; payload: Place | null }
  | { type: 'SET_PENDING_ADD_PLACE'; payload: { lat: number; lng: number; name: string; googlePlaceId?: string } | null }
  | { type: 'CLOSE_MODAL' };

/**
 * Reducer
 */
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PLACES':
      return { ...state, places: action.payload };
    
    case 'ADD_PLACE':
      return { ...state, places: [...state.places, action.payload] };
    
    case 'UPDATE_PLACE':
      return {
        ...state,
        places: state.places.map(p => p.id === action.payload.id ? action.payload : p),
      };
    
    case 'DELETE_PLACE':
      return {
        ...state,
        places: state.places.filter(p => p.id !== action.payload),
        selectedPlace: state.selectedPlace?.id === action.payload ? null : state.selectedPlace,
      };
    
    case 'SET_DIARY_ENTRIES':
      return { ...state, diaryEntries: action.payload };
    
    case 'ADD_DIARY_ENTRY':
      return { ...state, diaryEntries: [...state.diaryEntries, action.payload] };
    
    case 'UPDATE_DIARY_ENTRY':
      return {
        ...state,
        diaryEntries: state.diaryEntries.map(e => e.id === action.payload.id ? action.payload : e),
      };
    
    case 'DELETE_DIARY_ENTRY':
      return {
        ...state,
        diaryEntries: state.diaryEntries.filter(e => e.id !== action.payload),
      };
    
    case 'SET_TRAVEL_INFO':
      return { ...state, travelInfo: action.payload };
    
    case 'SET_APP_MODE':
      return { ...state, appMode: action.payload };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SELECT_PLACE':
      return { ...state, selectedPlace: action.payload };
    
    case 'SHOW_PLACE_MODAL':
      return { ...state, showPlaceModal: action.payload };
    
    case 'SET_EDITING_PLACE':
      return { ...state, editingPlace: action.payload };
    
    case 'SET_PENDING_ADD_PLACE':
      return { ...state, pendingAddPlace: action.payload };
    
    case 'CLOSE_MODAL':
      return {
        ...state,
        showPlaceModal: false,
        editingPlace: null,
        pendingAddPlace: null,
      };
    
    default:
      return state;
  }
}

/**
 * Context
 */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Provider
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  // Persist state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PLACES, state.places);
  }, [state.places]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DIARY, state.diaryEntries);
  }, [state.diaryEntries]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TRAVEL_INFO, state.travelInfo);
  }, [state.travelInfo]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.APP_MODE, state.appMode);
  }, [state.appMode]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_TAB, state.activeTab);
  }, [state.activeTab]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
