import { useAppContext } from '../../../core/store';
import { DiaryEntry } from '../../../core/types';

/**
 * Hook per gestire il diario
 */
export function useDiary() {
  const { state, dispatch } = useAppContext();

  const addEntry = (entry: DiaryEntry) => {
    dispatch({ type: 'ADD_DIARY_ENTRY', payload: entry });
  };

  const updateEntry = (entry: DiaryEntry) => {
    dispatch({ type: 'UPDATE_DIARY_ENTRY', payload: entry });
  };

  const deleteEntry = (id: string) => {
    dispatch({ type: 'DELETE_DIARY_ENTRY', payload: id });
  };

  const saveEntry = (entry: DiaryEntry) => {
    const exists = state.diaryEntries.find(e => e.id === entry.id);
    if (exists) {
      updateEntry(entry);
    } else {
      addEntry(entry);
    }
  };

  const getEntryByDate = (date: string) => {
    return state.diaryEntries.find(e => e.date === date);
  };

  return {
    entries: state.diaryEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    saveEntry,
    getEntryByDate,
  };
}
