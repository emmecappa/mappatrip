import { useAppContext } from '../../../core/store';
import { TravelInfo, AppMode, TabType } from '../../../core/types';
import { getDaysPassed, getDaysRemaining, getDaysBetween } from '../../../core/utils';

/**
 * Hook per gestire le info viaggio
 */
export function useTravelInfo() {
  const { state, dispatch } = useAppContext();

  const updateTravelInfo = (info: TravelInfo) => {
    dispatch({ type: 'SET_TRAVEL_INFO', payload: info });
  };

  const setAppMode = (mode: AppMode) => {
    dispatch({ type: 'SET_APP_MODE', payload: mode });
  };

  const setActiveTab = (tab: TabType) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  const daysPassed = getDaysPassed(state.travelInfo.arrivalDate);
  const daysRemaining = getDaysRemaining(state.travelInfo.departureDate);
  const totalDays = getDaysBetween(state.travelInfo.arrivalDate, state.travelInfo.departureDate);

  return {
    travelInfo: state.travelInfo,
    appMode: state.appMode,
    activeTab: state.activeTab,
    daysPassed,
    daysRemaining,
    totalDays,
    updateTravelInfo,
    setAppMode,
    setActiveTab,
  };
}
