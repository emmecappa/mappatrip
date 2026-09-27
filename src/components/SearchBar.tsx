import { useState, useEffect, useRef } from 'react';

interface SearchResult {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  tags: Record<string, string>;
}

interface Props {
  onSelect: (lat: number, lng: number, name: string) => void;
  onPreview?: (lat: number, lng: number) => void;
}

export default function SearchBar({ onSelect, onPreview }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState<'places' | 'businesses'>('places');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      setError('');
      
      try {
        if (searchMode === 'businesses') {
          // Overpass API per attività commerciali
          await searchOverpass(query);
        } else {
          // Nominatim per luoghi generali
          await searchNominatim(query);
        }
      } catch (err) {
        setError('Errore nella ricerca. Riprova.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, searchMode]);

  const searchNominatim = async (query: string) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) throw new Error('Errore nella ricerca');
    
    const data = await response.json();
    const results: SearchResult[] = data.map((item: any) => ({
      id: item.place_id,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      name: item.display_name.split(',')[0],
      type: item.type,
      tags: { display_name: item.display_name, class: item.class }
    }));
    
    setResults(results);
    setShowResults(true);
  };

  const searchOverpass = async (query: string) => {
    // Query Overpass per cercare attività commerciali (ricerca globale)
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["name"~"${query}",i];
        way["name"~"${query}",i];
        relation["name"~"${query}",i];
      );
      out center 10;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.ok) throw new Error('Errore nella ricerca');
    
    const data = await response.json();
    const results: SearchResult[] = data.elements
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        lat: el.lat || el.center?.lat || 0,
        lon: el.lon || el.center?.lon || 0,
        name: el.tags.name,
        type: el.tags.amenity || el.tags.shop || el.tags.tourism || 'place',
        tags: el.tags
      }));

    setResults(results);
    setShowResults(true);
  };

  const handleSelect = (result: SearchResult) => {
    onSelect(result.lat, result.lon, result.name);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handlePreview = (result: SearchResult) => {
    if (onPreview) {
      onPreview(result.lat, result.lon);
    }
  };

  const getCategoryIcon = (result: SearchResult): string => {
    const tags = result.tags;
    
    // Priorità alle tag specifiche
    if (tags.amenity === 'restaurant' || tags.cuisine) return '🍽️';
    if (tags.amenity === 'cafe') return '☕';
    if (tags.amenity === 'bar' || tags.amenity === 'pub') return '🍺';
    if (tags.amenity === 'fast_food') return '🍔';
    if (tags.shop) return '🛍️';
    if (tags.tourism === 'hotel') return '🏨';
    if (tags.tourism === 'museum') return '🏛️';
    if (tags.tourism === 'attraction') return '🎯';
    if (tags.leisure) return '🎮';
    if (tags.historic) return '🏛️';
    if (tags.natural) return '🌿';
    
    // Fallback per classe
    const classMap: Record<string, string> = {
      'amenity': '🏛️',
      'tourism': '🎯',
      'restaurant': '🍽️',
      'food': '🍽️',
      'shop': '🛍️',
      'leisure': '🎮',
      'historic': '🏛️',
      'natural': '🌿',
      'place': '📍',
    };
    
    return classMap[result.type] || '📍';
  };

  const getCategoryLabel = (result: SearchResult): string => {
    const tags = result.tags;
    
    if (tags.amenity === 'restaurant') return tags.cuisine ? `Ristorante (${tags.cuisine})` : 'Ristorante';
    if (tags.amenity === 'cafe') return 'Caffè';
    if (tags.amenity === 'bar' || tags.amenity === 'pub') return 'Bar/Pub';
    if (tags.amenity === 'fast_food') return 'Fast Food';
    if (tags.shop) return `Negozio (${tags.shop})`;
    if (tags.tourism === 'hotel') return 'Hotel';
    if (tags.tourism === 'museum') return 'Museo';
    if (tags.tourism === 'attraction') return 'Attrazione';
    
    return result.type;
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setSearchMode('places')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            searchMode === 'places'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          📍 Luoghi
        </button>
        <button
          onClick={() => setSearchMode('businesses')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            searchMode === 'businesses'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          🏪 Attività
        </button>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {isSearching ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={searchMode === 'businesses' 
            ? "Cerca ristoranti, negozi, bar..." 
            : "Cerca luoghi, città, monumenti..."}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-slate-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto scrollbar-thin">
          {results.map((result) => (
            <div
              key={`${result.id}-${result.lat}`}
              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors group"
              onClick={() => handleSelect(result)}
              onMouseEnter={() => handlePreview(result)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getCategoryIcon(result)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {result.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getCategoryLabel(result)}
                  </p>
                  {result.tags['addr:street'] && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      📍 {result.tags['addr:street']} {result.tags['addr:housenumber'] || ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(result);
                  }}
                  className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-all shrink-0"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full mt-2 w-full bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 z-50">
          {error}
        </div>
      )}

      {/* No results */}
      {showResults && results.length === 0 && query.length >= 3 && !isSearching && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 p-4 text-center z-50">
          <p className="text-sm text-slate-500">Nessun risultato trovato</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchMode === 'businesses' 
              ? 'Prova con un nome specifico di attività'
              : 'Prova con un nome diverso'}
          </p>
        </div>
      )}
    </div>
  );
}
