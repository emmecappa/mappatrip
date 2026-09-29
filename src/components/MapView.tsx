import { Place, AppMode } from '../core/types';
import MapViewLeaflet from './MapViewLeaflet';
import MapViewGoogle from './MapViewGoogle';

interface Props {
  places: Place[];
  onMapClick: (lat: number, lng: number) => void;
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onAddFromSearch: (lat: number, lng: number, name: string, placeId?: string) => void;
  apiKey: string;
  mode: AppMode;
}

export default function MapView({ places, onMapClick, selectedPlace, onSelectPlace, onAddFromSearch, apiKey, mode }: Props) {
  if (apiKey) {
    return (
      <MapViewGoogle
        places={places}
        onMapClick={onMapClick}
        selectedPlace={selectedPlace}
        onSelectPlace={onSelectPlace}
        onAddFromSearch={onAddFromSearch}
        apiKey={apiKey}
        mode={mode}
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
      mode={mode}
    />
  );
}
