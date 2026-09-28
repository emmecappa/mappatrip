import { Plugin } from '../core/types';

/**
 * Esempio di Plugin - Weather Widget
 * Mostra un widget meteo nella sidebar
 */
export const weatherPlugin: Plugin = {
  name: 'weather-widget',
  version: '1.0.0',
  description: 'Widget meteo per la destinazione del viaggio',

  init: async () => {
    console.log('🌤️ Weather Widget plugin initialized');
  },

  destroy: async () => {
    console.log('🌤️ Weather Widget plugin destroyed');
  },

  components: [
    {
      name: 'WeatherWidget',
      component: WeatherWidget,
      position: 'sidebar',
    },
  ],
};

function WeatherWidget() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mt-4">
      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <span>🌤️</span>
        Meteo
      </h4>
      <p className="text-sm text-gray-600">
        Widget meteo placeholder. Integra con API come OpenWeatherMap per mostrare il meteo della destinazione.
      </p>
    </div>
  );
}
