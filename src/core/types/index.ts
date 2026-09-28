// Core types for the entire application
export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  instagram?: string;
  impressions: string;
  photos: string[];
  notes: string;
  youtubeLinks: string[];
  category: PlaceCategory;
  visited: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PlaceCategory = 'restaurant' | 'attraction' | 'hotel' | 'activity' | 'other';

export interface DiaryEntry {
  id: string;
  date: string;
  planned: string[];
  done: string[];
  notes: string;
}

export interface TravelInfo {
  destination: string;
  arrivalDate: string;
  departureDate: string;
  hotelName: string;
  hotelLink: string;
  googleMapsApiKey?: string;
}

export type AppMode = 'planning' | 'visit';
export type TabType = 'map' | 'places' | 'diary' | 'settings';

// Plugin system types
export interface Plugin {
  name: string;
  version: string;
  description?: string;
  init?: () => Promise<void> | void;
  destroy?: () => Promise<void> | void;
  components?: PluginComponent[];
  hooks?: PluginHook[];
  routes?: PluginRoute[];
}

export interface PluginComponent {
  name: string;
  component: React.ComponentType<any>;
  position: 'header' | 'footer' | 'sidebar' | 'map-overlay' | 'modal';
}

export interface PluginHook {
  name: string;
  hook: Function;
}

export interface PluginRoute {
  path: string;
  component: React.ComponentType<any>;
}
