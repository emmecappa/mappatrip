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
  category: 'restaurant' | 'attraction' | 'hotel' | 'activity' | 'other';
  visited: boolean;
}

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
}

export type TabType = 'map' | 'places' | 'diary' | 'settings';
