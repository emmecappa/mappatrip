import { useTravelInfo } from '../../../features/travel-info';
import { formatDate } from '../../../core/utils';

export default function TravelInfoBar() {
  const { travelInfo, daysPassed, daysRemaining, totalDays } = useTravelInfo();
  
  const progress = totalDays > 0 ? Math.min(100, Math.max(0, (daysPassed / totalDays) * 100)) : 0;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Destination */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{travelInfo.destination || 'Il tuo viaggio'}</h1>
              <p className="text-xs text-gray-500">
                {formatDate(travelInfo.arrivalDate)} → {formatDate(travelInfo.departureDate)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center px-3 py-1 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Passati</p>
              <p className="text-lg font-bold text-green-700">{daysPassed}</p>
            </div>
            <div className="text-center px-3 py-1 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Rimanenti</p>
              <p className="text-lg font-bold text-blue-700">{daysRemaining}</p>
            </div>
            <div className="text-center px-3 py-1 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">Totale</p>
              <p className="text-lg font-bold text-purple-700">{totalDays}</p>
            </div>
          </div>

          {/* Hotel Link */}
          {travelInfo.hotelLink && (
            <a
              href={travelInfo.hotelLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
            >
              <span className="text-lg">🏨</span>
              <div>
                <p className="text-xs text-amber-600 font-medium">Hotel</p>
                <p className="text-sm font-semibold text-amber-800">{travelInfo.hotelName || 'Il tuo hotel'}</p>
              </div>
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
