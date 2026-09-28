import { useAppContext } from '../../../core/store';
import { Place } from '../../../core/types';

/**
 * Hook per gestire i luoghi
 */
export function usePlaces() {
  const { state, dispatch } = useAppContext();

  const addPlace = (place: Place) => {
    dispatch({ type: 'ADD_PLACE', payload: place });
  };

  const updatePlace = (place: Place) => {
    dispatch({ type: 'UPDATE_PLACE', payload: place });
  };

  const deletePlace = (id: string) => {
    dispatch({ type: 'DELETE_PLACE', payload: id });
  };

  const savePlace = (place: Place) => {
    const exists = state.places.find(p => p.id === place.id);
    if (exists) {
      updatePlace(place);
    } else {
      addPlace(place);
    }
  };

  return {
    places: state.places,
    addPlace,
    updatePlace,
    deletePlace,
    savePlace,
  };
}
