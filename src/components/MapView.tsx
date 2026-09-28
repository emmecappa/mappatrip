import { Place } from '../types';
import MapViewLeaflet from './MapViewLeaflet';
import MapViewGoogle from './MapViewGoogle';

interface Props {
  places: Place[];
  onMapClick: (lat: number, lng: number) => void;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onAddFromSearch: (lat: number, lng: number, name: string) => void;
  apiKey: string;
}

export default function MapView({ places, onMapClick, selectedPlace, onSelectPlace, onAddFromSearch, apiKey }: Props) {
  if (apiKey) {
    return (
      <MapViewGoogle
        places={places}
        onMapClick={onMapClick}
        selectedPlace={selectedPlace}
        onSelectPlace={onSelectPlace}
        onAddFromSearch={onAddFromSearch}
        apiKey={apiKey}
      />
    );
  }

  return (
    <MapViewLeaflet
      places={places}
      onMapClick={onMapClick}
      selectedPlace={selectedPlace}
      onSelectPlace={onSelectPlace}
      onAddFromSearch={onAddFromSearch}
    />
  );
}
