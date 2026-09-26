import { DiaryEntry } from '../types';
import { useState } from 'react';

interface Props {
  entries: DiaryEntry[];
  onSave: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
}

export default function DailyDiary({ entries, onSave, onDelete }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPlanned, setNewPlanned] = useState('');
  const [newDone, setNewDone] = useState('');
  const [diaryNotes, setDiaryNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const currentEntry = entries.find(e => e.date === selectedDate);

  const handleSave = () => {
    const entry: DiaryEntry = {
      id: currentEntry?.id || Date.now().toString(),
      date: selectedDate,
      planned: currentEntry?.planned || [],
      done: currentEntry?.done || [],
      notes: diaryNotes,
    };
    onSave(entry);
    setIsEditing(false);
  };

  const addPlanned = () => {
    if (!newPlanned.trim()) return;
    const updated = [...(currentEntry?.planned || []), newPlanned.trim()];
    const entry: DiaryEntry = {
      id: currentEntry?.id || Date.now().toString(),
      date: selectedDate,
      planned: updated,
      done: currentEntry?.done || [],
      notes: currentEntry?.notes || '',
    };
    onSave(entry);
    setNewPlanned('');
  };

  const addDone = () => {
    if (!newDone.trim()) return;
    const updated = [...(currentEntry?.done || []), newDone.trim()];
    const entry: DiaryEntry = {
      id: currentEntry?.id || Date.now().toString(),
      date: selectedDate,
      planned: currentEntry?.planned || [],
      done: updated,
      notes: currentEntry?.notes || '',
    };
    onSave(entry);
    setNewDone('');
  };

  const removePlanned = (idx: number) => {
    const updated = (currentEntry?.planned || []).filter((_, i) => i !== idx);
    const entry: DiaryEntry = {
      id: currentEntry?.id || Date.now().toString(),
      date: selectedDate,
      planned: updated,
      done: currentEntry?.done || [],
      notes: currentEntry?.notes || '',
    };
    onSave(entry);
  };

  const removeDone = (idx: number) => {
    const updated = (currentEntry?.done || []).filter((_, i) => i !== idx);
    const entry: DiaryEntry = {
      id: currentEntry?.id || Date.now().toString(),
      date: selectedDate,
      planned: currentEntry?.planned || [],
      done: updated,
      notes: currentEntry?.notes || '',
    };
    onSave(entry);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <span className="text-2xl">📅</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setIsEditing(false);
            setDiaryNotes('');
          }}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          {isEditing ? 'Annulla' : '✏️ Modifica note'}
        </button>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 capitalize">{formatDate(selectedDate)}</h3>
      </div>

      {/* Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Planned */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
            📋 Piano della giornata
          </h4>
          <div className="diary-roadmap">
            {(currentEntry?.planned || []).map((item, idx) => (
              <div key={idx} className="roadmap-item">
                <div className="flex items-start gap-2">
                  <p className="text-sm text-gray-700 flex-1">{item}</p>
                  <button
                    onClick={() => removePlanned(idx)}
                    className="text-gray-400 hover:text-red-500 text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newPlanned}
              onChange={(e) => setNewPlanned(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlanned()}
              placeholder="Aggiungi attività..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addPlanned}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Done */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
            ✅ Cosa ho fatto
          </h4>
          <div className="diary-roadmap">
            {(currentEntry?.done || []).map((item, idx) => (
              <div key={idx} className="roadmap-item done">
                <div className="flex items-start gap-2">
                  <p className="text-sm text-gray-700 flex-1 line-through opacity-75">{item}</p>
                  <button
                    onClick={() => removeDone(idx)}
                    className="text-gray-400 hover:text-red-500 text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newDone}
              onChange={(e) => setNewDone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDone()}
              placeholder="Cosa ho fatto..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={addDone}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Notes editing */}
      {isEditing && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-2">📝 Note del giorno</h4>
          <textarea
            value={diaryNotes || currentEntry?.notes || ''}
            onChange={(e) => setDiaryNotes(e.target.value)}
            placeholder="Come è andata la giornata? Ricordi speciali..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={handleSave}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
          >
            💾 Salva note
          </button>
        </div>
      )}

      {/* Diary timeline */}
      {entries.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-3">📖 Riepilogo giorni</h4>
          <div className="space-y-2">
            {entries.sort((a, b) => b.date.localeCompare(a.date)).map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  entry.date === selectedDate ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDate(entry.date)}
              >
                <span className="text-xs font-medium text-gray-500 w-20">
                  {new Date(entry.date + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs text-blue-600">📋 {entry.planned.length}</span>
                  <span className="text-xs text-green-600">✅ {entry.done.length}</span>
                </div>
                {entry.notes && <span className="text-xs text-gray-400">📝</span>}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                  className="text-gray-400 hover:text-red-500 text-xs"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
