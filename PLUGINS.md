# Guida ai Plugin

## 📦 Come Creare un Plugin

I plugin permettono di estendere l'applicazione senza modificare il core.

### Struttura Base

```typescript
import { Plugin } from '../core/types';

export const myPlugin: Plugin = {
  name: 'my-plugin',           // Nome univoco
  version: '1.0.0',            // Versione
  description: 'Descrizione',  // Opzionale
  
  // Lifecycle hooks
  init: async () => {
    // Inizializzazione
  },
  
  destroy: async () => {
    // Cleanup
  },
  
  // Componenti da iniettare
  components: [
    {
      name: 'MyComponent',
      component: MyComponent,
      position: 'sidebar',  // Dove iniettare
    }
  ],
};
```

### Posizioni Disponibili

- **header**: In alto, sotto la barra info viaggio
- **footer**: In basso, prima della navigazione
- **sidebar**: Nel pannello laterale
- **map-overlay**: Sovrapposto alla mappa
- **modal**: Come modal

### Esempio Completo

```typescript
import { Plugin } from '../core/types';
import { useAppContext } from '../core/store';

export const statsPlugin: Plugin = {
  name: 'stats-plugin',
  version: '1.0.0',
  
  components: [
    {
      name: 'StatsWidget',
      component: StatsWidget,
      position: 'sidebar',
    },
  ],
};

function StatsWidget() {
  const { state } = useAppContext();
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <h4 className="font-semibold">📊 Statistiche</h4>
      <p>Luoghi salvati: {state.places.length}</p>
      <p>Giorni di diario: {state.diaryEntries.length}</p>
    </div>
  );
}
```

## 🔌 Registrare un Plugin

```typescript
import { pluginManager } from './core/plugins';
import { myPlugin } from './plugins/my-plugin';

// In App.tsx o main.tsx
useEffect(() => {
  pluginManager.register(myPlugin);
  
  return () => {
    pluginManager.unregister('my-plugin');
  };
}, []);
```

## 🎨 Plugin con Hooks Custom

```typescript
export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  hooks: [
    {
      name: 'useCustomData',
      hook: useCustomData,
    }
  ],
};

function useCustomData() {
  const { state } = useAppContext();
  // Logica custom
  return { data: state.places };
}
```

## 🚀 Best Practices

1. **Nome univoco**: Usa un nome descrittivo e univoco
2. **Versioning**: Segui semantic versioning (MAJOR.MINOR.PATCH)
3. **Cleanup**: Implementa `destroy` per cleanup risorse
4. **TypeScript**: Usa tipi strict
5. **Documentazione**: Documenta il plugin con commenti

## 📚 Esempi di Plugin

- **Weather Widget**: Mostra meteo della destinazione
- **Budget Tracker**: Traccia spese del viaggio
- **Photo Gallery**: Galleria foto dei luoghi
- **Checklist**: Lista cose da portare
- **Translation**: Traduttore integrato
- **Currency Converter**: Convertitore valuta

## 🔧 Sviluppo Plugin

1. Crea cartella in `src/plugins/`
2. Implementa interfaccia `Plugin`
3. Testa localmente
4. Registra con `pluginManager`
5. Documenta in README

## 📦 Plugin di Terze Parti

In futuro potrai creare un marketplace di plugin:

```typescript
// Installa plugin da npm
import { weatherPlugin } from '@travel-planner/weather-plugin';

pluginManager.register(weatherPlugin);
```
